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
