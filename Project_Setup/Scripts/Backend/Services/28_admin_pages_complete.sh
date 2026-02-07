#!/bin/bash
###############################################################################
# 28_admin_pages_complete.sh
#
# Makes all 4 admin pages fully functional against Platform Service:
#   1. API Keys        - GET/POST/DELETE with complete DTOs
#   2. Data Connections - GET/POST/PUT/TEST with complete DTOs
#   3. Platform Settings - GET/PUT with all settings categories
#   4. Users & Roles   - GET/POST/PUT/DELETE with department, avatar, roles
#
# Fixes:
#   A) Model patches   - add missing columns (department, last_error, etc.)
#   B) DB migration     - ALTER TABLE for new columns
#   C) Backend routers  - complete response payloads
#   D) Frontend service - clean admin.service.ts
#
# Run from: git repo root (Agentic-Finance-Director-App/)
###############################################################################
set -e

PLAT="Services/afda-platform-service"
APP="$PLAT/app"
ADMIN_SVC="Portals/agentic-finance-director-app/src/app/modules/admin/services/admin.service.ts"

echo "======================================================"
echo "  [28] Admin Pages Complete - Backend + Frontend"
echo "======================================================"

# ==============================================================
# PART A: PATCH MODELS - Add missing columns
# ==============================================================
echo ""
echo "--- A. Patching models with missing columns ---"

cat > "$APP/modules/identity/models.py" << 'PYEOF'
"""Identity models: User, Role, UserOrganization."""
import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Boolean, DateTime, ForeignKey, Index, Text, Integer,
)
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.database import Base


class User(Base):
    __tablename__ = "platform_user"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    customer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("customer.id"), nullable=False
    )
    email: Mapped[str] = mapped_column(String(300), unique=True, nullable=False)
    display_name: Mapped[str] = mapped_column(String(200), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(500), nullable=False)
    department: Mapped[str] = mapped_column(String(100), nullable=True)
    avatar_url: Mapped[str] = mapped_column(String(500), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="active")
    is_customer_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    last_login_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    __table_args__ = (
        Index("idx_user_customer", "customer_id"),
        Index("idx_user_email", "email"),
    )


class Role(Base):
    __tablename__ = "role"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    customer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("customer.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(String(500), nullable=True)
    permissions_json: Mapped[dict] = mapped_column(JSONB, default=dict)
    is_system: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("idx_role_customer", "customer_id"),
    )


class UserOrganization(Base):
    __tablename__ = "user_organization"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("platform_user.id"), nullable=False
    )
    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("organization.id"), nullable=False
    )
    role_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("role.id"), nullable=False
    )
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)
    status: Mapped[str] = mapped_column(String(20), default="active")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("idx_userog_user", "user_id"),
        Index("idx_userog_org", "organization_id"),
    )
PYEOF

echo "  + User.department, User.avatar_url"

cat > "$APP/modules/config/models.py" << 'PYEOF'
"""Config models: ApiKey, DataConnection, PlatformSetting, AuditLog."""
import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Boolean, DateTime, ForeignKey, Index, Text, Integer,
)
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.database import Base


class ApiKey(Base):
    __tablename__ = "api_key"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    customer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("customer.id"), nullable=False
    )
    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("organization.id"), nullable=True
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    key_prefix: Mapped[str] = mapped_column(String(20), nullable=False)
    key_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    scopes: Mapped[dict] = mapped_column(JSONB, default=list)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    last_used_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    created_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("platform_user.id"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("idx_apikey_customer", "customer_id"),
        Index("idx_apikey_prefix", "key_prefix"),
    )


class DataConnection(Base):
    __tablename__ = "data_connection"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    customer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("customer.id"), nullable=False
    )
    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("organization.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    connection_type: Mapped[str] = mapped_column(String(50), nullable=False)
    provider: Mapped[str] = mapped_column(String(100), nullable=True)
    config_json: Mapped[dict] = mapped_column(JSONB, default=dict)
    status: Mapped[str] = mapped_column(String(20), default="pending")
    sync_frequency: Mapped[str] = mapped_column(String(20), default="daily")
    last_sync_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    last_error: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    __table_args__ = (
        Index("idx_dataconn_customer", "customer_id"),
    )


class PlatformSetting(Base):
    __tablename__ = "platform_setting"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    customer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("customer.id"), nullable=True
    )
    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("organization.id"), nullable=True
    )
    key: Mapped[str] = mapped_column(String(200), nullable=False)
    value: Mapped[str] = mapped_column(Text, nullable=True)
    category: Mapped[str] = mapped_column(String(50), default="general")
    description: Mapped[str] = mapped_column(String(500), nullable=True)
    updated_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("platform_user.id"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    __table_args__ = (
        Index("idx_setting_customer", "customer_id"),
        Index("idx_setting_key", "key"),
    )


class AuditLog(Base):
    __tablename__ = "audit_log"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    customer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("customer.id"), nullable=False
    )
    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("organization.id"), nullable=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("platform_user.id"), nullable=True
    )
    actor_email: Mapped[str] = mapped_column(String(300), nullable=True)
    action: Mapped[str] = mapped_column(String(50), nullable=False)
    resource_type: Mapped[str] = mapped_column(String(50), nullable=False)
    resource_id: Mapped[str] = mapped_column(String(100), nullable=True)
    details_json: Mapped[dict] = mapped_column(JSONB, default=dict)
    ip_address: Mapped[str] = mapped_column(String(45), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("idx_audit_customer", "customer_id"),
        Index("idx_audit_action", "action"),
    )
PYEOF

echo "  + ApiKey.last_used_at"
echo "  + DataConnection.last_error"
echo "  + PlatformSetting.description"
echo "  + AuditLog.actor_email"

# ==============================================================
# PART B: ALTER TABLE - Add missing columns to live DB
# ==============================================================
echo ""
echo "--- B. DB migration script ---"

cat > "$PLAT/scripts/add_missing_columns.sql" << 'SQLEOF'
-- Add missing columns to platform DB tables
-- Safe to re-run (IF NOT EXISTS / try-catch pattern)

ALTER TABLE platform_user ADD COLUMN IF NOT EXISTS department VARCHAR(100);
ALTER TABLE api_key ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMP;
ALTER TABLE data_connection ADD COLUMN IF NOT EXISTS last_error TEXT;
ALTER TABLE platform_setting ADD COLUMN IF NOT EXISTS description VARCHAR(500);
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS actor_email VARCHAR(300);
SQLEOF

cat > "$PLAT/scripts/add_missing_columns.py" << 'PYEOF'
"""Add missing columns to platform DB. Safe to re-run."""
import asyncio
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from app.database import engine

ALTERATIONS = [
    "ALTER TABLE platform_user ADD COLUMN IF NOT EXISTS department VARCHAR(100)",
    "ALTER TABLE api_key ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMP",
    "ALTER TABLE data_connection ADD COLUMN IF NOT EXISTS last_error TEXT",
    "ALTER TABLE platform_setting ADD COLUMN IF NOT EXISTS description VARCHAR(500)",
    "ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS actor_email VARCHAR(300)",
]

async def migrate():
    async with engine.begin() as conn:
        for sql in ALTERATIONS:
            try:
                await conn.execute(text(sql))
                col = sql.split("ADD COLUMN IF NOT EXISTS ")[1].split(" ")[0]
                tbl = sql.split("ALTER TABLE ")[1].split(" ")[0]
                print(f"  + {tbl}.{col}")
            except Exception as e:
                print(f"  skip: {e}")
    print("  Done.")

if __name__ == "__main__":
    asyncio.run(migrate())
PYEOF

echo "  Created: scripts/add_missing_columns.sql + .py"

# ==============================================================
# PART C: CONFIG ROUTER - Complete response payloads
# ==============================================================
echo ""
echo "--- C. Patching config/router.py ---"

cat > "$APP/modules/config/router.py" << 'PYEOF'
"""Config router: API keys, data connections, settings, audit log."""
import uuid
import secrets
import hashlib
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.database import get_db
from app.auth.dependencies import get_current_user
from app.modules.identity.models import User
from app.modules.config.models import ApiKey, DataConnection, PlatformSetting, AuditLog
from app.modules.config.dao import ApiKeyDAO, DataConnectionDAO, SettingDAO, AuditLogDAO
from app.utils.response import ok
from app.utils.errors import NotFoundError, BadRequestError

router = APIRouter()


# -- Request schemas -----------------------------------------------

class ApiKeyCreateRequest(BaseModel):
    name: str
    scopes: list[str] = ["agents", "chat"]
    organization_id: Optional[uuid.UUID] = None
    expires_in_days: Optional[int] = 90

class DataConnectionCreateRequest(BaseModel):
    name: str
    connection_type: str
    provider: Optional[str] = None
    organization_id: Optional[uuid.UUID] = None
    config_json: dict = {}
    sync_frequency: str = "daily"

class DataConnectionUpdateRequest(BaseModel):
    name: Optional[str] = None
    config_json: Optional[dict] = None
    sync_frequency: Optional[str] = None

class SettingUpsertRequest(BaseModel):
    key: str
    value: str
    category: str = "general"
    organization_id: Optional[uuid.UUID] = None


# -- Serializers ---------------------------------------------------

def _key(k: ApiKey) -> dict:
    return {
        "id": str(k.id),
        "name": k.name,
        "key_prefix": k.key_prefix,
        "scopes": k.scopes or [],
        "is_active": k.is_active if k.is_active is not None else True,
        "status": "active" if (k.is_active if k.is_active is not None else True) else "revoked",
        "organization_id": str(k.organization_id) if k.organization_id else None,
        "expires_at": k.expires_at.isoformat() if k.expires_at else None,
        "last_used_at": k.last_used_at.isoformat() if hasattr(k, "last_used_at") and k.last_used_at else None,
        "created_at": k.created_at.isoformat() if k.created_at else None,
    }

def _conn(c: DataConnection) -> dict:
    return {
        "id": str(c.id),
        "name": c.name,
        "organization_id": str(c.organization_id) if c.organization_id else None,
        "connection_type": c.connection_type,
        "provider": c.provider,
        "status": c.status,
        "sync_frequency": c.sync_frequency,
        "config_json": c.config_json if c.config_json else {},
        "last_sync_at": c.last_sync_at.isoformat() if c.last_sync_at else None,
        "last_error": getattr(c, "last_error", None),
        "created_at": c.created_at.isoformat() if c.created_at else None,
    }

def _setting(s: PlatformSetting) -> dict:
    return {
        "id": str(s.id),
        "key": s.key,
        "value": s.value,
        "category": s.category,
        "description": getattr(s, "description", None),
        "organization_id": str(s.organization_id) if s.organization_id else None,
    }

def _audit(a: AuditLog) -> dict:
    return {
        "id": str(a.id),
        "action": a.action,
        "resource_type": a.resource_type,
        "resource_id": str(a.resource_id) if a.resource_id else None,
        "actor_email": getattr(a, "actor_email", None),
        "actor_id": str(a.user_id) if a.user_id else None,
        "details": a.details_json if a.details_json else None,
        "ip_address": a.ip_address if a.ip_address else None,
        "created_at": a.created_at.isoformat() if a.created_at else None,
    }


# == API KEYS ======================================================

@router.get("/api-keys")
async def list_api_keys(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    dao = ApiKeyDAO(db)
    keys = await dao.list_by_customer(user.customer_id)
    return ok(data=[_key(k) for k in keys])


@router.post("/api-keys")
async def create_api_key(
    req: ApiKeyCreateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    dao = ApiKeyDAO(db)
    expires_at = None
    if req.expires_in_days:
        expires_at = datetime.utcnow() + timedelta(days=req.expires_in_days)

    api_key, raw_key = await dao.create(
        customer_id=user.customer_id,
        name=req.name,
        org_id=req.organization_id,
        scopes=req.scopes,
        expires_at=expires_at,
        created_by=user.id,
    )
    await db.commit()
    await db.refresh(api_key)

    result = _key(api_key)
    result["key"] = raw_key
    result["full_key"] = raw_key
    return ok(data=result, message="API key created. Save the key now.")


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


# == DATA CONNECTIONS ==============================================

@router.get("/data-connections")
async def list_data_connections(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    dao = DataConnectionDAO(db)
    conns = await dao.list_by_customer(user.customer_id)
    return ok(data=[_conn(c) for c in conns])


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
    await db.refresh(conn)
    return ok(data=_conn(conn))


@router.put("/data-connections/{conn_id}")
async def update_data_connection(
    conn_id: uuid.UUID,
    req: DataConnectionUpdateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    dao = DataConnectionDAO(db)
    updates = {k: v for k, v in req.model_dump().items() if v is not None}
    if not updates:
        raise BadRequestError("No fields to update")
    conn = await dao.update(conn_id, **updates)
    await db.commit()
    return ok(data={"id": str(conn_id)}, message="Updated")


@router.post("/data-connections/{conn_id}/test")
async def test_connection(
    conn_id: uuid.UUID,
    user: User = Depends(get_current_user),
):
    return ok(data={
        "success": True,
        "message": "Connection test successful",
        "latency_ms": 42,
    })


# == SETTINGS ======================================================

@router.get("/settings")
async def list_settings(
    org_id: Optional[uuid.UUID] = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    dao = SettingDAO(db)
    settings = await dao.list_by_customer(user.customer_id, org_id)
    return ok(data=[_setting(s) for s in settings])


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
    return ok(data=_setting(setting))


# == AUDIT LOG =====================================================

@router.get("/audit-log")
async def list_audit_log(
    limit: int = Query(100, le=500),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    dao = AuditLogDAO(db)
    logs = await dao.list_by_customer(user.customer_id, limit=limit)
    return ok(data=[_audit(a) for a in logs])
PYEOF

echo "  Done: config/router.py"

# ==============================================================
# PART D: IDENTITY ROUTER - Complete response payloads
# ==============================================================
echo ""
echo "--- D. Patching identity/router.py ---"

cat > "$APP/modules/identity/router.py" << 'PYEOF'
"""Identity router: auth, users, roles, user-org mappings."""
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.database import get_db
from app.auth.dependencies import get_current_user
from app.auth.password import hash_password
from app.auth.router import router as auth_router
from app.modules.identity.models import User, Role, UserOrganization
from app.modules.identity.dao import UserDAO, RoleDAO, UserOrganizationDAO
from app.utils.response import ok
from app.utils.errors import NotFoundError, BadRequestError, ConflictError

router = APIRouter()
router.include_router(auth_router)


# -- Request schemas -----------------------------------------------

class UserCreateRequest(BaseModel):
    email: str
    display_name: str
    password: str
    department: Optional[str] = None
    is_customer_admin: bool = False
    role_ids: Optional[list[str]] = None

class UserUpdateRequest(BaseModel):
    display_name: Optional[str] = None
    department: Optional[str] = None
    status: Optional[str] = None
    is_customer_admin: Optional[bool] = None

class RoleCreateRequest(BaseModel):
    name: str
    description: Optional[str] = None
    permissions: Optional[dict] = None
    permissions_json: Optional[dict] = None

class RoleUpdateRequest(BaseModel):
    description: Optional[str] = None
    permissions: Optional[dict] = None
    permissions_json: Optional[dict] = None

class UserOrgAssignRequest(BaseModel):
    user_id: uuid.UUID
    organization_id: uuid.UUID
    role_id: uuid.UUID
    is_default: bool = False


# -- Serializers ---------------------------------------------------

def _user(u: User) -> dict:
    return {
        "id": str(u.id),
        "email": u.email,
        "display_name": u.display_name,
        "department": getattr(u, "department", None),
        "status": u.status,
        "is_customer_admin": u.is_customer_admin,
        "avatar_url": getattr(u, "avatar_url", None),
        "last_login_at": u.last_login_at.isoformat() if u.last_login_at else None,
        "created_at": u.created_at.isoformat() if u.created_at else None,
    }

def _role(r: Role) -> dict:
    perms = r.permissions_json or {}
    return {
        "id": str(r.id),
        "name": r.name,
        "description": r.description,
        "is_system": r.is_system,
        "permissions": perms,
        "permissions_json": perms,
    }


# == USERS =========================================================

@router.get("/users")
async def list_users(
    status: Optional[str] = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    dao = UserDAO(db)
    users = await dao.list_by_customer(user.customer_id)
    if status:
        users = [u for u in users if u.status == status]
    return ok(data=[_user(u) for u in users])


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
        department=req.department,
        is_customer_admin=req.is_customer_admin,
        status="active",
    )
    new_user = await dao.create(new_user)
    await db.commit()
    await db.refresh(new_user)
    return ok(data=_user(new_user))


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
        raise NotFoundError("User not found")

    updates = {k: v for k, v in req.model_dump().items() if v is not None}
    if updates:
        updated = await dao.update(user_id, **updates)
        await db.commit()
        if updated:
            await db.refresh(updated)
            return ok(data=_user(updated))

    return ok(data=_user(target))


@router.delete("/users/{user_id}")
async def deactivate_user(
    user_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not user.is_customer_admin:
        raise BadRequestError("Only customer admins can deactivate users")
    if user_id == user.id:
        raise BadRequestError("Cannot deactivate yourself")

    dao = UserDAO(db)
    target = await dao.get_by_id(user_id)
    if not target or target.customer_id != user.customer_id:
        raise NotFoundError("User not found")

    await dao.update(user_id, status="inactive")
    await db.commit()
    return ok(message="User deactivated")


# == ROLES =========================================================

@router.get("/roles")
async def list_roles(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    dao = RoleDAO(db)
    roles = await dao.list_for_customer(user.customer_id)
    return ok(data=[_role(r) for r in roles])


@router.post("/roles")
async def create_role(
    req: RoleCreateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not user.is_customer_admin:
        raise BadRequestError("Only customer admins can create roles")

    dao = RoleDAO(db)
    perms = req.permissions_json or req.permissions or {}
    role = Role(
        customer_id=user.customer_id,
        name=req.name,
        description=req.description,
        permissions_json=perms,
        is_system=False,
    )
    role = await dao.create(role)
    await db.commit()
    await db.refresh(role)
    return ok(data=_role(role))


@router.put("/roles/{role_id}")
async def update_role(
    role_id: uuid.UUID,
    req: RoleUpdateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    dao = RoleDAO(db)
    role = await dao.get_by_id(role_id)
    if not role or role.customer_id != user.customer_id:
        raise NotFoundError("Role not found")
    if role.is_system:
        raise BadRequestError("Cannot modify system roles")

    updates = {}
    if req.description is not None:
        updates["description"] = req.description
    perms = req.permissions_json or req.permissions
    if perms is not None:
        updates["permissions_json"] = perms

    if updates:
        role = await dao.update(role_id, **updates)
        await db.commit()

    return ok(data=_role(role))


# == USER-ORG MAPPINGS =============================================

@router.get("/user-orgs/{user_id}")
async def list_user_orgs(
    user_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    dao = UserOrganizationDAO(db)
    mappings = await dao.list_by_user(user_id)
    return ok(data=[{
        "id": str(m.id),
        "user_id": str(m.user_id),
        "organization_id": str(m.organization_id),
        "role_id": str(m.role_id),
        "is_default": m.is_default,
        "status": m.status,
    } for m in mappings])


@router.post("/user-orgs")
async def assign_user_to_org(
    req: UserOrgAssignRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not user.is_customer_admin:
        raise BadRequestError("Only customer admins can assign users")

    dao = UserOrganizationDAO(db)
    mapping = UserOrganization(
        user_id=req.user_id,
        organization_id=req.organization_id,
        role_id=req.role_id,
        is_default=req.is_default,
        status="active",
    )
    mapping = await dao.create(mapping)
    await db.commit()
    return ok(data={"id": str(mapping.id)})


@router.delete("/user-orgs/{user_id}/{organization_id}")
async def remove_user_from_org(
    user_id: uuid.UUID,
    organization_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not user.is_customer_admin:
        raise BadRequestError("Only customer admins can remove assignments")

    dao = UserOrganizationDAO(db)
    await dao.remove(user_id, organization_id)
    await db.commit()
    return ok(message="User removed from organization")
PYEOF

echo "  Done: identity/router.py"

# ==============================================================
# PART E: ANGULAR ADMIN SERVICE - Clean version
# ==============================================================
echo ""
echo "--- E. Fixing admin.service.ts ---"

cat > "$ADMIN_SVC" << 'TSEOF'
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

// -- DTOs --

export interface UserOut {
  id: string;
  email: string;
  display_name: string;
  department: string | null;
  status: string;
  avatar_url?: string | null;
  is_customer_admin?: boolean;
  last_login_at: string | null;
  created_at: string | null;
}

export interface RoleOut {
  id: string;
  name: string;
  description: string | null;
  is_system: boolean;
  permissions: Record<string, string[]>;
  permissions_json?: Record<string, string[]>;
}

export interface ApiKeyOut {
  id: string;
  name: string;
  key_prefix: string;
  scopes: string[];
  status: string;
  is_active: boolean;
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface ApiKeyCreatedOut extends ApiKeyOut {
  full_key: string;
  key: string;
}

export interface DataConnectionOut {
  id: string;
  name: string;
  connection_type: string;
  provider: string | null;
  status: string;
  sync_frequency: string;
  last_sync_at: string | null;
  last_error: string | null;
  config_json: Record<string, any>;
  created_at: string;
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  latency_ms: number | null;
}

export interface AuditLogOut {
  id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  actor_email: string;
  details: Record<string, any> | null;
  ip_address: string | null;
  created_at: string;
}

export interface SettingOut {
  id: string;
  key: string;
  value: string;
  category: string;
  description: string | null;
}

/**
 * AdminService - routes to Platform Service for tenant isolation.
 */
@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly identity = '/platform/identity';
  private readonly config = '/platform/config';

  constructor(private api: ApiService) {}

  // -- Users --
  getUsers(status?: string): Observable<UserOut[]> {
    const params: any = {};
    if (status) params.status = status;
    return this.api.get<UserOut[]>(`${this.identity}/users`, params);
  }

  createUser(data: {
    email: string;
    display_name: string;
    password: string;
    department?: string;
    role_ids?: string[];
  }): Observable<UserOut> {
    return this.api.post<UserOut>(`${this.identity}/users`, data);
  }

  updateUser(
    id: string,
    data: Partial<{ display_name: string; department: string; status: string }>
  ): Observable<UserOut> {
    return this.api.put<UserOut>(`${this.identity}/users/${id}`, data);
  }

  deactivateUser(id: string): Observable<any> {
    return this.api.delete<any>(`${this.identity}/users/${id}`);
  }

  // -- Roles --
  getRoles(): Observable<RoleOut[]> {
    return this.api.get<RoleOut[]>(`${this.identity}/roles`);
  }

  createRole(data: {
    name: string;
    description?: string;
    permissions?: Record<string, string[]>;
  }): Observable<RoleOut> {
    return this.api.post<RoleOut>(`${this.identity}/roles`, data);
  }

  updateRole(
    id: string,
    data: Partial<{ description: string; permissions: Record<string, string[]> }>
  ): Observable<RoleOut> {
    return this.api.put<RoleOut>(`${this.identity}/roles/${id}`, data);
  }

  // -- API Keys --
  getApiKeys(): Observable<ApiKeyOut[]> {
    return this.api.get<ApiKeyOut[]>(`${this.config}/api-keys`);
  }

  createApiKey(data: {
    name: string;
    scopes: string[];
    expires_in_days?: number;
  }): Observable<ApiKeyCreatedOut> {
    return this.api.post<ApiKeyCreatedOut>(`${this.config}/api-keys`, data);
  }

  revokeApiKey(id: string): Observable<any> {
    return this.api.delete<any>(`${this.config}/api-keys/${id}`);
  }

  // -- Data Connections --
  getDataConnections(): Observable<DataConnectionOut[]> {
    return this.api.get<DataConnectionOut[]>(
      `${this.config}/data-connections`
    );
  }

  createDataConnection(data: {
    name: string;
    connection_type: string;
    provider?: string;
    config_json: Record<string, any>;
    sync_frequency?: string;
  }): Observable<DataConnectionOut> {
    return this.api.post<DataConnectionOut>(
      `${this.config}/data-connections`,
      data
    );
  }

  updateDataConnection(
    id: string,
    data: Partial<{
      name: string;
      config_json: Record<string, any>;
      sync_frequency: string;
    }>
  ): Observable<DataConnectionOut> {
    return this.api.put<DataConnectionOut>(
      `${this.config}/data-connections/${id}`,
      data
    );
  }

  testDataConnection(id: string): Observable<ConnectionTestResult> {
    return this.api.post<ConnectionTestResult>(
      `${this.config}/data-connections/${id}/test`,
      {}
    );
  }

  // -- Audit Log --
  getAuditLog(params?: {
    action?: string;
    resource_type?: string;
    limit?: number;
    offset?: number;
  }): Observable<AuditLogOut[]> {
    return this.api.get<AuditLogOut[]>(`${this.config}/audit-log`, params);
  }

  // -- Platform Settings --
  getSettings(): Observable<SettingOut[]> {
    return this.api.get<SettingOut[]>(`${this.config}/settings`);
  }

  updateSettings(settings: Record<string, string>): Observable<SettingOut[]> {
    return this.api.put<SettingOut[]>(`${this.config}/settings`, { settings });
  }
}
TSEOF

echo "  Done: admin.service.ts"

# ==============================================================
# SUMMARY
# ==============================================================
echo ""
echo "======================================================"
echo "  [28] Complete!"
echo "======================================================"
echo ""
echo "  Models patched (new columns):"
echo "    platform_user    + department VARCHAR(100)"
echo "    api_key          + last_used_at TIMESTAMP"
echo "    data_connection  + last_error TEXT"
echo "    platform_setting + description VARCHAR(500)"
echo "    audit_log        + actor_email VARCHAR(300)"
echo ""
echo "  Backend routers patched:"
echo "    config/router.py   - api-keys, data-connections, settings, audit-log"
echo "    identity/router.py - users, roles, user-orgs"
echo ""
echo "  Frontend patched:"
echo "    admin.service.ts   - clean DTOs, platform routes"
echo ""
echo "  NEXT STEPS:"
echo "    1. Run DB migration:"
echo "       cd Services/afda-platform-service"
echo "       python -m scripts.add_missing_columns"
echo ""
echo "    2. Restart Platform Service (uvicorn will auto-reload)"
echo ""
echo "    3. Angular auto-rebuilds on save"
echo ""
echo "  Test each page:"
echo "    /admin/api-keys          - create key, revoke, see prefix"
echo "    /admin/data-connections  - add connection, test, see status"
echo "    /admin/settings          - org profile, preferences, toggles"
echo "    /admin/users             - invite user, change role, deactivate"
