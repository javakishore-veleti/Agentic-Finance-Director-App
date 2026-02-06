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
