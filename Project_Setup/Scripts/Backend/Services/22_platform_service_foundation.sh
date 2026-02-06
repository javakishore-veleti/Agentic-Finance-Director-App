#!/bin/bash
###############################################################################
# 22_platform_service_foundation.sh
# Creates: afda-platform-service — FastAPI microservice for identity, tenancy,
#          cross-org sharing. Separate DB: afda_platform_db
# Port: 8002
# Run from: git repo root (Agentic-Finance-Director-App/)
###############################################################################
set -e

SVC="Services/afda-platform-service"
APP="$SVC/app"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  [22] Platform Service Foundation                            ║"
echo "║  Multi-tenant identity, org, cross-org access                ║"
echo "╚══════════════════════════════════════════════════════════════╝"

# ═══════════════════════════════════════════════════════════════
# PART 0: DIRECTORY STRUCTURE
# ═══════════════════════════════════════════════════════════════
mkdir -p "$APP/middleware"
mkdir -p "$APP/shared"
mkdir -p "$APP/modules/identity"
mkdir -p "$APP/modules/tenancy"
mkdir -p "$APP/modules/access"
mkdir -p "$APP/modules/config"
mkdir -p "$APP/openapi"
mkdir -p "$SVC/tests"
mkdir -p "$SVC/alembic/versions"
mkdir -p "$SVC/scripts"

echo "  ✅ Directory structure created"

# ═══════════════════════════════════════════════════════════════
# PART 1: DOCKER-COMPOSE OVERLAY
# ═══════════════════════════════════════════════════════════════
# This file can be merged into existing docker-compose or used standalone
cat > "$SVC/docker-compose.platform.yml" << 'EOF'
# Platform service addition — merge with root docker-compose.yml
# Usage: docker compose -f docker-compose.yml -f Services/afda-platform-service/docker-compose.platform.yml up
version: "3.9"

services:
  afda-platform-db:
    image: postgres:16-alpine
    container_name: afda-platform-db
    environment:
      POSTGRES_USER: afda_platform
      POSTGRES_PASSWORD: platform_secret
      POSTGRES_DB: afda_platform_db
    ports:
      - "5433:5432"
    volumes:
      - platform_pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U afda_platform -d afda_platform_db"]
      interval: 5s
      timeout: 3s
      retries: 5

  afda-platform-service:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: afda-platform-service
    ports:
      - "8002:8002"
    environment:
      - POSTGRES_HOST=afda-platform-db
      - POSTGRES_PORT=5432
      - POSTGRES_USER=afda_platform
      - POSTGRES_PASSWORD=platform_secret
      - POSTGRES_DB=afda_platform_db
    depends_on:
      afda-platform-db:
        condition: service_healthy
    volumes:
      - ./app:/code/app

volumes:
  platform_pgdata:
EOF

echo "  ✅ docker-compose.platform.yml"

# ═══════════════════════════════════════════════════════════════
# PART 2: requirements.txt
# ═══════════════════════════════════════════════════════════════
cat > "$SVC/requirements.txt" << 'EOF'
fastapi==0.115.6
uvicorn[standard]==0.34.0
sqlalchemy[asyncio]==2.0.36
asyncpg==0.30.0
alembic==1.14.0
pydantic==2.10.3
pydantic-settings==2.7.0
python-jose[cryptography]==3.3.0
bcrypt==4.2.1
python-multipart==0.0.18
httpx==0.28.1
python-dateutil==2.9.0
EOF

echo "  ✅ requirements.txt"

# ═══════════════════════════════════════════════════════════════
# PART 3: Dockerfile
# ═══════════════════════════════════════════════════════════════
cat > "$SVC/Dockerfile" << 'EOF'
FROM python:3.12-slim
WORKDIR /code
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8002", "--reload"]
EOF

echo "  ✅ Dockerfile"

# ═══════════════════════════════════════════════════════════════
# PART 4: .env
# ═══════════════════════════════════════════════════════════════
cat > "$SVC/.env" << 'EOF'
# Platform Service — local dev config
APP_NAME=AFDA Platform Service
APP_VERSION=1.0.0
DEBUG=true

# PostgreSQL — dedicated platform DB (port 5433 on host, 5432 inside Docker)
POSTGRES_HOST=localhost
POSTGRES_PORT=5433
POSTGRES_USER=afda_platform
POSTGRES_PASSWORD=platform_secret
POSTGRES_DB=afda_platform_db

# JWT — shared secret with CRUD API and Agent Gateway
JWT_SECRET_KEY=afda-super-secret-key-change-in-production-2024
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7
EOF

echo "  ✅ .env"

# ═══════════════════════════════════════════════════════════════
# PART 5: app/__init__.py
# ═══════════════════════════════════════════════════════════════
cat > "$APP/__init__.py" << 'EOF'
EOF

# ═══════════════════════════════════════════════════════════════
# PART 6: app/config.py
# ═══════════════════════════════════════════════════════════════
cat > "$APP/config.py" << 'PYEOF'
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    APP_NAME: str = "AFDA Platform Service"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # PostgreSQL — platform DB
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5433
    POSTGRES_USER: str = "afda_platform"
    POSTGRES_PASSWORD: str = "platform_secret"
    POSTGRES_DB: str = "afda_platform_db"

    @property
    def DATABASE_URL(self) -> str:
        return (
            f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    # JWT — MUST match CRUD API and Agent Gateway
    JWT_SECRET_KEY: str = "afda-super-secret-key-change-in-production-2024"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
PYEOF

echo "  ✅ app/config.py"

# ═══════════════════════════════════════════════════════════════
# PART 7: app/database.py
# ═══════════════════════════════════════════════════════════════
cat > "$APP/database.py" << 'PYEOF'
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.config import get_settings

settings = get_settings()

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_size=20,
    max_overflow=10,
)

AsyncSessionLocal = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
PYEOF

echo "  ✅ app/database.py"

# ═══════════════════════════════════════════════════════════════
# PART 8: app/shared/responses.py
# ═══════════════════════════════════════════════════════════════
cat > "$APP/shared/__init__.py" << 'EOF'
EOF

cat > "$APP/shared/responses.py" << 'PYEOF'
from typing import Any, Optional
from pydantic import BaseModel


class ApiResponse(BaseModel):
    success: bool = True
    data: Any = None
    message: Optional[str] = None
    meta: Optional[dict] = None


def ok(data: Any = None, message: str = None, meta: dict = None) -> dict:
    return ApiResponse(success=True, data=data, message=message, meta=meta).model_dump()


def error(message: str, data: Any = None) -> dict:
    return ApiResponse(success=False, data=data, message=message).model_dump()
PYEOF

echo "  ✅ app/shared/responses.py"

# ═══════════════════════════════════════════════════════════════
# PART 9: app/shared/exceptions.py
# ═══════════════════════════════════════════════════════════════
cat > "$APP/shared/exceptions.py" << 'PYEOF'
from fastapi import HTTPException, status


class NotFoundError(HTTPException):
    def __init__(self, resource: str = "Resource"):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=f"{resource} not found")


class ConflictError(HTTPException):
    def __init__(self, message: str = "Resource already exists"):
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=message)


class ForbiddenError(HTTPException):
    def __init__(self, message: str = "Access denied"):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=message)


class BadRequestError(HTTPException):
    def __init__(self, message: str = "Bad request"):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=message)
PYEOF

echo "  ✅ app/shared/exceptions.py"

# ═══════════════════════════════════════════════════════════════
# PART 10: app/middleware/error_handler.py
# ═══════════════════════════════════════════════════════════════
cat > "$APP/middleware/__init__.py" << 'EOF'
EOF

cat > "$APP/middleware/error_handler.py" << 'PYEOF'
from fastapi import Request
from fastapi.responses import JSONResponse
from app.shared.responses import error
import traceback


async def global_exception_handler(request: Request, exc: Exception):
    tb = traceback.format_exc()
    print(f"[ERROR] {request.method} {request.url.path}: {exc}\n{tb}")
    return JSONResponse(
        status_code=500,
        content=error(message="Internal server error"),
    )
PYEOF

echo "  ✅ app/middleware/error_handler.py"

# ═══════════════════════════════════════════════════════════════
# PART 11: MODULE __init__.py FILES
# ═══════════════════════════════════════════════════════════════
for mod in identity tenancy access config; do
    cat > "$APP/modules/${mod}/__init__.py" << 'EOF'
EOF
done
cat > "$APP/modules/__init__.py" << 'EOF'
EOF

# ═══════════════════════════════════════════════════════════════
# PART 12: IDENTITY MODULE — MODELS (customer, user, role)
# ═══════════════════════════════════════════════════════════════
cat > "$APP/modules/identity/models.py" << 'PYEOF'
"""
Identity models: Customer (tenant root), User, Role, UserOrganization mapping.
"""
import uuid
from datetime import datetime
from sqlalchemy import (
    String, Text, Boolean, DateTime, SmallInteger,
    ForeignKey, UniqueConstraint, Index
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.database import Base


# ── Customer (Tenant Root) ─────────────────────────────────────
class Customer(Base):
    __tablename__ = "customer"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(300), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    legal_name: Mapped[str] = mapped_column(String(500), nullable=True)
    industry: Mapped[str] = mapped_column(String(100), nullable=True)
    plan: Mapped[str] = mapped_column(String(50), default="free")  # free | pro | enterprise
    status: Mapped[str] = mapped_column(String(20), default="active")  # active | suspended | trial
    default_organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), nullable=True  # set after first org created
    )
    config_json: Mapped[dict] = mapped_column(JSONB, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    organizations: Mapped[list["Organization"]] = relationship(
        back_populates="customer", cascade="all, delete-orphan",
        foreign_keys="Organization.customer_id"
    )
    users: Mapped[list["User"]] = relationship(
        back_populates="customer", cascade="all, delete-orphan"
    )
    roles: Mapped[list["Role"]] = relationship(
        back_populates="customer", cascade="all, delete-orphan"
    )


# ── Organization (Data Boundary) ──────────────────────────────
class Organization(Base):
    __tablename__ = "organization"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    customer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("customer.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(300), nullable=False)
    code: Mapped[str] = mapped_column(String(20), nullable=False)
    legal_entity_name: Mapped[str] = mapped_column(String(500), nullable=True)
    country: Mapped[str] = mapped_column(String(3), nullable=True)  # ISO 3166
    timezone: Mapped[str] = mapped_column(String(50), default="America/New_York")
    fiscal_year_end_month: Mapped[int] = mapped_column(SmallInteger, default=12)
    default_currency_code: Mapped[str] = mapped_column(String(3), default="USD")
    status: Mapped[str] = mapped_column(String(20), default="active")
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)
    settings_json: Mapped[dict] = mapped_column(JSONB, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    __table_args__ = (
        UniqueConstraint("customer_id", "code", name="uq_org_customer_code"),
        Index("idx_org_customer", "customer_id"),
    )

    # Relationships
    customer: Mapped["Customer"] = relationship(
        back_populates="organizations", foreign_keys=[customer_id]
    )
    currencies: Mapped[list["OrganizationCurrency"]] = relationship(
        back_populates="organization", cascade="all, delete-orphan"
    )
    user_organizations: Mapped[list["UserOrganization"]] = relationship(
        back_populates="organization", cascade="all, delete-orphan"
    )


# ── Organization Currency ─────────────────────────────────────
class OrganizationCurrency(Base):
    __tablename__ = "organization_currency"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("organization.id"), nullable=False
    )
    currency_code: Mapped[str] = mapped_column(String(3), nullable=False)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False)
    is_reporting: Mapped[bool] = mapped_column(Boolean, default=False)
    exchange_rate_source: Mapped[str] = mapped_column(
        String(50), default="manual"
    )  # manual | ecb | openexchange
    status: Mapped[str] = mapped_column(String(20), default="active")

    __table_args__ = (
        UniqueConstraint("organization_id", "currency_code", name="uq_org_currency"),
        Index("idx_orgcurr_org", "organization_id"),
    )

    organization: Mapped["Organization"] = relationship(back_populates="currencies")


# ── User ───────────────────────────────────────────────────────
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
    avatar_url: Mapped[str] = mapped_column(String(500), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="active")  # active | inactive | invited
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

    customer: Mapped["Customer"] = relationship(back_populates="users")
    user_organizations: Mapped[list["UserOrganization"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )


# ── Role ───────────────────────────────────────────────────────
class Role(Base):
    __tablename__ = "role"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    customer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("customer.id"), nullable=True  # NULL = system role
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    permissions_json: Mapped[dict] = mapped_column(JSONB, default=dict)
    is_system: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("customer_id", "name", name="uq_role_customer_name"),
    )

    customer: Mapped["Customer"] = relationship(back_populates="roles")
    user_organizations: Mapped[list["UserOrganization"]] = relationship(
        back_populates="role"
    )


# ── User ↔ Organization (M:M with role per org) ───────────────
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
    joined_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("user_id", "organization_id", name="uq_user_org"),
        Index("idx_userorg_user", "user_id"),
        Index("idx_userorg_org", "organization_id"),
    )

    user: Mapped["User"] = relationship(back_populates="user_organizations")
    organization: Mapped["Organization"] = relationship(back_populates="user_organizations")
    role: Mapped["Role"] = relationship(back_populates="user_organizations")
PYEOF

echo "  ✅ identity/models.py — Customer, Organization, OrganizationCurrency, User, Role, UserOrganization"

# ═══════════════════════════════════════════════════════════════
# PART 13: ACCESS MODULE — MODELS (cross-org sharing)
# ═══════════════════════════════════════════════════════════════
cat > "$APP/modules/access/models.py" << 'PYEOF'
"""
Cross-organization access policies.
Controls which orgs can see other orgs' domain data.
"""
import uuid
from datetime import datetime
from sqlalchemy import (
    String, Boolean, DateTime, ForeignKey, UniqueConstraint,
    CheckConstraint, Index
)
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.database import Base


class OrgAccessPolicy(Base):
    """
    Denormalized cross-org sharing config.
    Each row = one org granting access to one domain to another org.

    row_type:
      - 'role'  → access_config_json.allowed_role_ids determines who in to_org sees data
      - 'user'  → access_config_json.allowed_user_ids determines specific users

    access_level:
      - 'view'  → read-only
      - 'edit'  → read + write
      - 'full'  → read + write + delete

    access_config_json examples:
      row_type='role':  {"allowed_role_ids": ["uuid1", "uuid2"], "description": "..."}
      row_type='user':  {"allowed_user_ids": ["uuid1"], "restrict_to_entities": ["intercompany"]}
    """
    __tablename__ = "org_access_policy"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    customer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("customer.id"), nullable=False
    )
    from_organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("organization.id"), nullable=False
    )
    to_organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("organization.id"), nullable=False
    )
    domain: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # treasury | accounting | fpa | risk | monitoring | command_center | agent_studio
    row_type: Mapped[str] = mapped_column(
        String(20), nullable=False
    )  # role | user
    access_level: Mapped[str] = mapped_column(
        String(20), default="view"
    )  # view | edit | full
    access_config_json: Mapped[dict] = mapped_column(JSONB, default=dict)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    granted_by_user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("platform_user.id"), nullable=True
    )
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    __table_args__ = (
        UniqueConstraint(
            "from_organization_id", "to_organization_id", "domain", "row_type",
            name="uq_access_policy"
        ),
        CheckConstraint(
            "from_organization_id != to_organization_id",
            name="ck_no_self_sharing"
        ),
        Index("idx_access_from_org", "from_organization_id"),
        Index("idx_access_to_org", "to_organization_id"),
        Index("idx_access_customer", "customer_id"),
    )
PYEOF

echo "  ✅ access/models.py — OrgAccessPolicy (cross-org sharing)"

# ═══════════════════════════════════════════════════════════════
# PART 14: CONFIG MODULE — MODELS (api_key, data_connection, platform_setting, audit_log)
# ═══════════════════════════════════════════════════════════════
cat > "$APP/modules/config/models.py" << 'PYEOF'
"""
Platform configuration models: API keys, data connections, settings, audit log.
"""
import uuid
from datetime import datetime
from sqlalchemy import String, Text, Boolean, DateTime, ForeignKey, Index
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
        UUID(as_uuid=True), ForeignKey("organization.id"), nullable=True  # NULL = customer-wide
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    key_prefix: Mapped[str] = mapped_column(String(20), nullable=False)  # afda_xxxxxxxx
    key_hash: Mapped[str] = mapped_column(String(64), nullable=False)  # SHA-256
    scopes: Mapped[dict] = mapped_column(JSONB, default=list)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
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
    config_json: Mapped[dict] = mapped_column(JSONB, default=dict)  # encrypted credentials
    status: Mapped[str] = mapped_column(String(20), default="pending")
    sync_frequency: Mapped[str] = mapped_column(String(20), default="daily")
    last_sync_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    __table_args__ = (
        Index("idx_dataconn_customer", "customer_id"),
        Index("idx_dataconn_org", "organization_id"),
    )


class PlatformSetting(Base):
    __tablename__ = "platform_setting"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    customer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("customer.id"), nullable=True  # NULL = global default
    )
    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("organization.id"), nullable=True  # NULL = customer-wide
    )
    key: Mapped[str] = mapped_column(String(200), nullable=False)
    value: Mapped[str] = mapped_column(Text, nullable=True)
    category: Mapped[str] = mapped_column(String(50), default="general")
    updated_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("platform_user.id"), nullable=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    __table_args__ = (
        Index("idx_setting_lookup", "customer_id", "organization_id", "key"),
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
    action: Mapped[str] = mapped_column(String(50), nullable=False)
    resource_type: Mapped[str] = mapped_column(String(50), nullable=False)
    resource_id: Mapped[str] = mapped_column(String(100), nullable=True)
    details_json: Mapped[dict] = mapped_column(JSONB, default=dict)
    ip_address: Mapped[str] = mapped_column(String(45), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("idx_audit_customer", "customer_id"),
        Index("idx_audit_org", "organization_id"),
        Index("idx_audit_user", "user_id"),
        Index("idx_audit_created", "created_at"),
    )
PYEOF

echo "  ✅ config/models.py — ApiKey, DataConnection, PlatformSetting, AuditLog"

# ═══════════════════════════════════════════════════════════════
# PART 15: STUB DTOs, DAOs, SERVICES, ROUTERS for each module
# ═══════════════════════════════════════════════════════════════
for mod in identity tenancy access config; do
    cat > "$APP/modules/${mod}/dtos.py" << 'EOF'
"""DTOs — will be populated in Script 23."""
EOF
    cat > "$APP/modules/${mod}/dao.py" << 'EOF'
"""Data Access — will be populated in Script 23."""
EOF
    cat > "$APP/modules/${mod}/service.py" << 'EOF'
"""Business Logic — will be populated in Script 23."""
EOF
    cat > "$APP/modules/${mod}/router.py" << 'EOF'
"""API Endpoints — will be populated in Script 23."""
from fastapi import APIRouter
router = APIRouter()
EOF
done

echo "  ✅ Stub dtos/dao/service/router for all 4 modules"

# Also create tenancy/models.py stub (tenancy uses identity models)
cat > "$APP/modules/tenancy/models.py" << 'EOF'
"""Tenancy module re-exports identity models (Organization, OrganizationCurrency)."""
from app.modules.identity.models import Organization, OrganizationCurrency
EOF

# ═══════════════════════════════════════════════════════════════
# PART 16: main.py — FastAPI Application
# ═══════════════════════════════════════════════════════════════
cat > "$APP/main.py" << 'PYEOF'
"""
AFDA Platform Service — Identity, Tenancy & Cross-Org Access Control
Port: 8002
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import get_settings
from app.database import engine, Base
from app.middleware.error_handler import global_exception_handler

# Import all models so they're registered with SQLAlchemy
from app.modules.identity import models as identity_models  # noqa: F401
from app.modules.access import models as access_models  # noqa: F401
from app.modules.config import models as config_models  # noqa: F401

# Import routers
from app.modules.identity.router import router as identity_router
from app.modules.tenancy.router import router as tenancy_router
from app.modules.access.router import router as access_router
from app.modules.config.router import router as config_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables if they don't exist (dev convenience)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print(f"🏢 {settings.APP_NAME} v{settings.APP_VERSION} started on :8002")
    print(f"   Database: {settings.POSTGRES_DB}@{settings.POSTGRES_HOST}:{settings.POSTGRES_PORT}")
    yield
    # Shutdown
    await engine.dispose()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global error handler
app.add_exception_handler(Exception, global_exception_handler)

# Mount routers under /api/v1/platform
PREFIX = "/api/v1/platform"
app.include_router(identity_router, prefix=f"{PREFIX}/identity", tags=["Identity"])
app.include_router(tenancy_router,  prefix=f"{PREFIX}/tenancy",  tags=["Tenancy"])
app.include_router(access_router,   prefix=f"{PREFIX}/access",   tags=["Access Policies"])
app.include_router(config_router,   prefix=f"{PREFIX}/config",   tags=["Platform Config"])


# Health check
@app.get("/health")
async def health():
    return {"status": "ok", "service": "afda-platform-service", "version": settings.APP_VERSION}


# Auth endpoints will be mounted at /api/v1/platform/auth in Script 23
PYEOF

echo "  ✅ app/main.py — FastAPI app with 4 module routers"

# ═══════════════════════════════════════════════════════════════
# PART 17: ALEMBIC CONFIG
# ═══════════════════════════════════════════════════════════════
cat > "$SVC/alembic.ini" << 'EOF'
[alembic]
script_location = alembic
prepend_sys_path = .
sqlalchemy.url = postgresql+asyncpg://afda_platform:platform_secret@localhost:5433/afda_platform_db

[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic

[logger_root]
level = WARN
handlers = console

[logger_sqlalchemy]
level = WARN
handlers =
qualname = sqlalchemy.engine

[logger_alembic]
level = INFO
handlers =
qualname = alembic

[handler_console]
class = StreamHandler
args = (sys.stderr,)
level = NOTSET
formatter = generic

[formatter_generic]
format = %(levelname)-5.5s [%(name)s] %(message)s
datefmt = %H:%M:%S
EOF

cat > "$SVC/alembic/env.py" << 'PYEOF'
import asyncio
from logging.config import fileConfig
from sqlalchemy import pool
from sqlalchemy.ext.asyncio import async_engine_from_config
from alembic import context

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Import ALL models so Alembic sees them
from app.database import Base
from app.modules.identity.models import *  # noqa: F401, F403
from app.modules.access.models import *    # noqa: F401, F403
from app.modules.config.models import *    # noqa: F401, F403

target_metadata = Base.metadata


def run_migrations_offline():
    url = config.get_main_option("sqlalchemy.url")
    context.configure(url=url, target_metadata=target_metadata, literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection):
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations():
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


def run_migrations_online():
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
PYEOF

cat > "$SVC/alembic/script.py.mako" << 'EOF'
"""${message}

Revision ID: ${up_revision}
Revises: ${down_revision | comma,n}
Create Date: ${create_date}
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
${imports if imports else ""}

revision: str = ${repr(up_revision)}
down_revision: Union[str, None] = ${repr(down_revision)}
branch_labels: Union[str, Sequence[str], None] = ${repr(branch_labels)}
depends_on: Union[str, Sequence[str], None] = ${repr(depends_on)}


def upgrade() -> None:
    ${upgrades if upgrades else "pass"}


def downgrade() -> None:
    ${downgrades if downgrades else "pass"}
EOF

echo "  ✅ Alembic config + env.py"

# ═══════════════════════════════════════════════════════════════
# PART 18: CREATE TABLES SCRIPT
# ═══════════════════════════════════════════════════════════════
cat > "$SVC/scripts/create_tables.py" << 'PYEOF'
"""
Create all platform tables.
Run: cd Services/afda-platform-service && python -m scripts.create_tables
"""
import asyncio
from app.database import engine, Base

# Import all models
from app.modules.identity.models import *   # noqa
from app.modules.access.models import *     # noqa
from app.modules.config.models import *     # noqa


async def create():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ All platform tables created:")
    for table in Base.metadata.sorted_tables:
        print(f"   → {table.name}")
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(create())
PYEOF

echo "  ✅ scripts/create_tables.py"

# ═══════════════════════════════════════════════════════════════
# PART 19: STARTUP HELPER SCRIPT
# ═══════════════════════════════════════════════════════════════
cat > "$SVC/run_dev.sh" << 'BASH'
#!/bin/bash
# Start platform service in dev mode
# Prerequisite: PostgreSQL running on port 5433 with afda_platform_db
set -e

echo "🏢 Starting AFDA Platform Service..."
echo "   Port: 8002"
echo "   DB:   afda_platform_db @ localhost:5433"
echo ""

# Create DB if it doesn't exist (using the main PG on 5432 or dedicated on 5433)
# If using same PG instance as CRUD API (port 5432), create DB there:
# PGPASSWORD=afda_secret psql -h localhost -p 5432 -U afda -c "CREATE DATABASE afda_platform_db OWNER afda;" 2>/dev/null || true

# If using dedicated PG container on 5433:
# PGPASSWORD=platform_secret psql -h localhost -p 5433 -U afda_platform -c "SELECT 1;" 2>/dev/null || echo "⚠️  DB not ready"

cd "$(dirname "$0")"
uvicorn app.main:app --host 0.0.0.0 --port 8002 --reload
BASH
chmod +x "$SVC/run_dev.sh"

echo "  ✅ run_dev.sh"

# ═══════════════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════════════

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  ✅ Script 22 Complete — Platform Service Foundation         ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "  Service:  Services/afda-platform-service/"
echo "  Port:     8002"
echo "  DB:       afda_platform_db @ localhost:5433"
echo ""
echo "  Tables created (11):"
echo "    Identity:  customer, organization, organization_currency,"
echo "               platform_user, role, user_organization"
echo "    Access:    org_access_policy"
echo "    Config:    api_key, data_connection, platform_setting, audit_log"
echo ""
echo "  Module structure:"
echo "    app/modules/identity/  — Customer, Org, User, Role models"
echo "    app/modules/tenancy/   — Org management (re-exports identity models)"
echo "    app/modules/access/    — OrgAccessPolicy (cross-org sharing)"
echo "    app/modules/config/    — ApiKey, DataConnection, Settings, AuditLog"
echo ""
echo "  Next steps:"
echo "    1. Start platform DB:  docker compose -f docker-compose.platform.yml up -d afda-platform-db"
echo "    2. Create tables:      cd Services/afda-platform-service && python -m scripts.create_tables"
echo "    3. Start service:      bash run_dev.sh"
echo "    4. Verify:             curl http://localhost:8002/health"
echo "    5. Run Script 23:      Platform Service API + Auth migration"
echo ""
