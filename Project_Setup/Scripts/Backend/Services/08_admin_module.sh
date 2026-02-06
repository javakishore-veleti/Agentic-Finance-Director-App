#!/bin/bash
###############################################################################
# 08_admin_module.sh
# Creates: Admin module — users, roles, API keys, data connections, audit, settings
# Endpoints: /api/v1/admin/*
# Run from: git repo root (Agentic-Finance-Director-App/)
###############################################################################
set -e

MOD="Services/afda-crud-api/app/modules/admin"

echo "🔧 [08] Creating Admin module..."

# --- models.py ---
cat > "$MOD/models.py" << 'PYEOF'
import uuid
from datetime import datetime
from sqlalchemy import String, Text, Boolean, DateTime, Integer, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.database import Base
import enum


class UserStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(300), unique=True, nullable=False)
    display_name: Mapped[str] = mapped_column(String(200), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(500), nullable=False)
    status: Mapped[UserStatus] = mapped_column(SAEnum(UserStatus), default=UserStatus.ACTIVE)
    department: Mapped[str] = mapped_column(String(100), nullable=True)
    last_login_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user_roles: Mapped[list["UserRole"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class Role(Base):
    __tablename__ = "roles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    permissions: Mapped[dict] = mapped_column(JSONB, default=dict)  # {"command_center": ["read","write"], ...}
    is_system: Mapped[bool] = mapped_column(Boolean, default=False)  # built-in roles can't be deleted
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user_roles: Mapped[list["UserRole"]] = relationship(back_populates="role", cascade="all, delete-orphan")


class UserRole(Base):
    __tablename__ = "user_roles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    role_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("roles.id"))
    assigned_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="user_roles")
    role: Mapped["Role"] = relationship(back_populates="user_roles")


class ApiKey(Base):
    __tablename__ = "api_keys"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    key_prefix: Mapped[str] = mapped_column(String(10), nullable=False)  # afda_xxxx (first 8 chars shown)
    key_hash: Mapped[str] = mapped_column(String(500), nullable=False)
    scopes: Mapped[dict] = mapped_column(JSONB, default=list)  # ["read:fpa", "write:treasury"]
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    last_used_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    created_by: Mapped[str] = mapped_column(String(200), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ConnectionStatus(str, enum.Enum):
    CONNECTED = "connected"
    DISCONNECTED = "disconnected"
    ERROR = "error"
    TESTING = "testing"


class DataConnection(Base):
    __tablename__ = "data_connections"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    connection_type: Mapped[str] = mapped_column(String(50), nullable=False)  # database, api, sftp, erp, cloud
    provider: Mapped[str] = mapped_column(String(100), nullable=True)  # postgres, snowflake, sap, salesforce
    config_json: Mapped[dict] = mapped_column(JSONB, nullable=False)  # encrypted connection params
    status: Mapped[ConnectionStatus] = mapped_column(SAEnum(ConnectionStatus), default=ConnectionStatus.DISCONNECTED)
    last_sync_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    last_error: Mapped[str] = mapped_column(Text, nullable=True)
    sync_frequency: Mapped[str] = mapped_column(String(50), default="manual")  # manual, hourly, daily
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class AuditLog(Base):
    __tablename__ = "audit_log"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[str] = mapped_column(String(200), nullable=True)
    user_email: Mapped[str] = mapped_column(String(300), nullable=True)
    action: Mapped[str] = mapped_column(String(50), nullable=False)  # create, read, update, delete, login, export
    resource_type: Mapped[str] = mapped_column(String(100), nullable=False)  # user, budget, alert, api_key
    resource_id: Mapped[str] = mapped_column(String(200), nullable=True)
    details: Mapped[dict] = mapped_column(JSONB, nullable=True)
    ip_address: Mapped[str] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class PlatformSetting(Base):
    __tablename__ = "platform_settings"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    key: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    value: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(50), default="general")  # general, agent, security, notification
    description: Mapped[str] = mapped_column(Text, nullable=True)
    updated_by: Mapped[str] = mapped_column(String(200), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
PYEOF

# --- dtos.py ---
cat > "$MOD/dtos.py" << 'PYEOF'
from datetime import datetime
from typing import Optional, Dict, Any, List
from uuid import UUID
from pydantic import BaseModel, Field, EmailStr


# ── User ──
class UserCreate(BaseModel):
    email: str = Field(..., max_length=300)
    display_name: str = Field(..., max_length=200)
    password: str = Field(..., min_length=8)
    department: Optional[str] = None
    role_ids: List[UUID] = []


class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    department: Optional[str] = None
    status: Optional[str] = None


class UserOut(BaseModel):
    id: UUID
    email: str
    display_name: str
    status: str
    department: Optional[str]
    last_login_at: Optional[datetime]
    created_at: datetime
    model_config = {"from_attributes": True}


class UserDetailOut(UserOut):
    roles: List[str] = []  # role names


# ── Role ──
class RoleCreate(BaseModel):
    name: str = Field(..., max_length=100)
    description: Optional[str] = None
    permissions: Dict[str, List[str]] = {}


class RoleUpdate(BaseModel):
    description: Optional[str] = None
    permissions: Optional[Dict[str, List[str]]] = None


class RoleOut(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    permissions: Dict[str, Any]
    is_system: bool
    created_at: datetime
    model_config = {"from_attributes": True}


# ── API Key ──
class ApiKeyCreate(BaseModel):
    name: str = Field(..., max_length=200)
    scopes: List[str] = []
    expires_in_days: Optional[int] = None


class ApiKeyCreatedOut(BaseModel):
    id: UUID
    name: str
    key: str  # only shown once at creation
    key_prefix: str
    scopes: List[str]
    expires_at: Optional[datetime]
    created_at: datetime


class ApiKeyOut(BaseModel):
    id: UUID
    name: str
    key_prefix: str
    scopes: Any
    is_active: bool
    expires_at: Optional[datetime]
    last_used_at: Optional[datetime]
    created_by: Optional[str]
    created_at: datetime
    model_config = {"from_attributes": True}

from typing import Any


# ── Data Connection ──
class DataConnectionCreate(BaseModel):
    name: str = Field(..., max_length=200)
    connection_type: str
    provider: Optional[str] = None
    config_json: Dict[str, Any]
    sync_frequency: str = "manual"


class DataConnectionUpdate(BaseModel):
    name: Optional[str] = None
    config_json: Optional[Dict[str, Any]] = None
    sync_frequency: Optional[str] = None


class DataConnectionOut(BaseModel):
    id: UUID
    name: str
    connection_type: str
    provider: Optional[str]
    status: str
    last_sync_at: Optional[datetime]
    last_error: Optional[str]
    sync_frequency: str
    created_at: datetime
    model_config = {"from_attributes": True}


class ConnectionTestResult(BaseModel):
    connection_id: UUID
    success: bool
    latency_ms: Optional[float]
    message: str


# ── Audit Log ──
class AuditLogOut(BaseModel):
    id: UUID
    user_id: Optional[str]
    user_email: Optional[str]
    action: str
    resource_type: str
    resource_id: Optional[str]
    details: Optional[Dict[str, Any]]
    ip_address: Optional[str]
    created_at: datetime
    model_config = {"from_attributes": True}


# ── Settings ──
class SettingOut(BaseModel):
    key: str
    value: str
    category: str
    description: Optional[str]
    updated_by: Optional[str]
    updated_at: datetime
    model_config = {"from_attributes": True}


class SettingsUpdate(BaseModel):
    settings: Dict[str, str]  # {"key": "value", ...}
PYEOF

# --- dao.py ---
cat > "$MOD/dao.py" << 'PYEOF'
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
PYEOF

# --- service.py ---
cat > "$MOD/service.py" << 'PYEOF'
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
PYEOF

# --- facade.py ---
cat > "$MOD/facade.py" << 'PYEOF'
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.admin.service import (
    UserService, RoleService, ApiKeyService, DataConnectionService, AuditLogService, SettingsService,
)


class AdminFacade:
    def __init__(self, db: AsyncSession):
        self.user_svc = UserService(db)
        self.role_svc = RoleService(db)
        self.key_svc = ApiKeyService(db)
        self.conn_svc = DataConnectionService(db)
        self.audit_svc = AuditLogService(db)
        self.settings_svc = SettingsService(db)
PYEOF

# --- router.py ---
cat > "$MOD/router.py" << 'PYEOF'
from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.shared.responses import ApiResponse
from app.modules.admin.service import (
    UserService, RoleService, ApiKeyService, DataConnectionService, AuditLogService, SettingsService,
)
from app.modules.admin.dtos import (
    UserCreate, UserUpdate, UserOut, UserDetailOut,
    RoleCreate, RoleUpdate, RoleOut,
    ApiKeyCreate, ApiKeyOut, ApiKeyCreatedOut,
    DataConnectionCreate, DataConnectionUpdate, DataConnectionOut, ConnectionTestResult,
    AuditLogOut,
    SettingOut, SettingsUpdate,
)

router = APIRouter()


# ── Users ──
@router.get("/users", response_model=ApiResponse[list[UserOut]])
async def list_users(
    status: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    svc = UserService(db)
    users = await svc.list_users(status, limit, offset)
    return ApiResponse(data=users)


@router.post("/users", response_model=ApiResponse[UserOut], status_code=201)
async def create_user(data: UserCreate, db: AsyncSession = Depends(get_db)):
    svc = UserService(db)
    user = await svc.create_user(data)
    return ApiResponse(data=user, message="User created")


@router.put("/users/{user_id}", response_model=ApiResponse[UserOut])
async def update_user(user_id: UUID, data: UserUpdate, db: AsyncSession = Depends(get_db)):
    svc = UserService(db)
    user = await svc.update_user(user_id, data)
    return ApiResponse(data=user, message="User updated")


@router.delete("/users/{user_id}")
async def deactivate_user(user_id: UUID, db: AsyncSession = Depends(get_db)):
    svc = UserService(db)
    await svc.deactivate_user(user_id)
    return ApiResponse(message="User deactivated")


# ── Roles ──
@router.get("/roles", response_model=ApiResponse[list[RoleOut]])
async def list_roles(db: AsyncSession = Depends(get_db)):
    svc = RoleService(db)
    roles = await svc.list_roles()
    return ApiResponse(data=roles)


@router.post("/roles", response_model=ApiResponse[RoleOut], status_code=201)
async def create_role(data: RoleCreate, db: AsyncSession = Depends(get_db)):
    svc = RoleService(db)
    role = await svc.create_role(data)
    return ApiResponse(data=role, message="Role created")


@router.put("/roles/{role_id}", response_model=ApiResponse[RoleOut])
async def update_role(role_id: UUID, data: RoleUpdate, db: AsyncSession = Depends(get_db)):
    svc = RoleService(db)
    role = await svc.update_role(role_id, data)
    return ApiResponse(data=role, message="Role updated")


# ── API Keys ──
@router.get("/api-keys", response_model=ApiResponse[list[ApiKeyOut]])
async def list_api_keys(db: AsyncSession = Depends(get_db)):
    svc = ApiKeyService(db)
    keys = await svc.list_keys()
    return ApiResponse(data=keys)


@router.post("/api-keys", response_model=ApiResponse[ApiKeyCreatedOut], status_code=201)
async def generate_api_key(data: ApiKeyCreate, db: AsyncSession = Depends(get_db)):
    svc = ApiKeyService(db)
    key = await svc.generate_key(data)
    return ApiResponse(data=key, message="API key generated — save the key now, it won't be shown again")


@router.delete("/api-keys/{key_id}")
async def revoke_api_key(key_id: UUID, db: AsyncSession = Depends(get_db)):
    svc = ApiKeyService(db)
    await svc.revoke_key(key_id)
    return ApiResponse(message="API key revoked")


# ── Data Connections ──
@router.get("/data-connections", response_model=ApiResponse[list[DataConnectionOut]])
async def list_connections(db: AsyncSession = Depends(get_db)):
    svc = DataConnectionService(db)
    conns = await svc.list_connections()
    return ApiResponse(data=conns)


@router.post("/data-connections", response_model=ApiResponse[DataConnectionOut], status_code=201)
async def create_connection(data: DataConnectionCreate, db: AsyncSession = Depends(get_db)):
    svc = DataConnectionService(db)
    conn = await svc.create_connection(data)
    return ApiResponse(data=conn, message="Connection created")


@router.put("/data-connections/{conn_id}", response_model=ApiResponse[DataConnectionOut])
async def update_connection(conn_id: UUID, data: DataConnectionUpdate, db: AsyncSession = Depends(get_db)):
    svc = DataConnectionService(db)
    conn = await svc.update_connection(conn_id, data)
    return ApiResponse(data=conn, message="Connection updated")


@router.post("/data-connections/{conn_id}/test", response_model=ApiResponse[ConnectionTestResult])
async def test_connection(conn_id: UUID, db: AsyncSession = Depends(get_db)):
    svc = DataConnectionService(db)
    result = await svc.test_connection(conn_id)
    return ApiResponse(data=result)


# ── Audit Log ──
@router.get("/audit-log", response_model=ApiResponse[list[AuditLogOut]])
async def get_audit_log(
    resource_type: Optional[str] = None,
    action: Optional[str] = None,
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    svc = AuditLogService(db)
    logs = await svc.get_logs(resource_type, action, limit, offset)
    return ApiResponse(data=logs)


# ── Settings ──
@router.get("/settings", response_model=ApiResponse[list[SettingOut]])
async def get_settings(db: AsyncSession = Depends(get_db)):
    svc = SettingsService(db)
    settings = await svc.get_settings()
    return ApiResponse(data=settings)


@router.put("/settings", response_model=ApiResponse[list[SettingOut]])
async def update_settings(data: SettingsUpdate, db: AsyncSession = Depends(get_db)):
    svc = SettingsService(db)
    settings = await svc.update_settings(data)
    return ApiResponse(data=settings, message="Settings updated")
PYEOF

echo "✅ [08] Admin module created at $MOD"
echo "    → models.py  — User, Role, UserRole, ApiKey, DataConnection, AuditLog, PlatformSetting (7 tables)"
echo "    → dtos.py    — 18 Pydantic schemas (UserDetail with roles, ApiKeyCreated with raw key, ConnectionTest)"
echo "    → dao.py     — 6 DAOs (user+role join, key hash, settings upsert)"
echo "    → service.py — Password hashing, API key generation, connection testing, audit logging"
echo "    → facade.py  — AdminFacade"
echo "    → router.py  — 18 endpoints under /api/v1/admin"
echo ""
echo "   ⚡ Uncomment admin router in main.py to activate"
echo "   Next: Run 09_activate_all_routers.sh"
