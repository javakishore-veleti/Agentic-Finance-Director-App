import uuid
from datetime import datetime
from sqlalchemy import String, Text, Float, Integer, Boolean, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import enum


class BudgetStatus(str, enum.Enum):
    DRAFT = "draft"
    APPROVED = "approved"
    ACTIVE = "active"
    CLOSED = "closed"


class Budget(Base):
    __tablename__ = "budgets"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    fiscal_year: Mapped[int] = mapped_column(Integer, nullable=False)
    department: Mapped[str] = mapped_column(String(100), nullable=True)
    status: Mapped[BudgetStatus] = mapped_column(SAEnum(BudgetStatus), default=BudgetStatus.DRAFT)
    total_amount: Mapped[float] = mapped_column(Float, default=0.0)
    currency: Mapped[str] = mapped_column(String(3), default="USD")
    created_by: Mapped[str] = mapped_column(String(200), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    line_items: Mapped[list["BudgetLineItem"]] = relationship(back_populates="budget", cascade="all, delete-orphan")


class BudgetLineItem(Base):
    __tablename__ = "budget_line_items"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    budget_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("budgets.id"))
    account_code: Mapped[str] = mapped_column(String(50), nullable=False)
    account_name: Mapped[str] = mapped_column(String(200), nullable=False)
    period: Mapped[str] = mapped_column(String(20), nullable=False)  # 2025-01, 2025-Q1
    budgeted_amount: Mapped[float] = mapped_column(Float, default=0.0)
    actual_amount: Mapped[float] = mapped_column(Float, default=0.0)

    budget: Mapped["Budget"] = relationship(back_populates="line_items")

    @property
    def variance(self) -> float:
        return self.actual_amount - self.budgeted_amount

    @property
    def variance_pct(self) -> float:
        if self.budgeted_amount == 0:
            return 0.0
        return round((self.variance / self.budgeted_amount) * 100, 2)


class VarianceRecord(Base):
    __tablename__ = "variance_records"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    period: Mapped[str] = mapped_column(String(20), nullable=False)
    department: Mapped[str] = mapped_column(String(100), nullable=False)
    account_code: Mapped[str] = mapped_column(String(50), nullable=False)
    account_name: Mapped[str] = mapped_column(String(200), nullable=False)
    budgeted: Mapped[float] = mapped_column(Float, default=0.0)
    actual: Mapped[float] = mapped_column(Float, default=0.0)
    variance_amount: Mapped[float] = mapped_column(Float, default=0.0)
    variance_pct: Mapped[float] = mapped_column(Float, default=0.0)
    explanation: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class FluxCommentary(Base):
    __tablename__ = "flux_commentaries"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    period: Mapped[str] = mapped_column(String(20), nullable=False)
    comparison_period: Mapped[str] = mapped_column(String(20), nullable=False)
    account_code: Mapped[str] = mapped_column(String(50), nullable=False)
    account_name: Mapped[str] = mapped_column(String(200), nullable=False)
    current_value: Mapped[float] = mapped_column(Float, default=0.0)
    prior_value: Mapped[float] = mapped_column(Float, default=0.0)
    change_amount: Mapped[float] = mapped_column(Float, default=0.0)
    change_pct: Mapped[float] = mapped_column(Float, default=0.0)
    ai_commentary: Mapped[str] = mapped_column(Text, nullable=True)
    generated_by: Mapped[str] = mapped_column(String(50), default="AGT-017")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Forecast(Base):
    __tablename__ = "forecasts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    forecast_type: Mapped[str] = mapped_column(String(50), nullable=False)  # revenue, expense, cash_flow
    scenario: Mapped[str] = mapped_column(String(50), default="base")  # base, optimistic, pessimistic
    fiscal_year: Mapped[int] = mapped_column(Integer, nullable=False)
    total_projected: Mapped[float] = mapped_column(Float, default=0.0)
    confidence_score: Mapped[float] = mapped_column(Float, nullable=True)  # 0-100
    methodology: Mapped[str] = mapped_column(String(100), nullable=True)  # linear, ml, agent
    generated_by: Mapped[str] = mapped_column(String(50), default="AGT-018")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class FpaReport(Base):
    __tablename__ = "fpa_reports"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    report_type: Mapped[str] = mapped_column(String(50), nullable=False)  # monthly, quarterly, annual, ad_hoc
    period: Mapped[str] = mapped_column(String(20), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=True)  # markdown/html
    file_path: Mapped[str] = mapped_column(String(500), nullable=True)  # stored file path
    generated_by: Mapped[str] = mapped_column(String(50), default="AGT-020")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
