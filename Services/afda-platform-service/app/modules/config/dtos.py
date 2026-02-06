"""Config DTOs: ApiKey, DataConnection, PlatformSetting, AuditLog."""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid


class ApiKeyOut(BaseModel):
    id: uuid.UUID
    name: str
    key_prefix: str
    scopes: list
    is_active: bool
    organization_id: Optional[uuid.UUID] = None
    expires_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ApiKeyCreateRequest(BaseModel):
    name: str
    organization_id: Optional[uuid.UUID] = None
    scopes: list = []
    expires_at: Optional[datetime] = None


class DataConnectionOut(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    name: str
    connection_type: str
    provider: Optional[str] = None
    status: str
    sync_frequency: str
    last_sync_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class DataConnectionCreateRequest(BaseModel):
    organization_id: uuid.UUID
    name: str
    connection_type: str
    provider: Optional[str] = None
    config_json: dict = {}
    sync_frequency: str = "daily"

class DataConnectionUpdateRequest(BaseModel):
    name: Optional[str] = None
    config_json: Optional[dict] = None
    sync_frequency: Optional[str] = None
    status: Optional[str] = None


class SettingOut(BaseModel):
    id: uuid.UUID
    key: str
    value: Optional[str] = None
    category: str
    organization_id: Optional[uuid.UUID] = None

    class Config:
        from_attributes = True

class SettingUpsertRequest(BaseModel):
    key: str
    value: str
    category: str = "general"
    organization_id: Optional[uuid.UUID] = None


class AuditLogOut(BaseModel):
    id: uuid.UUID
    user_id: Optional[uuid.UUID] = None
    organization_id: Optional[uuid.UUID] = None
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    details_json: dict = {}
    ip_address: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
