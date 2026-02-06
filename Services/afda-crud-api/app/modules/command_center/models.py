import uuid
from datetime import datetime
from sqlalchemy import String, Text, Float, Integer, Boolean, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import enum


class KpiStatus(str, enum.Enum):
    ON_TRACK = "on_track"
    AT_RISK = "at_risk"
    OFF_TRACK = "off_track"


class ActionItemStatus(str, enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class ActionItemPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class KpiDefinition(Base):
    __tablename__ = "kpi_definitions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)  # revenue, cost, margin, liquidity
    unit: Mapped[str] = mapped_column(String(50), default="%")  # %, $, ratio, count
    target_value: Mapped[float] = mapped_column(Float, nullable=True)
    current_value: Mapped[float] = mapped_column(Float, nullable=True)
    previous_value: Mapped[float] = mapped_column(Float, nullable=True)
    status: Mapped[KpiStatus] = mapped_column(SAEnum(KpiStatus), default=KpiStatus.ON_TRACK)
    trend_direction: Mapped[str] = mapped_column(String(10), default="flat")  # up, down, flat
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    values: Mapped[list["KpiValue"]] = relationship(back_populates="kpi", cascade="all, delete-orphan")


class KpiValue(Base):
    __tablename__ = "kpi_values"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    kpi_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("kpi_definitions.id"))
    value: Mapped[float] = mapped_column(Float, nullable=False)
    period: Mapped[str] = mapped_column(String(20), nullable=False)  # 2025-Q1, 2025-01
    recorded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    kpi: Mapped["KpiDefinition"] = relationship(back_populates="values")


class ExecutiveBriefing(Base):
    __tablename__ = "executive_briefings"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    key_insights: Mapped[str] = mapped_column(Text, nullable=True)  # JSON array stored as text
    risk_highlights: Mapped[str] = mapped_column(Text, nullable=True)
    generated_by: Mapped[str] = mapped_column(String(50), default="AGT-001")  # agent ID
    period: Mapped[str] = mapped_column(String(20), nullable=False)
    is_latest: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ActionItem(Base):
    __tablename__ = "action_items"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    status: Mapped[ActionItemStatus] = mapped_column(SAEnum(ActionItemStatus), default=ActionItemStatus.OPEN)
    priority: Mapped[ActionItemPriority] = mapped_column(SAEnum(ActionItemPriority), default=ActionItemPriority.MEDIUM)
    assignee: Mapped[str] = mapped_column(String(200), nullable=True)
    source_agent: Mapped[str] = mapped_column(String(50), nullable=True)  # which agent created it
    due_date: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
