"""
Organization context dependency for CRUD API.

Reads:
  - Authorization: Bearer <jwt> → user_id, customer_id
  - X-Organization-Id: <uuid> → validates user has access to this org

The JWT from platform service contains:
  {
    "sub": "user-uuid",
    "customer_id": "customer-uuid",
    "email": "...",
    "is_customer_admin": true,
    "organizations": [
      {"id": "org-uuid", "name": "...", "code": "...", "role": "admin", "is_default": true}
    ]
  }

We validate the org against the JWT's organizations list (no DB call needed).
"""
import uuid
from typing import Optional
from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from pydantic import BaseModel

# Use same JWT settings as platform service
JWT_SECRET_KEY = "afda-super-secret-key-change-in-production-2024"
JWT_ALGORITHM = "HS256"

security = HTTPBearer(auto_error=False)


class OrgContext(BaseModel):
    """Resolved organization context for a CRUD API request."""
    user_id: uuid.UUID
    customer_id: uuid.UUID
    organization_id: uuid.UUID
    email: str
    display_name: str = ""
    is_customer_admin: bool = False
    role_in_org: str = "viewer"
    organizations: list[dict] = []

    class Config:
        arbitrary_types_allowed = True


def _decode_jwt(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")


async def get_org_context(
    x_organization_id: Optional[str] = Header(None, alias="X-Organization-Id"),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> OrgContext:
    """
    Extract user + org context from JWT + X-Organization-Id header.
    No DB call required — validates against JWT's organizations list.
    """
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    payload = _decode_jwt(credentials.credentials)

    if payload.get("type") != "access":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")

    user_id = payload.get("sub")
    customer_id = payload.get("customer_id")
    if not user_id or not customer_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    orgs = payload.get("organizations", [])
    is_customer_admin = payload.get("is_customer_admin", False)

    # Resolve organization
    if x_organization_id:
        try:
            org_uuid = uuid.UUID(x_organization_id)
        except ValueError:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid X-Organization-Id format")
    else:
        # Fall back to default org from JWT
        default_org = next((o for o in orgs if o.get("is_default")), None)
        if not default_org and orgs:
            default_org = orgs[0]
        if not default_org:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No organization available")
        org_uuid = uuid.UUID(default_org["id"])

    # Validate user has access to this org
    matching_org = next((o for o in orgs if o.get("id") == str(org_uuid)), None)

    if not matching_org and not is_customer_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this organization",
        )

    role_in_org = matching_org.get("role", "viewer") if matching_org else "admin"

    return OrgContext(
        user_id=uuid.UUID(user_id),
        customer_id=uuid.UUID(customer_id),
        organization_id=org_uuid,
        email=payload.get("email", ""),
        display_name=payload.get("display_name", ""),
        is_customer_admin=is_customer_admin,
        role_in_org=role_in_org,
        organizations=orgs,
    )


async def get_current_user_id(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> uuid.UUID:
    """Lightweight dependency — just extracts user_id from JWT."""
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    payload = _decode_jwt(credentials.credentials)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    return uuid.UUID(user_id)
