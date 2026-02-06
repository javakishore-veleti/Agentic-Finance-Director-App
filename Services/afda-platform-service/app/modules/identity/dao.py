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
