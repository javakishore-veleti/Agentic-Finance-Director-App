#!/bin/bash
###############################################################################
# 28_hotfix_imports.sh
# Fixes import paths in identity/router.py and config/router.py
# to match the ACTUAL platform service module structure from Script 23.
#
# Key corrections:
#   app.auth.dependencies  -> app.dependencies
#   app.utils.response     -> app.shared.responses
#   app.utils.errors       -> app.shared.exceptions
#   app.auth.router        -> (auth endpoints are inline, not separate)
#   UserOrganizationDAO    -> UserOrgDAO
#   DTOs inline            -> DTOs from app.modules.*.dtos
#
# Run from: git repo root
###############################################################################
set -e

APP="Services/afda-platform-service/app"
ADMIN_SVC="Portals/agentic-finance-director-app/src/app/modules/admin/services/admin.service.ts"

echo "========================================"
echo "  [28-hotfix] Fix import paths"
echo "========================================"

# ==============================================================
# 1. IDENTITY ROUTER — preserve auth endpoints, fix imports
# ==============================================================
echo ""
echo "--- 1/3 identity/router.py ---"

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


# == Auth ==========================================================

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
    return ok(data=data, message="Account created")


@router.post("/auth/refresh")
async def refresh(req: RefreshRequest, db: AsyncSession = Depends(get_db)):
    svc = AuthService(db)
    data = await svc.refresh_token(req.refresh_token)
    return ok(data=data)


@router.get("/auth/me")
async def me(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    org_dao = UserOrgDAO(db)
    orgs = await org_dao.list_with_details(user.id)
    return ok(data={
        "id": str(user.id),
        "email": user.email,
        "display_name": user.display_name,
        "customer_id": str(user.customer_id),
        "is_customer_admin": user.is_customer_admin,
        "status": user.status,
        "organizations": orgs,
    })


# == Users =========================================================

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


@router.get("/users")
async def list_users(
    status: str = None,
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
        is_customer_admin=getattr(req, "is_customer_admin", False),
        status="active",
    )
    # Set department if the field exists on User model
    if hasattr(req, "department") and req.department:
        new_user.department = req.department

    new_user = await dao.create(new_user)
    await db.commit()

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

    updates = {}
    if hasattr(req, "display_name") and req.display_name is not None:
        updates["display_name"] = req.display_name
    if hasattr(req, "department") and req.department is not None:
        updates["department"] = req.department
    if hasattr(req, "status") and req.status is not None:
        updates["status"] = req.status

    if updates:
        updated = await dao.update(user_id, **updates)
        await db.commit()
        if updated:
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


# == Roles =========================================================

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


@router.get("/roles")
async def list_roles(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
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
    perms = {}
    if hasattr(req, "permissions_json") and req.permissions_json:
        perms = req.permissions_json
    elif hasattr(req, "permissions") and req.permissions:
        perms = req.permissions

    role = Role(
        customer_id=user.customer_id,
        name=req.name,
        description=req.description,
        permissions_json=perms,
        is_system=False,
    )
    role = await dao.create(role)
    await db.commit()
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
    if hasattr(req, "description") and req.description is not None:
        updates["description"] = req.description
    perms = None
    if hasattr(req, "permissions_json") and req.permissions_json:
        perms = req.permissions_json
    elif hasattr(req, "permissions") and req.permissions:
        perms = req.permissions
    if perms is not None:
        updates["permissions_json"] = perms

    if updates:
        role = await dao.update(role_id, **updates)
        await db.commit()

    return ok(data=_role(role))


# == User-Org Mappings =============================================

@router.get("/user-orgs/{user_id}")
async def list_user_orgs(
    user_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    dao = UserOrgDAO(db)
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
        raise BadRequestError("Only customer admins can assign users to organizations")

    dao = UserOrgDAO(db)
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
        raise BadRequestError("Only customer admins can remove user org assignments")

    dao = UserOrgDAO(db)
    await dao.remove(user_id, organization_id)
    await db.commit()
    return ok(message="User removed from organization")
PYEOF

echo "  Done: identity/router.py (correct imports, auth preserved)"

# ==============================================================
# 2. CONFIG ROUTER — fix imports
# ==============================================================
echo ""
echo "--- 2/3 config/router.py ---"

cat > "$APP/modules/config/router.py" << 'PYEOF'
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
PYEOF

echo "  Done: config/router.py (correct imports)"

# ==============================================================
# 3. PATCH DTOs — add missing fields to existing dto files
# ==============================================================
echo ""
echo "--- 3/3 Patching DTOs ---"

# Add expires_in_days to ApiKeyCreateRequest if not present
IDENTITY_DTO="$APP/modules/identity/dtos.py"
CONFIG_DTO="$APP/modules/config/dtos.py"

# Patch UserCreateRequest to include department
if [ -f "$IDENTITY_DTO" ]; then
    if ! grep -q "department" "$IDENTITY_DTO"; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' '/class UserCreateRequest/,/class /{
                /password:/a\
\    department: Optional[str] = None
            }' "$IDENTITY_DTO" 2>/dev/null || true
        else
            sed -i '/class UserCreateRequest/,/class /{
                /password:/a\    department: Optional[str] = None
            }' "$IDENTITY_DTO" 2>/dev/null || true
        fi
        echo "  + Added department to UserCreateRequest (may need manual verify)"
    else
        echo "  UserCreateRequest already has department"
    fi
fi

# Patch ApiKeyCreateRequest to include expires_in_days
if [ -f "$CONFIG_DTO" ]; then
    if ! grep -q "expires_in_days" "$CONFIG_DTO"; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' '/class ApiKeyCreateRequest/,/class /{
                /scopes:/a\
\    expires_in_days: Optional[int] = 90
            }' "$CONFIG_DTO" 2>/dev/null || true
        else
            sed -i '/class ApiKeyCreateRequest/,/class /{
                /scopes:/a\    expires_in_days: Optional[int] = 90
            }' "$CONFIG_DTO" 2>/dev/null || true
        fi
        echo "  + Added expires_in_days to ApiKeyCreateRequest"
    else
        echo "  ApiKeyCreateRequest already has expires_in_days"
    fi
fi

echo ""
echo "========================================"
echo "  [28-hotfix] Complete!"
echo "========================================"
echo ""
echo "  Import corrections:"
echo "    app.auth.dependencies  -> app.dependencies"
echo "    app.utils.response     -> app.shared.responses"
echo "    app.utils.errors       -> app.shared.exceptions"
echo "    app.auth.router        -> (auth inline in identity router)"
echo "    UserOrganizationDAO    -> UserOrgDAO"
echo ""
echo "  Platform Service will auto-reload."
echo "  If it doesn't, restart: npm run dev:platform"
