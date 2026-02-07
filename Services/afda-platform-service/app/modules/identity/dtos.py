"""Identity DTOs: Auth, User, Role schemas."""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
import uuid


# ── Auth ───────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    email: str
    password: str

class SignupRequest(BaseModel):
    email: str
    password: str = Field(min_length=6)
    display_name: str
    company_name: Optional[str] = None  # creates customer + default org

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int

class RefreshRequest(BaseModel):
    refresh_token: str


# ── User ───────────────────────────────────────────────────────
class UserOut(BaseModel):
    id: uuid.UUID
    customer_id: uuid.UUID
    email: str
    display_name: str
    avatar_url: Optional[str] = None
    status: str
    is_customer_admin: bool
    last_login_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class UserProfileOut(UserOut):
    """Extended profile with org memberships."""
    organizations: list[dict] = []

class UserCreateRequest(BaseModel):
    email: str
    password: str = Field(min_length=6)
    department: Optional[str] = None
    display_name: str
    is_customer_admin: bool = False

class UserUpdateRequest(BaseModel):
    display_name: Optional[str] = None
    status: Optional[str] = None
    is_customer_admin: Optional[bool] = None
    avatar_url: Optional[str] = None


# ── Role ───────────────────────────────────────────────────────
class RoleOut(BaseModel):
    id: uuid.UUID
    customer_id: Optional[uuid.UUID] = None
    name: str
    description: Optional[str] = None
    permissions_json: dict = {}
    is_system: bool = False
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class RoleCreateRequest(BaseModel):
    name: str
    description: Optional[str] = None
    permissions_json: dict = {}

class RoleUpdateRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    permissions_json: Optional[dict] = None


# ── UserOrganization ──────────────────────────────────────────
class UserOrgAssignRequest(BaseModel):
    user_id: uuid.UUID
    organization_id: uuid.UUID
    role_id: uuid.UUID
    is_default: bool = False

class UserOrgOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    organization_id: uuid.UUID
    role_id: uuid.UUID
    is_default: bool
    status: str
    joined_at: Optional[datetime] = None

    class Config:
        from_attributes = True
