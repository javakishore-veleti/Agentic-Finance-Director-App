#!/bin/bash
###############################################################################
# 28_hotfix_models.sh
# Restores identity/models.py with ALL 6 models (Customer, Organization,
# OrganizationCurrency, User, Role, UserOrganization) plus adds department.
# Script 28 accidentally dropped Customer, Organization, OrganizationCurrency.
###############################################################################
set -e

APP="Services/afda-platform-service/app"

echo "Restoring identity/models.py with all 6 models..."

cat > "$APP/modules/identity/models.py" << 'PYEOF'
"""
Identity models - all platform models live here because SQLAlchemy
relationships require models in the same registry.

Models: Customer, Organization, OrganizationCurrency, User, Role, UserOrganization
"""
import uuid
from datetime import datetime
from sqlalchemy import (
    String, Boolean, DateTime, ForeignKey, Index, Text,
    SmallInteger, UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.database import Base


# -- Customer (Tenant Root) ----------------------------------------

class Customer(Base):
    __tablename__ = "customer"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(300), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    legal_name: Mapped[str] = mapped_column(String(500), nullable=True)
    industry: Mapped[str] = mapped_column(String(100), nullable=True)
    plan: Mapped[str] = mapped_column(String(50), default="free")
    status: Mapped[str] = mapped_column(String(20), default="active")
    default_organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), nullable=True
    )
    config_json: Mapped[dict] = mapped_column(JSONB, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

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


# -- Organization (Data Boundary) ----------------------------------

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
    country: Mapped[str] = mapped_column(String(3), nullable=True)
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

    customer: Mapped["Customer"] = relationship(
        back_populates="organizations", foreign_keys=[customer_id]
    )
    currencies: Mapped[list["OrganizationCurrency"]] = relationship(
        back_populates="organization", cascade="all, delete-orphan"
    )
    user_organizations: Mapped[list["UserOrganization"]] = relationship(
        back_populates="organization", cascade="all, delete-orphan"
    )


# -- Organization Currency ------------------------------------------

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
    )
    status: Mapped[str] = mapped_column(String(20), default="active")

    __table_args__ = (
        UniqueConstraint("organization_id", "currency_code", name="uq_org_currency"),
        Index("idx_orgcurr_org", "organization_id"),
    )

    organization: Mapped["Organization"] = relationship(back_populates="currencies")


# -- User -----------------------------------------------------------

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

    customer: Mapped["Customer"] = relationship(back_populates="users")
    user_organizations: Mapped[list["UserOrganization"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )


# -- Role -----------------------------------------------------------

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

    customer: Mapped["Customer"] = relationship(back_populates="roles")
    user_organizations: Mapped[list["UserOrganization"]] = relationship(
        back_populates="role", cascade="all, delete-orphan"
    )


# -- UserOrganization (Junction) ------------------------------------

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
        UniqueConstraint("user_id", "organization_id", name="uq_user_org"),
        Index("idx_userog_user", "user_id"),
        Index("idx_userog_org", "organization_id"),
    )

    user: Mapped["User"] = relationship(back_populates="user_organizations")
    organization: Mapped["Organization"] = relationship(back_populates="user_organizations")
    role: Mapped["Role"] = relationship(back_populates="user_organizations")
PYEOF

echo "  Done. 6 models restored:"
echo "    Customer, Organization, OrganizationCurrency"
echo "    User (+department), Role, UserOrganization"
echo ""
echo "  Platform Service will auto-reload."
