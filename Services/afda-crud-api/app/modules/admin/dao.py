from uuid import UUID
from typing import Optional, List
from sqlalchemy import select, func, update, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.modules.admin.models import (
    User, Role, UserRole, ApiKey, DataConnection, AuditLog, PlatformSetting,
)


class UserDAO:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self, status: Optional[str] = None, limit: int = 50, offset: int = 0) -> List[User]:
        q = select(User)
        if status:
            q = q.where(User.status == status)
        result = await self.db.execute(q.order_by(User.display_name).offset(offset).limit(limit))
        return list(result.scalars().all())

    async def get_by_id(self, user_id: UUID) -> Optional[User]:
        result = await self.db.execute(
            select(User).options(selectinload(User.user_roles).selectinload(UserRole.role))
                .where(User.id == user_id)
        )
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def create(self, data: dict) -> User:
        user = User(**data)
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def update(self, user_id: UUID, data: dict) -> Optional[User]:
        await self.db.execute(update(User).where(User.id == user_id).values(**data))
        await self.db.commit()
        return await self.get_by_id(user_id)

    async def assign_role(self, user_id: UUID, role_id: UUID):
        ur = UserRole(user_id=user_id, role_id=role_id)
        self.db.add(ur)
        await self.db.commit()


class RoleDAO:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self) -> List[Role]:
        result = await self.db.execute(select(Role).order_by(Role.name))
        return list(result.scalars().all())

    async def get_by_id(self, role_id: UUID) -> Optional[Role]:
        result = await self.db.execute(select(Role).where(Role.id == role_id))
        return result.scalar_one_or_none()

    async def create(self, data: dict) -> Role:
        role = Role(**data)
        self.db.add(role)
        await self.db.commit()
        await self.db.refresh(role)
        return role

    async def update(self, role_id: UUID, data: dict) -> Optional[Role]:
        await self.db.execute(update(Role).where(Role.id == role_id).values(**data))
        await self.db.commit()
        return await self.get_by_id(role_id)


class ApiKeyDAO:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self) -> List[ApiKey]:
        result = await self.db.execute(select(ApiKey).order_by(ApiKey.created_at.desc()))
        return list(result.scalars().all())

    async def create(self, data: dict) -> ApiKey:
        key = ApiKey(**data)
        self.db.add(key)
        await self.db.commit()
        await self.db.refresh(key)
        return key

    async def revoke(self, key_id: UUID) -> bool:
        result = await self.db.execute(
            update(ApiKey).where(ApiKey.id == key_id).values(is_active=False)
        )
        await self.db.commit()
        return result.rowcount > 0


class DataConnectionDAO:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self) -> List[DataConnection]:
        result = await self.db.execute(select(DataConnection).order_by(DataConnection.name))
        return list(result.scalars().all())

    async def get_by_id(self, conn_id: UUID) -> Optional[DataConnection]:
        result = await self.db.execute(select(DataConnection).where(DataConnection.id == conn_id))
        return result.scalar_one_or_none()

    async def create(self, data: dict) -> DataConnection:
        conn = DataConnection(**data)
        self.db.add(conn)
        await self.db.commit()
        await self.db.refresh(conn)
        return conn

    async def update(self, conn_id: UUID, data: dict) -> Optional[DataConnection]:
        await self.db.execute(update(DataConnection).where(DataConnection.id == conn_id).values(**data))
        await self.db.commit()
        return await self.get_by_id(conn_id)


class AuditLogDAO:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self, resource_type: Optional[str] = None, action: Optional[str] = None,
                      limit: int = 100, offset: int = 0) -> List[AuditLog]:
        q = select(AuditLog)
        if resource_type:
            q = q.where(AuditLog.resource_type == resource_type)
        if action:
            q = q.where(AuditLog.action == action)
        result = await self.db.execute(q.order_by(AuditLog.created_at.desc()).offset(offset).limit(limit))
        return list(result.scalars().all())

    async def create(self, data: dict) -> AuditLog:
        entry = AuditLog(**data)
        self.db.add(entry)
        await self.db.commit()
        return entry


class SettingsDAO:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self) -> List[PlatformSetting]:
        result = await self.db.execute(select(PlatformSetting).order_by(PlatformSetting.category, PlatformSetting.key))
        return list(result.scalars().all())

    async def get_by_key(self, key: str) -> Optional[PlatformSetting]:
        result = await self.db.execute(select(PlatformSetting).where(PlatformSetting.key == key))
        return result.scalar_one_or_none()

    async def upsert(self, key: str, value: str, updated_by: str = None):
        existing = await self.get_by_key(key)
        if existing:
            await self.db.execute(
                update(PlatformSetting).where(PlatformSetting.key == key)
                    .values(value=value, updated_by=updated_by)
            )
        else:
            self.db.add(PlatformSetting(key=key, value=value, updated_by=updated_by))
        await self.db.commit()
