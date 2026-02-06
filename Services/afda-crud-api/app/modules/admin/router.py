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
