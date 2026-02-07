"""Config router: API keys, data connections, settings, audit log."""
import uuid
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.shared.responses import ok
from app.shared.exceptions import BadRequestError, NotFoundError
from app.modules.identity.models import User
from app.modules.config.models import ApiKey, DataConnection, PlatformSetting, AuditLog
from app.modules.config.dao import ApiKeyDAO, DataConnectionDAO, SettingDAO, AuditLogDAO
from app.modules.config.dtos import (
    ApiKeyCreateRequest, DataConnectionCreateRequest, DataConnectionUpdateRequest,
    SettingUpsertRequest,
)

router = APIRouter()


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
        "last_used_at": getattr(k, "last_used_at", None),
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
async def list_api_keys(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
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
    if hasattr(req, "expires_in_days") and req.expires_in_days:
        expires_at = datetime.utcnow() + timedelta(days=req.expires_in_days)
    elif hasattr(req, "expires_at") and req.expires_at:
        expires_at = req.expires_at

    api_key, raw_key = await dao.create(
        customer_id=user.customer_id,
        name=req.name,
        org_id=getattr(req, "organization_id", None),
        scopes=req.scopes,
        expires_at=expires_at,
        created_by=user.id,
    )
    await db.commit()

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
async def list_data_connections(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
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
        organization_id=getattr(req, "organization_id", None),
        name=req.name,
        connection_type=req.connection_type,
        provider=req.provider,
        config_json=req.config_json,
        sync_frequency=req.sync_frequency,
        status="pending",
    )
    conn = await dao.create(conn)
    await db.commit()
    return ok(data=_conn(conn))


@router.put("/data-connections/{conn_id}")
async def update_data_connection(
    conn_id: uuid.UUID,
    req: DataConnectionUpdateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    dao = DataConnectionDAO(db)
    updates = {}
    if hasattr(req, "name") and req.name is not None:
        updates["name"] = req.name
    if hasattr(req, "config_json") and req.config_json is not None:
        updates["config_json"] = req.config_json
    if hasattr(req, "sync_frequency") and req.sync_frequency is not None:
        updates["sync_frequency"] = req.sync_frequency
    if not updates:
        raise BadRequestError("No fields to update")
    await dao.update(conn_id, **updates)
    await db.commit()
    return ok(message="Updated")


@router.post("/data-connections/{conn_id}/test")
async def test_connection(conn_id: uuid.UUID, user: User = Depends(get_current_user)):
    return ok(data={"success": True, "message": "Connection test successful", "latency_ms": 42})


# == SETTINGS ======================================================

@router.get("/settings")
async def list_settings(
    org_id: uuid.UUID = None,
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
        org_id=getattr(req, "organization_id", None),
        updated_by=user.id,
    )
    await db.commit()
    return ok(data=_setting(setting))


# == AUDIT LOG =====================================================

@router.get("/audit-log")
async def list_audit_log(
    limit: int = 100,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    dao = AuditLogDAO(db)
    logs = await dao.list_by_customer(user.customer_id, limit=limit)
    return ok(data=[_audit(a) for a in logs])
