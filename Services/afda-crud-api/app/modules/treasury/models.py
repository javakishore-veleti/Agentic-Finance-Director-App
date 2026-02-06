import uuid
from datetime import datetime, date
from sqlalchemy import String, Text, Float, Integer, Boolean, DateTime, Date, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import enum


class AccountType(str, enum.Enum):
    CHECKING = "checking"
    SAVINGS = "savings"
    MONEY_MARKET = "money_market"
    INVESTMENT = "investment"
    CREDIT_LINE = "credit_line"


class AccountStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    FROZEN = "frozen"


class BankAccount(Base):
    __tablename__ = "bank_accounts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    bank_name: Mapped[str] = mapped_column(String(200), nullable=False)
    account_name: Mapped[str] = mapped_column(String(200), nullable=False)
    account_number_masked: Mapped[str] = mapped_column(String(20), nullable=False)  # ****1234
    account_type: Mapped[AccountType] = mapped_column(SAEnum(AccountType), default=AccountType.CHECKING)
    currency: Mapped[str] = mapped_column(String(3), default="USD")
    current_balance: Mapped[float] = mapped_column(Float, default=0.0)
    available_balance: Mapped[float] = mapped_column(Float, default=0.0)
    status: Mapped[AccountStatus] = mapped_column(SAEnum(AccountStatus), default=AccountStatus.ACTIVE)
    last_synced_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    transactions: Mapped[list["CashTransaction"]] = relationship(back_populates="account", cascade="all, delete-orphan")


class CashPosition(Base):
    __tablename__ = "cash_positions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    snapshot_date: Mapped[date] = mapped_column(Date, nullable=False)
    total_cash: Mapped[float] = mapped_column(Float, default=0.0)
    total_investments: Mapped[float] = mapped_column(Float, default=0.0)
    total_credit_available: Mapped[float] = mapped_column(Float, default=0.0)
    net_position: Mapped[float] = mapped_column(Float, default=0.0)
    currency: Mapped[str] = mapped_column(String(3), default="USD")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class CashTransaction(Base):
    __tablename__ = "cash_transactions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    account_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("bank_accounts.id"))
    transaction_date: Mapped[date] = mapped_column(Date, nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    direction: Mapped[str] = mapped_column(String(10), nullable=False)  # inflow, outflow
    category: Mapped[str] = mapped_column(String(100), nullable=True)
    description: Mapped[str] = mapped_column(String(500), nullable=True)
    counterparty: Mapped[str] = mapped_column(String(200), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    account: Mapped["BankAccount"] = relationship(back_populates="transactions")


class CashForecast(Base):
    __tablename__ = "cash_forecasts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    forecast_date: Mapped[date] = mapped_column(Date, nullable=False)
    projected_inflow: Mapped[float] = mapped_column(Float, default=0.0)
    projected_outflow: Mapped[float] = mapped_column(Float, default=0.0)
    projected_balance: Mapped[float] = mapped_column(Float, default=0.0)
    scenario: Mapped[str] = mapped_column(String(50), default="base")
    confidence_score: Mapped[float] = mapped_column(Float, nullable=True)
    generated_by: Mapped[str] = mapped_column(String(50), default="AGT-030")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ArInvoice(Base):
    __tablename__ = "ar_invoices"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    invoice_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    customer_name: Mapped[str] = mapped_column(String(200), nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    amount_paid: Mapped[float] = mapped_column(Float, default=0.0)
    currency: Mapped[str] = mapped_column(String(3), default="USD")
    issue_date: Mapped[date] = mapped_column(Date, nullable=False)
    due_date: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="open")  # open, partial, paid, overdue, written_off
    days_outstanding: Mapped[int] = mapped_column(Integer, default=0)
    aging_bucket: Mapped[str] = mapped_column(String(20), default="current")  # current, 1-30, 31-60, 61-90, 90+
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class LiquidityMetric(Base):
    __tablename__ = "liquidity_metrics"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    metric_date: Mapped[date] = mapped_column(Date, nullable=False)
    current_ratio: Mapped[float] = mapped_column(Float, nullable=True)
    quick_ratio: Mapped[float] = mapped_column(Float, nullable=True)
    cash_ratio: Mapped[float] = mapped_column(Float, nullable=True)
    working_capital: Mapped[float] = mapped_column(Float, nullable=True)
    days_cash_on_hand: Mapped[float] = mapped_column(Float, nullable=True)
    burn_rate: Mapped[float] = mapped_column(Float, nullable=True)
    runway_months: Mapped[float] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
