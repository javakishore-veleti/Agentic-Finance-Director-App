#!/bin/bash
###############################################################################
# 23_platform_service_api_auth.sh
# Populates: All DTOs, DAOs, services, routers for platform service
# Moves: Auth (login/signup/refresh/me) from CRUD API → Platform Service
# Adds: JWT middleware, org-context dependency, user-org resolution
# Run from: git repo root (Agentic-Finance-Director-App/)
###############################################################################
set -e

SVC="Services/afda-platform-service"
APP="$SVC/app"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  [23] Platform Service API + Auth Migration                  ║"
echo "║  Auth, Users, Orgs, Roles, Access Policies, Config          ║"
echo "╚══════════════════════════════════════════════════════════════╝"

# ═══════════════════════════════════════════════════════════════
# PART 1: AUTH UTILITIES (JWT + password hashing)
# ═══════════════════════════════════════════════════════════════
mkdir -p "$APP/auth"

cat > "$APP/auth/__init__.py" << 'EOF'
EOF

cat > "$APP/auth/jwt.py" << 'PYEOF'
"""JWT token creation and validation."""
import uuid
from datetime import datetime, timedelta
from jose import jwt, JWTError
from app.config import get_settings

settings = get_settings()


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "iat": datetime.utcnow(), "type": "access"})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode = {"sub": user_id, "exp": expire, "iat": datetime.utcnow(), "type": "refresh"}
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        return None
PYEOF

cat > "$APP/auth/password.py" << 'PYEOF'
"""Password hashing with bcrypt."""
import bcrypt


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))
PYEOF

echo "  ✅ auth/jwt.py + auth/password.py"

# ═══════════════════════════════════════════════════════════════
# PART 2: DEPENDENCIES (get_current_user, get_org_context)
# ═══════════════════════════════════════════════════════════════
cat > "$APP/dependencies.py" << 'PYEOF'
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
PYEOF

echo "  ✅ dependencies.py — get_current_user, get_org_context"

# ═══════════════════════════════════════════════════════════════
# PART 3: IDENTITY MODULE — DTOs
# ═══════════════════════════════════════════════════════════════
cat > "$APP/modules/identity/dtos.py" << 'PYEOF'
"""Identity DTOs: Auth, User, Role schemas."""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
import uuid


# ── Auth ───────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    email: str
    password: str

class SignupRequest(BaseModel):
    email: str
    password: str = Field(min_length=6)
    display_name: str
    company_name: Optional[str] = None  # creates customer + default org

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int

class RefreshRequest(BaseModel):
    refresh_token: str


# ── User ───────────────────────────────────────────────────────
class UserOut(BaseModel):
    id: uuid.UUID
    customer_id: uuid.UUID
    email: str
    display_name: str
    avatar_url: Optional[str] = None
    status: str
    is_customer_admin: bool
    last_login_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class UserProfileOut(UserOut):
    """Extended profile with org memberships."""
    organizations: list[dict] = []

class UserCreateRequest(BaseModel):
    email: str
    password: str = Field(min_length=6)
    display_name: str
    is_customer_admin: bool = False

class UserUpdateRequest(BaseModel):
    display_name: Optional[str] = None
    status: Optional[str] = None
    is_customer_admin: Optional[bool] = None
    avatar_url: Optional[str] = None


# ── Role ───────────────────────────────────────────────────────
class RoleOut(BaseModel):
    id: uuid.UUID
    customer_id: Optional[uuid.UUID] = None
    name: str
    description: Optional[str] = None
    permissions_json: dict = {}
    is_system: bool = False
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class RoleCreateRequest(BaseModel):
    name: str
    description: Optional[str] = None
    permissions_json: dict = {}

class RoleUpdateRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    permissions_json: Optional[dict] = None


# ── UserOrganization ──────────────────────────────────────────
class UserOrgAssignRequest(BaseModel):
    user_id: uuid.UUID
    organization_id: uuid.UUID
    role_id: uuid.UUID
    is_default: bool = False

class UserOrgOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    organization_id: uuid.UUID
    role_id: uuid.UUID
    is_default: bool
    status: str
    joined_at: Optional[datetime] = None

    class Config:
        from_attributes = True
PYEOF

echo "  ✅ identity/dtos.py"

# ═══════════════════════════════════════════════════════════════
# PART 4: IDENTITY MODULE — DAO
# ═══════════════════════════════════════════════════════════════
cat > "$APP/modules/identity/dao.py" << 'PYEOF'
"""Identity DAO: database operations for User, Role, UserOrganization."""
import uuid
from datetime import datetime
from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.identity.models import (
    Customer, Organization, OrganizationCurrency,
    User, Role, UserOrganization
)


class UserDAO:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, user_id: uuid.UUID) -> User | None:
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> User | None:
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def list_by_customer(self, customer_id: uuid.UUID) -> list[User]:
        result = await self.db.execute(
            select(User).where(User.customer_id == customer_id).order_by(User.display_name)
        )
        return list(result.scalars().all())

    async def create(self, user: User) -> User:
        self.db.add(user)
        await self.db.flush()
        await self.db.refresh(user)
        return user

    async def update(self, user_id: uuid.UUID, **kwargs) -> User | None:
        kwargs["updated_at"] = datetime.utcnow()
        await self.db.execute(update(User).where(User.id == user_id).values(**kwargs))
        await self.db.flush()
        return await self.get_by_id(user_id)

    async def update_last_login(self, user_id: uuid.UUID):
        await self.db.execute(
            update(User).where(User.id == user_id).values(last_login_at=datetime.utcnow())
        )


class RoleDAO:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, role_id: uuid.UUID) -> Role | None:
        result = await self.db.execute(select(Role).where(Role.id == role_id))
        return result.scalar_one_or_none()

    async def list_for_customer(self, customer_id: uuid.UUID) -> list[Role]:
        """Get customer-specific + system roles."""
        result = await self.db.execute(
            select(Role).where(
                (Role.customer_id == customer_id) | (Role.customer_id == None)
            ).order_by(Role.name)
        )
        return list(result.scalars().all())

    async def create(self, role: Role) -> Role:
        self.db.add(role)
        await self.db.flush()
        await self.db.refresh(role)
        return role

    async def update(self, role_id: uuid.UUID, **kwargs) -> Role | None:
        await self.db.execute(update(Role).where(Role.id == role_id).values(**kwargs))
        await self.db.flush()
        return await self.get_by_id(role_id)


class UserOrgDAO:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_orgs(self, user_id: uuid.UUID) -> list[UserOrganization]:
        result = await self.db.execute(
            select(UserOrganization).where(UserOrganization.user_id == user_id)
        )
        return list(result.scalars().all())

    async def get_org_members(self, organization_id: uuid.UUID) -> list[UserOrganization]:
        result = await self.db.execute(
            select(UserOrganization).where(UserOrganization.organization_id == organization_id)
        )
        return list(result.scalars().all())

    async def assign(self, uo: UserOrganization) -> UserOrganization:
        self.db.add(uo)
        await self.db.flush()
        await self.db.refresh(uo)
        return uo

    async def remove(self, user_id: uuid.UUID, organization_id: uuid.UUID):
        await self.db.execute(
            delete(UserOrganization).where(
                UserOrganization.user_id == user_id,
                UserOrganization.organization_id == organization_id,
            )
        )

    async def get_default_org(self, user_id: uuid.UUID) -> UserOrganization | None:
        result = await self.db.execute(
            select(UserOrganization).where(
                UserOrganization.user_id == user_id,
                UserOrganization.is_default == True
            )
        )
        return result.scalar_one_or_none()


class CustomerDAO:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, customer_id: uuid.UUID) -> Customer | None:
        result = await self.db.execute(select(Customer).where(Customer.id == customer_id))
        return result.scalar_one_or_none()

    async def get_by_slug(self, slug: str) -> Customer | None:
        result = await self.db.execute(select(Customer).where(Customer.slug == slug))
        return result.scalar_one_or_none()

    async def create(self, customer: Customer) -> Customer:
        self.db.add(customer)
        await self.db.flush()
        await self.db.refresh(customer)
        return customer

    async def update(self, customer_id: uuid.UUID, **kwargs) -> Customer | None:
        kwargs["updated_at"] = datetime.utcnow()
        await self.db.execute(update(Customer).where(Customer.id == customer_id).values(**kwargs))
        await self.db.flush()
        return await self.get_by_id(customer_id)


class OrganizationDAO:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, org_id: uuid.UUID) -> Organization | None:
        result = await self.db.execute(select(Organization).where(Organization.id == org_id))
        return result.scalar_one_or_none()

    async def list_by_customer(self, customer_id: uuid.UUID) -> list[Organization]:
        result = await self.db.execute(
            select(Organization).where(Organization.customer_id == customer_id).order_by(Organization.name)
        )
        return list(result.scalars().all())

    async def create(self, org: Organization) -> Organization:
        self.db.add(org)
        await self.db.flush()
        await self.db.refresh(org)
        return org

    async def update(self, org_id: uuid.UUID, **kwargs) -> Organization | None:
        kwargs["updated_at"] = datetime.utcnow()
        await self.db.execute(update(Organization).where(Organization.id == org_id).values(**kwargs))
        await self.db.flush()
        return await self.get_by_id(org_id)
PYEOF

echo "  ✅ identity/dao.py"

# ═══════════════════════════════════════════════════════════════
# PART 5: IDENTITY MODULE — SERVICE
# ═══════════════════════════════════════════════════════════════
cat > "$APP/modules/identity/service.py" << 'PYEOF'
"""Identity service: auth flows, user management, signup with customer+org creation."""
import uuid
import re
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from app.auth.jwt import create_access_token, create_refresh_token, decode_token
from app.auth.password import hash_password, verify_password
from app.config import get_settings
from app.shared.exceptions import NotFoundError, ConflictError, BadRequestError
from app.modules.identity.models import (
    Customer, Organization, OrganizationCurrency,
    User, Role, UserOrganization
)
from app.modules.identity.dao import (
    UserDAO, RoleDAO, UserOrgDAO, CustomerDAO, OrganizationDAO
)

settings = get_settings()


def _slugify(text: str) -> str:
    """Convert text to URL-safe slug."""
    slug = re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')
    return slug[:100]


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_dao = UserDAO(db)
        self.customer_dao = CustomerDAO(db)
        self.org_dao = OrganizationDAO(db)
        self.role_dao = RoleDAO(db)
        self.user_org_dao = UserOrgDAO(db)

    async def login(self, email: str, password: str) -> dict:
        user = await self.user_dao.get_by_email(email)
        if not user or not verify_password(password, user.password_hash):
            raise BadRequestError("Invalid email or password")

        if user.status != "active":
            raise BadRequestError("Account is not active")

        await self.user_dao.update_last_login(user.id)

        # Build org list for JWT
        orgs = await self._build_org_list(user)

        token_data = {
            "sub": str(user.id),
            "customer_id": str(user.customer_id),
            "email": user.email,
            "display_name": user.display_name,
            "is_customer_admin": user.is_customer_admin,
            "organizations": orgs,
        }

        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(str(user.id))

        await self.db.commit()

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        }

    async def signup(self, email: str, password: str, display_name: str,
                     company_name: str | None = None) -> dict:
        # Check email uniqueness
        existing = await self.user_dao.get_by_email(email)
        if existing:
            raise ConflictError("Email already registered")

        # Create customer
        cust_name = company_name or f"{display_name}'s Company"
        slug = _slugify(cust_name)
        # Ensure slug uniqueness
        existing_slug = await self.customer_dao.get_by_slug(slug)
        if existing_slug:
            slug = f"{slug}-{uuid.uuid4().hex[:6]}"

        customer = Customer(name=cust_name, slug=slug, plan="free", status="active")
        customer = await self.customer_dao.create(customer)

        # Create default organization
        org_code = slug[:15].upper().replace("-", "")
        org = Organization(
            customer_id=customer.id,
            name=f"{cust_name} - HQ",
            code=org_code,
            default_currency_code="USD",
            is_default=True,
            status="active",
        )
        org = await self.org_dao.create(org)

        # Update customer with default_organization_id
        await self.customer_dao.update(customer.id, default_organization_id=org.id)

        # Create default currency for org
        currency = OrganizationCurrency(
            organization_id=org.id,
            currency_code="USD",
            is_primary=True,
            is_reporting=True,
            status="active",
        )
        self.db.add(currency)

        # Create system roles if not exist
        admin_role = await self._ensure_system_roles(customer.id)

        # Create user
        user = User(
            customer_id=customer.id,
            email=email,
            display_name=display_name,
            password_hash=hash_password(password),
            is_customer_admin=True,
            status="active",
        )
        user = await self.user_dao.create(user)

        # Assign user to default org with admin role
        uo = UserOrganization(
            user_id=user.id,
            organization_id=org.id,
            role_id=admin_role.id,
            is_default=True,
            status="active",
        )
        self.db.add(uo)

        await self.db.flush()

        # Generate tokens
        orgs = [{"id": str(org.id), "name": org.name, "code": org.code,
                 "role": "admin", "is_default": True}]
        token_data = {
            "sub": str(user.id),
            "customer_id": str(customer.id),
            "email": user.email,
            "display_name": user.display_name,
            "is_customer_admin": True,
            "organizations": orgs,
        }

        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(str(user.id))

        await self.db.commit()

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        }

    async def refresh(self, refresh_token_str: str) -> dict:
        payload = decode_token(refresh_token_str)
        if not payload or payload.get("type") != "refresh":
            raise BadRequestError("Invalid refresh token")

        user = await self.user_dao.get_by_id(uuid.UUID(payload["sub"]))
        if not user or user.status != "active":
            raise BadRequestError("User not found or inactive")

        orgs = await self._build_org_list(user)
        token_data = {
            "sub": str(user.id),
            "customer_id": str(user.customer_id),
            "email": user.email,
            "display_name": user.display_name,
            "is_customer_admin": user.is_customer_admin,
            "organizations": orgs,
        }

        access_token = create_access_token(token_data)
        new_refresh = create_refresh_token(str(user.id))

        return {
            "access_token": access_token,
            "refresh_token": new_refresh,
            "token_type": "bearer",
            "expires_in": settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        }

    async def get_profile(self, user: User) -> dict:
        """Full user profile with org memberships."""
        orgs = await self._build_org_list(user)
        return {
            "id": str(user.id),
            "customer_id": str(user.customer_id),
            "email": user.email,
            "display_name": user.display_name,
            "avatar_url": user.avatar_url,
            "status": user.status,
            "is_customer_admin": user.is_customer_admin,
            "last_login_at": user.last_login_at.isoformat() if user.last_login_at else None,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "organizations": orgs,
        }

    async def _build_org_list(self, user: User) -> list[dict]:
        """Build org membership list for JWT or profile."""
        from sqlalchemy import select
        user_orgs = await self.user_org_dao.get_user_orgs(user.id)
        orgs = []
        for uo in user_orgs:
            org = await self.org_dao.get_by_id(uo.organization_id)
            role = await self.role_dao.get_by_id(uo.role_id)
            if org:
                orgs.append({
                    "id": str(org.id),
                    "name": org.name,
                    "code": org.code,
                    "role": role.name if role else "member",
                    "is_default": uo.is_default,
                })
        return orgs

    async def _ensure_system_roles(self, customer_id: uuid.UUID) -> Role:
        """Create default roles for a new customer. Returns admin role."""
        from sqlalchemy import select
        # Check if admin role exists
        result = await self.db.execute(
            select(Role).where(Role.customer_id == customer_id, Role.name == "admin")
        )
        existing = result.scalar_one_or_none()
        if existing:
            return existing

        roles_data = [
            ("admin", "Full access to all modules", {
                "command_center": ["read", "write", "delete"],
                "fpa": ["read", "write", "delete"],
                "treasury": ["read", "write", "delete"],
                "accounting": ["read", "write", "delete"],
                "risk": ["read", "write", "delete"],
                "monitoring": ["read", "write", "delete"],
                "agent_studio": ["read", "write", "delete"],
                "admin": ["read", "write", "delete"],
            }),
            ("controller", "Financial controller access", {
                "fpa": ["read", "write"], "treasury": ["read", "write"],
                "accounting": ["read", "write", "delete"],
                "command_center": ["read"], "risk": ["read"],
                "monitoring": ["read"],
            }),
            ("analyst", "Read-only analyst access", {
                "command_center": ["read"], "fpa": ["read"],
                "treasury": ["read"], "accounting": ["read"],
                "risk": ["read"], "monitoring": ["read"],
            }),
            ("viewer", "View-only access", {
                "command_center": ["read"], "fpa": ["read"],
                "treasury": ["read"],
            }),
        ]

        admin_role = None
        for name, desc, perms in roles_data:
            role = Role(
                customer_id=customer_id,
                name=name,
                description=desc,
                permissions_json=perms,
                is_system=True,
            )
            self.db.add(role)
            await self.db.flush()
            if name == "admin":
                admin_role = role

        return admin_role
PYEOF

echo "  ✅ identity/service.py"

# ═══════════════════════════════════════════════════════════════
# PART 6: IDENTITY MODULE — ROUTER (auth + users + roles + user-org)
# ═══════════════════════════════════════════════════════════════
cat > "$APP/modules/identity/router.py" << 'PYEOF'
"""
Identity router:
  /auth/login, /auth/signup, /auth/refresh, /auth/me
  /users, /users/{id}
  /roles, /roles/{id}
  /user-orgs (assign/remove user to/from org)
"""
import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.shared.responses import ok, error
from app.shared.exceptions import NotFoundError, ConflictError, BadRequestError
from app.modules.identity.models import User, Role, UserOrganization
from app.modules.identity.dtos import (
    LoginRequest, SignupRequest, RefreshRequest,
    UserCreateRequest, UserUpdateRequest,
    RoleCreateRequest, RoleUpdateRequest,
    UserOrgAssignRequest,
)
from app.modules.identity.dao import UserDAO, RoleDAO, UserOrgDAO
from app.modules.identity.service import AuthService
from app.auth.password import hash_password

router = APIRouter()


# ── Auth ───────────────────────────────────────────────────────

@router.post("/auth/login")
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    svc = AuthService(db)
    data = await svc.login(req.email, req.password)
    return ok(data=data, message="Login successful")


@router.post("/auth/signup")
async def signup(req: SignupRequest, db: AsyncSession = Depends(get_db)):
    svc = AuthService(db)
    data = await svc.signup(
        email=req.email,
        password=req.password,
        display_name=req.display_name,
        company_name=req.company_name,
    )
    return ok(data=data, message="Account created successfully")


@router.post("/auth/refresh")
async def refresh(req: RefreshRequest, db: AsyncSession = Depends(get_db)):
    svc = AuthService(db)
    data = await svc.refresh(req.refresh_token)
    return ok(data=data)


@router.get("/auth/me")
async def me(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    svc = AuthService(db)
    data = await svc.get_profile(user)
    return ok(data=data)


# ── Users ──────────────────────────────────────────────────────

@router.get("/users")
async def list_users(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    dao = UserDAO(db)
    users = await dao.list_by_customer(user.customer_id)
    return ok(data=[{
        "id": str(u.id), "email": u.email, "display_name": u.display_name,
        "status": u.status, "is_customer_admin": u.is_customer_admin,
        "last_login_at": u.last_login_at.isoformat() if u.last_login_at else None,
        "created_at": u.created_at.isoformat() if u.created_at else None,
    } for u in users])


@router.post("/users")
async def create_user(
    req: UserCreateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not user.is_customer_admin:
        raise BadRequestError("Only customer admins can create users")

    dao = UserDAO(db)
    existing = await dao.get_by_email(req.email)
    if existing:
        raise ConflictError("Email already in use")

    new_user = User(
        customer_id=user.customer_id,
        email=req.email,
        display_name=req.display_name,
        password_hash=hash_password(req.password),
        is_customer_admin=req.is_customer_admin,
        status="active",
    )
    new_user = await dao.create(new_user)
    await db.commit()

    return ok(data={"id": str(new_user.id), "email": new_user.email,
                     "display_name": new_user.display_name})


@router.put("/users/{user_id}")
async def update_user(
    user_id: uuid.UUID,
    req: UserUpdateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    dao = UserDAO(db)
    target = await dao.get_by_id(user_id)
    if not target or target.customer_id != user.customer_id:
        raise NotFoundError("User")

    updates = req.model_dump(exclude_none=True)
    if updates:
        updated = await dao.update(user_id, **updates)
        await db.commit()
    return ok(message="User updated")


@router.delete("/users/{user_id}")
async def deactivate_user(
    user_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not user.is_customer_admin:
        raise BadRequestError("Only customer admins can deactivate users")
    dao = UserDAO(db)
    await dao.update(user_id, status="inactive")
    await db.commit()
    return ok(message="User deactivated")


# ── Roles ──────────────────────────────────────────────────────

@router.get("/roles")
async def list_roles(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    dao = RoleDAO(db)
    roles = await dao.list_for_customer(user.customer_id)
    return ok(data=[{
        "id": str(r.id), "name": r.name, "description": r.description,
        "permissions_json": r.permissions_json, "is_system": r.is_system,
    } for r in roles])


@router.post("/roles")
async def create_role(
    req: RoleCreateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    dao = RoleDAO(db)
    role = Role(
        customer_id=user.customer_id,
        name=req.name,
        description=req.description,
        permissions_json=req.permissions_json,
    )
    role = await dao.create(role)
    await db.commit()
    return ok(data={"id": str(role.id), "name": role.name})


@router.put("/roles/{role_id}")
async def update_role(
    role_id: uuid.UUID,
    req: RoleUpdateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    dao = RoleDAO(db)
    updates = req.model_dump(exclude_none=True)
    if updates:
        await dao.update(role_id, **updates)
        await db.commit()
    return ok(message="Role updated")


# ── User-Organization Assignments ─────────────────────────────

@router.get("/user-orgs/{user_id}")
async def list_user_orgs(
    user_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    dao = UserOrgDAO(db)
    uos = await dao.get_user_orgs(user_id)
    return ok(data=[{
        "id": str(uo.id), "user_id": str(uo.user_id),
        "organization_id": str(uo.organization_id),
        "role_id": str(uo.role_id), "is_default": uo.is_default,
        "status": uo.status,
    } for uo in uos])


@router.post("/user-orgs")
async def assign_user_to_org(
    req: UserOrgAssignRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    dao = UserOrgDAO(db)
    uo = UserOrganization(
        user_id=req.user_id,
        organization_id=req.organization_id,
        role_id=req.role_id,
        is_default=req.is_default,
        status="active",
    )
    uo = await dao.assign(uo)
    await db.commit()
    return ok(data={"id": str(uo.id)}, message="User assigned to organization")


@router.delete("/user-orgs/{user_id}/{organization_id}")
async def remove_user_from_org(
    user_id: uuid.UUID,
    organization_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    dao = UserOrgDAO(db)
    await dao.remove(user_id, organization_id)
    await db.commit()
    return ok(message="User removed from organization")
PYEOF

echo "  ✅ identity/router.py — auth + users + roles + user-orgs"

# ═══════════════════════════════════════════════════════════════
# PART 7: TENANCY MODULE — DTOs + DAO + SERVICE + ROUTER
# ═══════════════════════════════════════════════════════════════
cat > "$APP/modules/tenancy/dtos.py" << 'PYEOF'
"""Tenancy DTOs: Customer, Organization, OrganizationCurrency."""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid


class CustomerOut(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    legal_name: Optional[str] = None
    industry: Optional[str] = None
    plan: str
    status: str
    default_organization_id: Optional[uuid.UUID] = None

    class Config:
        from_attributes = True

class CustomerUpdateRequest(BaseModel):
    name: Optional[str] = None
    legal_name: Optional[str] = None
    industry: Optional[str] = None


class OrganizationOut(BaseModel):
    id: uuid.UUID
    customer_id: uuid.UUID
    name: str
    code: str
    legal_entity_name: Optional[str] = None
    country: Optional[str] = None
    timezone: str
    fiscal_year_end_month: int
    default_currency_code: str
    status: str
    is_default: bool

    class Config:
        from_attributes = True

class OrgCreateRequest(BaseModel):
    name: str
    code: str
    legal_entity_name: Optional[str] = None
    country: Optional[str] = None
    timezone: str = "America/New_York"
    fiscal_year_end_month: int = 12
    default_currency_code: str = "USD"

class OrgUpdateRequest(BaseModel):
    name: Optional[str] = None
    legal_entity_name: Optional[str] = None
    country: Optional[str] = None
    timezone: Optional[str] = None
    fiscal_year_end_month: Optional[int] = None
    default_currency_code: Optional[str] = None
    status: Optional[str] = None


class OrgCurrencyOut(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    currency_code: str
    is_primary: bool
    is_reporting: bool
    exchange_rate_source: str
    status: str

    class Config:
        from_attributes = True

class OrgCurrencyCreateRequest(BaseModel):
    currency_code: str
    is_primary: bool = False
    is_reporting: bool = False
    exchange_rate_source: str = "manual"
PYEOF

cat > "$APP/modules/tenancy/dao.py" << 'PYEOF'
"""Tenancy DAO — re-uses identity DAO for Customer/Organization, adds currency ops."""
import uuid
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.identity.models import Organization, OrganizationCurrency

# Re-export from identity DAO
from app.modules.identity.dao import CustomerDAO, OrganizationDAO


class OrgCurrencyDAO:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_by_org(self, org_id: uuid.UUID) -> list[OrganizationCurrency]:
        result = await self.db.execute(
            select(OrganizationCurrency).where(OrganizationCurrency.organization_id == org_id)
        )
        return list(result.scalars().all())

    async def create(self, currency: OrganizationCurrency) -> OrganizationCurrency:
        self.db.add(currency)
        await self.db.flush()
        await self.db.refresh(currency)
        return currency

    async def delete(self, currency_id: uuid.UUID):
        await self.db.execute(
            delete(OrganizationCurrency).where(OrganizationCurrency.id == currency_id)
        )
PYEOF

cat > "$APP/modules/tenancy/service.py" << 'PYEOF'
"""Tenancy service — business logic for orgs + currencies."""
PYEOF

cat > "$APP/modules/tenancy/router.py" << 'PYEOF'
"""
Tenancy router:
  /customer — get/update current customer
  /organizations — CRUD orgs
  /organizations/{id}/currencies — manage org currencies
"""
import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.shared.responses import ok
from app.shared.exceptions import NotFoundError, BadRequestError
from app.modules.identity.models import User, Organization, OrganizationCurrency
from app.modules.identity.dao import CustomerDAO, OrganizationDAO
from app.modules.tenancy.dao import OrgCurrencyDAO
from app.modules.tenancy.dtos import (
    CustomerUpdateRequest, OrgCreateRequest, OrgUpdateRequest,
    OrgCurrencyCreateRequest,
)

router = APIRouter()


# ── Customer ───────────────────────────────────────────────────

@router.get("/customer")
async def get_customer(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    dao = CustomerDAO(db)
    c = await dao.get_by_id(user.customer_id)
    if not c:
        raise NotFoundError("Customer")
    return ok(data={
        "id": str(c.id), "name": c.name, "slug": c.slug,
        "legal_name": c.legal_name, "industry": c.industry,
        "plan": c.plan, "status": c.status,
        "default_organization_id": str(c.default_organization_id) if c.default_organization_id else None,
    })

@router.put("/customer")
async def update_customer(
    req: CustomerUpdateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not user.is_customer_admin:
        raise BadRequestError("Only customer admins can update customer")
    dao = CustomerDAO(db)
    updates = req.model_dump(exclude_none=True)
    if updates:
        await dao.update(user.customer_id, **updates)
        await db.commit()
    return ok(message="Customer updated")


# ── Organizations ──────────────────────────────────────────────

@router.get("/organizations")
async def list_organizations(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    dao = OrganizationDAO(db)
    orgs = await dao.list_by_customer(user.customer_id)
    return ok(data=[{
        "id": str(o.id), "name": o.name, "code": o.code,
        "country": o.country, "timezone": o.timezone,
        "default_currency_code": o.default_currency_code,
        "status": o.status, "is_default": o.is_default,
    } for o in orgs])


@router.post("/organizations")
async def create_organization(
    req: OrgCreateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not user.is_customer_admin:
        raise BadRequestError("Only customer admins can create organizations")

    dao = OrganizationDAO(db)
    org = Organization(
        customer_id=user.customer_id,
        name=req.name,
        code=req.code,
        legal_entity_name=req.legal_entity_name,
        country=req.country,
        timezone=req.timezone,
        fiscal_year_end_month=req.fiscal_year_end_month,
        default_currency_code=req.default_currency_code,
        status="active",
    )
    org = await dao.create(org)

    # Create default currency
    currency = OrganizationCurrency(
        organization_id=org.id,
        currency_code=req.default_currency_code,
        is_primary=True,
        is_reporting=True,
        status="active",
    )
    db.add(currency)
    await db.commit()

    return ok(data={"id": str(org.id), "name": org.name, "code": org.code})


@router.put("/organizations/{org_id}")
async def update_organization(
    org_id: uuid.UUID,
    req: OrgUpdateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    dao = OrganizationDAO(db)
    org = await dao.get_by_id(org_id)
    if not org or org.customer_id != user.customer_id:
        raise NotFoundError("Organization")

    updates = req.model_dump(exclude_none=True)
    if updates:
        await dao.update(org_id, **updates)
        await db.commit()
    return ok(message="Organization updated")


@router.delete("/organizations/{org_id}")
async def deactivate_organization(
    org_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Prevent deleting default org
    cust_dao = CustomerDAO(db)
    customer = await cust_dao.get_by_id(user.customer_id)
    if customer and customer.default_organization_id == org_id:
        raise BadRequestError("Cannot delete the default organization")

    dao = OrganizationDAO(db)
    await dao.update(org_id, status="archived")
    await db.commit()
    return ok(message="Organization archived")


# ── Organization Currencies ────────────────────────────────────

@router.get("/organizations/{org_id}/currencies")
async def list_currencies(
    org_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    dao = OrgCurrencyDAO(db)
    currencies = await dao.list_by_org(org_id)
    return ok(data=[{
        "id": str(c.id), "currency_code": c.currency_code,
        "is_primary": c.is_primary, "is_reporting": c.is_reporting,
        "exchange_rate_source": c.exchange_rate_source, "status": c.status,
    } for c in currencies])


@router.post("/organizations/{org_id}/currencies")
async def add_currency(
    org_id: uuid.UUID,
    req: OrgCurrencyCreateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    dao = OrgCurrencyDAO(db)
    currency = OrganizationCurrency(
        organization_id=org_id,
        currency_code=req.currency_code,
        is_primary=req.is_primary,
        is_reporting=req.is_reporting,
        exchange_rate_source=req.exchange_rate_source,
        status="active",
    )
    currency = await dao.create(currency)
    await db.commit()
    return ok(data={"id": str(currency.id), "currency_code": currency.currency_code})
PYEOF

echo "  ✅ tenancy/ — DTOs + DAO + router (customer, organizations, currencies)"

# ═══════════════════════════════════════════════════════════════
# PART 8: ACCESS MODULE — DTOs + DAO + ROUTER (cross-org sharing)
# ═══════════════════════════════════════════════════════════════
cat > "$APP/modules/access/dtos.py" << 'PYEOF'
"""Access DTOs: OrgAccessPolicy."""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid


class AccessPolicyOut(BaseModel):
    id: uuid.UUID
    customer_id: uuid.UUID
    from_organization_id: uuid.UUID
    to_organization_id: uuid.UUID
    domain: str
    row_type: str
    access_level: str
    access_config_json: dict
    is_active: bool
    expires_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AccessPolicyCreateRequest(BaseModel):
    from_organization_id: uuid.UUID
    to_organization_id: uuid.UUID
    domain: str
    row_type: str  # role | user
    access_level: str = "view"  # view | edit | full
    access_config_json: dict = {}
    expires_at: Optional[datetime] = None


class AccessPolicyUpdateRequest(BaseModel):
    access_level: Optional[str] = None
    access_config_json: Optional[dict] = None
    is_active: Optional[bool] = None
    expires_at: Optional[datetime] = None
PYEOF

cat > "$APP/modules/access/dao.py" << 'PYEOF'
"""Access DAO: OrgAccessPolicy database operations."""
import uuid
from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.access.models import OrgAccessPolicy


class AccessPolicyDAO:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, policy_id: uuid.UUID) -> OrgAccessPolicy | None:
        result = await self.db.execute(
            select(OrgAccessPolicy).where(OrgAccessPolicy.id == policy_id)
        )
        return result.scalar_one_or_none()

    async def list_by_customer(self, customer_id: uuid.UUID) -> list[OrgAccessPolicy]:
        result = await self.db.execute(
            select(OrgAccessPolicy).where(OrgAccessPolicy.customer_id == customer_id)
            .order_by(OrgAccessPolicy.created_at.desc())
        )
        return list(result.scalars().all())

    async def list_for_org(self, org_id: uuid.UUID, direction: str = "to") -> list[OrgAccessPolicy]:
        """Get policies where org is receiving ('to') or granting ('from') access."""
        col = OrgAccessPolicy.to_organization_id if direction == "to" else OrgAccessPolicy.from_organization_id
        result = await self.db.execute(
            select(OrgAccessPolicy).where(col == org_id, OrgAccessPolicy.is_active == True)
        )
        return list(result.scalars().all())

    async def create(self, policy: OrgAccessPolicy) -> OrgAccessPolicy:
        self.db.add(policy)
        await self.db.flush()
        await self.db.refresh(policy)
        return policy

    async def update(self, policy_id: uuid.UUID, **kwargs) -> OrgAccessPolicy | None:
        from datetime import datetime as dt
        kwargs["updated_at"] = dt.utcnow()
        await self.db.execute(
            update(OrgAccessPolicy).where(OrgAccessPolicy.id == policy_id).values(**kwargs)
        )
        await self.db.flush()
        return await self.get_by_id(policy_id)

    async def delete(self, policy_id: uuid.UUID):
        await self.db.execute(
            delete(OrgAccessPolicy).where(OrgAccessPolicy.id == policy_id)
        )
PYEOF

cat > "$APP/modules/access/service.py" << 'PYEOF'
"""Access service — placeholder for complex policy resolution logic."""
PYEOF

cat > "$APP/modules/access/router.py" << 'PYEOF'
"""
Access router: CRUD for OrgAccessPolicy (cross-org sharing).
"""
import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.shared.responses import ok
from app.shared.exceptions import NotFoundError, BadRequestError
from app.modules.identity.models import User
from app.modules.access.models import OrgAccessPolicy
from app.modules.access.dao import AccessPolicyDAO
from app.modules.access.dtos import AccessPolicyCreateRequest, AccessPolicyUpdateRequest

router = APIRouter()


@router.get("/policies")
async def list_policies(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    dao = AccessPolicyDAO(db)
    policies = await dao.list_by_customer(user.customer_id)
    return ok(data=[{
        "id": str(p.id),
        "from_organization_id": str(p.from_organization_id),
        "to_organization_id": str(p.to_organization_id),
        "domain": p.domain, "row_type": p.row_type,
        "access_level": p.access_level,
        "access_config_json": p.access_config_json,
        "is_active": p.is_active,
        "expires_at": p.expires_at.isoformat() if p.expires_at else None,
        "created_at": p.created_at.isoformat() if p.created_at else None,
    } for p in policies])


@router.post("/policies")
async def create_policy(
    req: AccessPolicyCreateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not user.is_customer_admin:
        raise BadRequestError("Only customer admins can create access policies")

    if req.from_organization_id == req.to_organization_id:
        raise BadRequestError("Cannot create self-sharing policy")

    if req.row_type not in ("role", "user"):
        raise BadRequestError("row_type must be 'role' or 'user'")

    dao = AccessPolicyDAO(db)
    policy = OrgAccessPolicy(
        customer_id=user.customer_id,
        from_organization_id=req.from_organization_id,
        to_organization_id=req.to_organization_id,
        domain=req.domain,
        row_type=req.row_type,
        access_level=req.access_level,
        access_config_json=req.access_config_json,
        is_active=True,
        granted_by_user_id=user.id,
        expires_at=req.expires_at,
    )
    policy = await dao.create(policy)
    await db.commit()
    return ok(data={"id": str(policy.id)}, message="Access policy created")


@router.put("/policies/{policy_id}")
async def update_policy(
    policy_id: uuid.UUID,
    req: AccessPolicyUpdateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    dao = AccessPolicyDAO(db)
    policy = await dao.get_by_id(policy_id)
    if not policy or policy.customer_id != user.customer_id:
        raise NotFoundError("Access policy")

    updates = req.model_dump(exclude_none=True)
    if updates:
        await dao.update(policy_id, **updates)
        await db.commit()
    return ok(message="Access policy updated")


@router.delete("/policies/{policy_id}")
async def delete_policy(
    policy_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    dao = AccessPolicyDAO(db)
    policy = await dao.get_by_id(policy_id)
    if not policy or policy.customer_id != user.customer_id:
        raise NotFoundError("Access policy")
    await dao.delete(policy_id)
    await db.commit()
    return ok(message="Access policy deleted")


@router.get("/policies/org/{org_id}")
async def list_policies_for_org(
    org_id: uuid.UUID,
    direction: str = "to",
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get policies where org is receiving ('to') or granting ('from') access."""
    dao = AccessPolicyDAO(db)
    policies = await dao.list_for_org(org_id, direction)
    return ok(data=[{
        "id": str(p.id),
        "from_organization_id": str(p.from_organization_id),
        "to_organization_id": str(p.to_organization_id),
        "domain": p.domain, "row_type": p.row_type,
        "access_level": p.access_level,
        "access_config_json": p.access_config_json,
        "is_active": p.is_active,
    } for p in policies])
PYEOF

echo "  ✅ access/ — DTOs + DAO + router (OrgAccessPolicy CRUD)"

# ═══════════════════════════════════════════════════════════════
# PART 9: CONFIG MODULE — DTOs + DAO + ROUTER
# ═══════════════════════════════════════════════════════════════
cat > "$APP/modules/config/dtos.py" << 'PYEOF'
"""Config DTOs: ApiKey, DataConnection, PlatformSetting, AuditLog."""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid


class ApiKeyOut(BaseModel):
    id: uuid.UUID
    name: str
    key_prefix: str
    scopes: list
    is_active: bool
    organization_id: Optional[uuid.UUID] = None
    expires_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ApiKeyCreateRequest(BaseModel):
    name: str
    organization_id: Optional[uuid.UUID] = None
    scopes: list = []
    expires_at: Optional[datetime] = None


class DataConnectionOut(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    name: str
    connection_type: str
    provider: Optional[str] = None
    status: str
    sync_frequency: str
    last_sync_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class DataConnectionCreateRequest(BaseModel):
    organization_id: uuid.UUID
    name: str
    connection_type: str
    provider: Optional[str] = None
    config_json: dict = {}
    sync_frequency: str = "daily"

class DataConnectionUpdateRequest(BaseModel):
    name: Optional[str] = None
    config_json: Optional[dict] = None
    sync_frequency: Optional[str] = None
    status: Optional[str] = None


class SettingOut(BaseModel):
    id: uuid.UUID
    key: str
    value: Optional[str] = None
    category: str
    organization_id: Optional[uuid.UUID] = None

    class Config:
        from_attributes = True

class SettingUpsertRequest(BaseModel):
    key: str
    value: str
    category: str = "general"
    organization_id: Optional[uuid.UUID] = None


class AuditLogOut(BaseModel):
    id: uuid.UUID
    user_id: Optional[uuid.UUID] = None
    organization_id: Optional[uuid.UUID] = None
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    details_json: dict = {}
    ip_address: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
PYEOF

cat > "$APP/modules/config/dao.py" << 'PYEOF'
"""Config DAO: ApiKey, DataConnection, PlatformSetting, AuditLog."""
import uuid
import hashlib
import secrets
from datetime import datetime
from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.config.models import ApiKey, DataConnection, PlatformSetting, AuditLog


class ApiKeyDAO:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_by_customer(self, customer_id: uuid.UUID) -> list[ApiKey]:
        result = await self.db.execute(
            select(ApiKey).where(ApiKey.customer_id == customer_id).order_by(ApiKey.created_at.desc())
        )
        return list(result.scalars().all())

    async def create(self, customer_id: uuid.UUID, name: str,
                     org_id: uuid.UUID | None, scopes: list,
                     expires_at=None, created_by=None) -> tuple[ApiKey, str]:
        """Create API key. Returns (ApiKey, raw_key) — raw_key shown only once."""
        raw_key = f"afda_{secrets.token_hex(24)}"
        key_prefix = raw_key[:12]
        key_hash = hashlib.sha256(raw_key.encode()).hexdigest()

        api_key = ApiKey(
            customer_id=customer_id,
            organization_id=org_id,
            name=name,
            key_prefix=key_prefix,
            key_hash=key_hash,
            scopes=scopes,
            is_active=True,
            expires_at=expires_at,
            created_by=created_by,
        )
        self.db.add(api_key)
        await self.db.flush()
        await self.db.refresh(api_key)
        return api_key, raw_key

    async def revoke(self, key_id: uuid.UUID):
        await self.db.execute(
            update(ApiKey).where(ApiKey.id == key_id).values(is_active=False)
        )


class DataConnectionDAO:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_by_customer(self, customer_id: uuid.UUID) -> list[DataConnection]:
        result = await self.db.execute(
            select(DataConnection).where(DataConnection.customer_id == customer_id)
        )
        return list(result.scalars().all())

    async def create(self, conn: DataConnection) -> DataConnection:
        self.db.add(conn)
        await self.db.flush()
        await self.db.refresh(conn)
        return conn

    async def update(self, conn_id: uuid.UUID, **kwargs):
        kwargs["updated_at"] = datetime.utcnow()
        await self.db.execute(
            update(DataConnection).where(DataConnection.id == conn_id).values(**kwargs)
        )


class SettingDAO:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_by_customer(self, customer_id: uuid.UUID,
                                org_id: uuid.UUID | None = None) -> list[PlatformSetting]:
        q = select(PlatformSetting).where(PlatformSetting.customer_id == customer_id)
        if org_id:
            q = q.where(
                (PlatformSetting.organization_id == org_id) |
                (PlatformSetting.organization_id == None)
            )
        result = await self.db.execute(q.order_by(PlatformSetting.key))
        return list(result.scalars().all())

    async def upsert(self, customer_id: uuid.UUID, key: str, value: str,
                     category: str, org_id: uuid.UUID | None = None,
                     updated_by: uuid.UUID | None = None) -> PlatformSetting:
        q = select(PlatformSetting).where(
            PlatformSetting.customer_id == customer_id,
            PlatformSetting.key == key
        )
        if org_id:
            q = q.where(PlatformSetting.organization_id == org_id)
        else:
            q = q.where(PlatformSetting.organization_id == None)

        result = await self.db.execute(q)
        existing = result.scalar_one_or_none()

        if existing:
            existing.value = value
            existing.category = category
            existing.updated_by = updated_by
            existing.updated_at = datetime.utcnow()
            await self.db.flush()
            return existing
        else:
            setting = PlatformSetting(
                customer_id=customer_id,
                organization_id=org_id,
                key=key,
                value=value,
                category=category,
                updated_by=updated_by,
            )
            self.db.add(setting)
            await self.db.flush()
            await self.db.refresh(setting)
            return setting


class AuditLogDAO:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_by_customer(self, customer_id: uuid.UUID, limit: int = 100) -> list[AuditLog]:
        result = await self.db.execute(
            select(AuditLog).where(AuditLog.customer_id == customer_id)
            .order_by(AuditLog.created_at.desc()).limit(limit)
        )
        return list(result.scalars().all())

    async def create(self, log: AuditLog) -> AuditLog:
        self.db.add(log)
        await self.db.flush()
        return log
PYEOF

cat > "$APP/modules/config/service.py" << 'PYEOF'
"""Config service — placeholder."""
PYEOF

cat > "$APP/modules/config/router.py" << 'PYEOF'
"""
Config router: API keys, data connections, settings, audit log.
"""
import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.shared.responses import ok
from app.shared.exceptions import BadRequestError
from app.modules.identity.models import User
from app.modules.config.models import DataConnection, AuditLog
from app.modules.config.dao import ApiKeyDAO, DataConnectionDAO, SettingDAO, AuditLogDAO
from app.modules.config.dtos import (
    ApiKeyCreateRequest, DataConnectionCreateRequest, DataConnectionUpdateRequest,
    SettingUpsertRequest,
)

router = APIRouter()


# ── API Keys ───────────────────────────────────────────────────

@router.get("/api-keys")
async def list_api_keys(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    dao = ApiKeyDAO(db)
    keys = await dao.list_by_customer(user.customer_id)
    return ok(data=[{
        "id": str(k.id), "name": k.name, "key_prefix": k.key_prefix,
        "scopes": k.scopes, "is_active": k.is_active,
        "organization_id": str(k.organization_id) if k.organization_id else None,
        "expires_at": k.expires_at.isoformat() if k.expires_at else None,
        "created_at": k.created_at.isoformat() if k.created_at else None,
    } for k in keys])


@router.post("/api-keys")
async def create_api_key(
    req: ApiKeyCreateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    dao = ApiKeyDAO(db)
    api_key, raw_key = await dao.create(
        customer_id=user.customer_id,
        name=req.name,
        org_id=req.organization_id,
        scopes=req.scopes,
        expires_at=req.expires_at,
        created_by=user.id,
    )
    await db.commit()
    return ok(data={
        "id": str(api_key.id), "name": api_key.name,
        "key": raw_key, "key_prefix": api_key.key_prefix,
    }, message="API key created — save the key, it won't be shown again")


@router.delete("/api-keys/{key_id}")
async def revoke_api_key(
    key_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    dao = ApiKeyDAO(db)
    await dao.revoke(key_id)
    await db.commit()
    return ok(message="API key revoked")


# ── Data Connections ───────────────────────────────────────────

@router.get("/data-connections")
async def list_data_connections(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    dao = DataConnectionDAO(db)
    conns = await dao.list_by_customer(user.customer_id)
    return ok(data=[{
        "id": str(c.id), "name": c.name,
        "organization_id": str(c.organization_id),
        "connection_type": c.connection_type, "provider": c.provider,
        "status": c.status, "sync_frequency": c.sync_frequency,
        "last_sync_at": c.last_sync_at.isoformat() if c.last_sync_at else None,
    } for c in conns])


@router.post("/data-connections")
async def create_data_connection(
    req: DataConnectionCreateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    dao = DataConnectionDAO(db)
    conn = DataConnection(
        customer_id=user.customer_id,
        organization_id=req.organization_id,
        name=req.name,
        connection_type=req.connection_type,
        provider=req.provider,
        config_json=req.config_json,
        sync_frequency=req.sync_frequency,
        status="pending",
    )
    conn = await dao.create(conn)
    await db.commit()
    return ok(data={"id": str(conn.id), "name": conn.name})


@router.post("/data-connections/{conn_id}/test")
async def test_connection(conn_id: uuid.UUID, user: User = Depends(get_current_user)):
    """Simulate connection test."""
    return ok(data={"status": "connected", "latency_ms": 42}, message="Connection test successful")


# ── Settings ───────────────────────────────────────────────────

@router.get("/settings")
async def list_settings(
    org_id: uuid.UUID = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    dao = SettingDAO(db)
    settings = await dao.list_by_customer(user.customer_id, org_id)
    return ok(data=[{
        "id": str(s.id), "key": s.key, "value": s.value, "category": s.category,
        "organization_id": str(s.organization_id) if s.organization_id else None,
    } for s in settings])


@router.put("/settings")
async def upsert_setting(
    req: SettingUpsertRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    dao = SettingDAO(db)
    setting = await dao.upsert(
        customer_id=user.customer_id,
        key=req.key,
        value=req.value,
        category=req.category,
        org_id=req.organization_id,
        updated_by=user.id,
    )
    await db.commit()
    return ok(data={"id": str(setting.id), "key": setting.key})


# ── Audit Log ──────────────────────────────────────────────────

@router.get("/audit-log")
async def list_audit_log(
    limit: int = 100,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    dao = AuditLogDAO(db)
    logs = await dao.list_by_customer(user.customer_id, limit)
    return ok(data=[{
        "id": str(l.id),
        "user_id": str(l.user_id) if l.user_id else None,
        "organization_id": str(l.organization_id) if l.organization_id else None,
        "action": l.action, "resource_type": l.resource_type,
        "resource_id": l.resource_id, "details_json": l.details_json,
        "ip_address": l.ip_address,
        "created_at": l.created_at.isoformat() if l.created_at else None,
    } for l in logs])
PYEOF

echo "  ✅ config/ — DTOs + DAO + router (api-keys, data-connections, settings, audit-log)"

# ═══════════════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════════════

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  ✅ Script 23 Complete — Platform Service API + Auth         ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "  API Endpoints:"
echo ""
echo "  Auth (no token required):"
echo "    POST /api/v1/platform/identity/auth/login"
echo "    POST /api/v1/platform/identity/auth/signup"
echo "    POST /api/v1/platform/identity/auth/refresh"
echo "    GET  /api/v1/platform/identity/auth/me"
echo ""
echo "  Users & Roles (token required):"
echo "    GET/POST        /api/v1/platform/identity/users"
echo "    PUT/DELETE       /api/v1/platform/identity/users/{id}"
echo "    GET/POST         /api/v1/platform/identity/roles"
echo "    PUT              /api/v1/platform/identity/roles/{id}"
echo "    GET/POST/DELETE  /api/v1/platform/identity/user-orgs"
echo ""
echo "  Tenancy:"
echo "    GET/PUT           /api/v1/platform/tenancy/customer"
echo "    GET/POST/PUT/DEL  /api/v1/platform/tenancy/organizations"
echo "    GET/POST          /api/v1/platform/tenancy/organizations/{id}/currencies"
echo ""
echo "  Access Policies (cross-org sharing):"
echo "    GET/POST/PUT/DEL  /api/v1/platform/access/policies"
echo "    GET               /api/v1/platform/access/policies/org/{id}"
echo ""
echo "  Config:"
echo "    GET/POST/DELETE  /api/v1/platform/config/api-keys"
echo "    GET/POST         /api/v1/platform/config/data-connections"
echo "    POST             /api/v1/platform/config/data-connections/{id}/test"
echo "    GET/PUT          /api/v1/platform/config/settings"
echo "    GET              /api/v1/platform/config/audit-log"
echo ""
echo "  Dependencies added:"
echo "    get_current_user  — JWT → User resolution"
echo "    get_org_context   — X-Organization-Id → OrgContext resolution"
echo ""
echo "  Next: Script 24 — CRUD API multi-tenant migration"
echo ""
