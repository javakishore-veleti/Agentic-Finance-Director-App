"""Access DTOs: OrgAccessPolicy."""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid


class AccessPolicyOut(BaseModel):
    id: uuid.UUID
    customer_id: uuid.UUID
    from_organization_id: uuid.UUID
    to_organization_id: uuid.UUID
    domain: str
    row_type: str
    access_level: str
    access_config_json: dict
    is_active: bool
    expires_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AccessPolicyCreateRequest(BaseModel):
    from_organization_id: uuid.UUID
    to_organization_id: uuid.UUID
    domain: str
    row_type: str  # role | user
    access_level: str = "view"  # view | edit | full
    access_config_json: dict = {}
    expires_at: Optional[datetime] = None


class AccessPolicyUpdateRequest(BaseModel):
    access_level: Optional[str] = None
    access_config_json: Optional[dict] = None
    is_active: Optional[bool] = None
    expires_at: Optional[datetime] = None
