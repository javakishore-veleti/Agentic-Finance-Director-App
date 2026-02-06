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
