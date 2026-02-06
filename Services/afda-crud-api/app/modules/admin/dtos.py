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
