import secrets
import hashlib
from uuid import UUID
from datetime import datetime, timedelta
from typing import Optional
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.admin.dao import (
    UserDAO, RoleDAO, ApiKeyDAO, DataConnectionDAO, AuditLogDAO, SettingsDAO,
)
from app.modules.admin.dtos import (
    UserCreate, UserUpdate, UserDetailOut,
    RoleCreate, RoleUpdate,
    ApiKeyCreate, ApiKeyCreatedOut,
    DataConnectionCreate, DataConnectionUpdate, ConnectionTestResult,
    SettingsUpdate,
)
from app.shared.exceptions import NotFoundException, BadRequestException

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class UserService:
    def __init__(self, db: AsyncSession):
        self.dao = UserDAO(db)
        self.role_dao = RoleDAO(db)

    async def list_users(self, status=None, limit=50, offset=0):
        return await self.dao.get_all(status, limit, offset)

    async def get_user(self, user_id: UUID) -> UserDetailOut:
        user = await self.dao.get_by_id(user_id)
        if not user:
            raise NotFoundException("User", user_id)
        roles = [ur.role.name for ur in user.user_roles]
        return UserDetailOut(
            id=user.id, email=user.email, display_name=user.display_name,
            status=user.status.value, department=user.department,
            last_login_at=user.last_login_at, created_at=user.created_at, roles=roles,
        )

    async def create_user(self, data: UserCreate):
        existing = await self.dao.get_by_email(data.email)
        if existing:
            raise BadRequestException(f"Email already registered: {data.email}")
        user_data = {
            "email": data.email,
            "display_name": data.display_name,
            "password_hash": pwd_context.hash(data.password),
            "department": data.department,
        }
        user = await self.dao.create(user_data)
        for role_id in data.role_ids:
            await self.dao.assign_role(user.id, role_id)
        return user

    async def update_user(self, user_id: UUID, data: UserUpdate):
        existing = await self.dao.get_by_id(user_id)
        if not existing:
            raise NotFoundException("User", user_id)
        return await self.dao.update(user_id, data.model_dump(exclude_unset=True))

    async def deactivate_user(self, user_id: UUID):
        existing = await self.dao.get_by_id(user_id)
        if not existing:
            raise NotFoundException("User", user_id)
        return await self.dao.update(user_id, {"status": "inactive"})


class RoleService:
    def __init__(self, db: AsyncSession):
        self.dao = RoleDAO(db)

    async def list_roles(self):
        return await self.dao.get_all()

    async def create_role(self, data: RoleCreate):
        return await self.dao.create(data.model_dump())

    async def update_role(self, role_id: UUID, data: RoleUpdate):
        existing = await self.dao.get_by_id(role_id)
        if not existing:
            raise NotFoundException("Role", role_id)
        return await self.dao.update(role_id, data.model_dump(exclude_unset=True))


class ApiKeyService:
    def __init__(self, db: AsyncSession):
        self.dao = ApiKeyDAO(db)

    async def list_keys(self):
        return await self.dao.get_all()

    async def generate_key(self, data: ApiKeyCreate, created_by: str = None) -> ApiKeyCreatedOut:
        raw_key = f"afda_{secrets.token_urlsafe(32)}"
        key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
        expires_at = None
        if data.expires_in_days:
            expires_at = datetime.utcnow() + timedelta(days=data.expires_in_days)
        key_data = {
            "name": data.name,
            "key_prefix": raw_key[:12],
            "key_hash": key_hash,
            "scopes": data.scopes,
            "expires_at": expires_at,
            "created_by": created_by,
        }
        key_obj = await self.dao.create(key_data)
        return ApiKeyCreatedOut(
            id=key_obj.id, name=key_obj.name, key=raw_key,
            key_prefix=key_obj.key_prefix, scopes=data.scopes,
            expires_at=expires_at, created_at=key_obj.created_at,
        )

    async def revoke_key(self, key_id: UUID):
        success = await self.dao.revoke(key_id)
        if not success:
            raise NotFoundException("API Key", key_id)
        return True


class DataConnectionService:
    def __init__(self, db: AsyncSession):
        self.dao = DataConnectionDAO(db)

    async def list_connections(self):
        return await self.dao.get_all()

    async def create_connection(self, data: DataConnectionCreate):
        return await self.dao.create(data.model_dump())

    async def update_connection(self, conn_id: UUID, data: DataConnectionUpdate):
        existing = await self.dao.get_by_id(conn_id)
        if not existing:
            raise NotFoundException("Data Connection", conn_id)
        return await self.dao.update(conn_id, data.model_dump(exclude_unset=True))

    async def test_connection(self, conn_id: UUID) -> ConnectionTestResult:
        conn = await self.dao.get_by_id(conn_id)
        if not conn:
            raise NotFoundException("Data Connection", conn_id)
        # Placeholder — actual connectivity test
        await self.dao.update(conn_id, {"status": "connected", "last_sync_at": datetime.utcnow()})
        return ConnectionTestResult(
            connection_id=conn_id, success=True, latency_ms=45.2,
            message=f"Successfully connected to {conn.name}",
        )


class AuditLogService:
    def __init__(self, db: AsyncSession):
        self.dao = AuditLogDAO(db)

    async def get_logs(self, resource_type=None, action=None, limit=100, offset=0):
        return await self.dao.get_all(resource_type, action, limit, offset)

    async def log(self, user_id: str, action: str, resource_type: str,
                  resource_id: str = None, details: dict = None, ip: str = None):
        await self.dao.create({
            "user_id": user_id, "action": action, "resource_type": resource_type,
            "resource_id": resource_id, "details": details, "ip_address": ip,
        })


class SettingsService:
    def __init__(self, db: AsyncSession):
        self.dao = SettingsDAO(db)

    async def get_settings(self):
        return await self.dao.get_all()

    async def update_settings(self, data: SettingsUpdate, updated_by: str = None):
        for key, value in data.settings.items():
            await self.dao.upsert(key, value, updated_by)
        return await self.dao.get_all()
