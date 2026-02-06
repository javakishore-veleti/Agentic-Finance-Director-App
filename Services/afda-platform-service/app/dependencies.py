"""
Shared dependencies for Platform Service.
- get_current_user: extracts user from JWT Bearer token
- get_org_context: reads X-Organization-Id header + validates access
"""
import uuid
from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.auth.jwt import decode_token
from app.modules.identity.models import User, UserOrganization, Organization

security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Extract and validate user from JWT token."""
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    payload = decode_token(credentials.credentials)
    if not payload or payload.get("type") != "access":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
    user = result.scalar_one_or_none()
    if not user or user.status != "active":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")

    return user


class OrgContext:
    """Resolved organization context for a request."""
    def __init__(self, organization_id: uuid.UUID, organization: Organization,
                 user_org: UserOrganization | None, role_name: str | None):
        self.organization_id = organization_id
        self.organization = organization
        self.user_org = user_org
        self.role_name = role_name


async def get_org_context(
    x_organization_id: str = Header(None, alias="X-Organization-Id"),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> OrgContext:
    """
    Resolve organization context from X-Organization-Id header.
    Validates user has access to the requested org.
    """
    if not x_organization_id:
        # Fall back to user's default org
        result = await db.execute(
            select(UserOrganization)
            .where(UserOrganization.user_id == user.id, UserOrganization.is_default == True)
        )
        default_uo = result.scalar_one_or_none()
        if not default_uo:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No X-Organization-Id header and no default org set"
            )
        x_organization_id = str(default_uo.organization_id)

    try:
        org_uuid = uuid.UUID(x_organization_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid organization ID format")

    # Verify org exists and belongs to user's customer
    result = await db.execute(
        select(Organization).where(
            Organization.id == org_uuid,
            Organization.customer_id == user.customer_id
        )
    )
    org = result.scalar_one_or_none()
    if not org:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Organization not found or access denied")

    # Check user has membership in this org
    result = await db.execute(
        select(UserOrganization).where(
            UserOrganization.user_id == user.id,
            UserOrganization.organization_id == org_uuid,
            UserOrganization.status == "active"
        )
    )
    user_org = result.scalar_one_or_none()

    # Customer admins can access any org within their customer even without membership
    if not user_org and not user.is_customer_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No access to this organization")

    role_name = None
    if user_org:
        from app.modules.identity.models import Role
        role_result = await db.execute(select(Role).where(Role.id == user_org.role_id))
        role = role_result.scalar_one_or_none()
        role_name = role.name if role else None

    return OrgContext(
        organization_id=org_uuid,
        organization=org,
        user_org=user_org,
        role_name=role_name
    )
