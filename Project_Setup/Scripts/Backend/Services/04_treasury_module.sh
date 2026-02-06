#!/bin/bash
###############################################################################
# 04_treasury_module.sh
# Creates: Treasury module — cash position, bank accounts, AR aging, liquidity
# Endpoints: /api/v1/treasury/*
# Run from: git repo root (Agentic-Finance-Director-App/)
###############################################################################
set -e

MOD="Services/afda-crud-api/app/modules/treasury"

echo "🔧 [04] Creating Treasury module..."

# --- models.py ---
cat > "$MOD/models.py" << 'PYEOF'
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
    metric_date: Mapped[date] = mapped_column(Date, nullable=False)
    current_ratio: Mapped[float] = mapped_column(Float, nullable=True)
    quick_ratio: Mapped[float] = mapped_column(Float, nullable=True)
    cash_ratio: Mapped[float] = mapped_column(Float, nullable=True)
    working_capital: Mapped[float] = mapped_column(Float, nullable=True)
    days_cash_on_hand: Mapped[float] = mapped_column(Float, nullable=True)
    burn_rate: Mapped[float] = mapped_column(Float, nullable=True)
    runway_months: Mapped[float] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
PYEOF

# --- dtos.py ---
cat > "$MOD/dtos.py" << 'PYEOF'
from datetime import datetime, date
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field


# ── Bank Account ──
class BankAccountCreate(BaseModel):
    bank_name: str = Field(..., max_length=200)
    account_name: str = Field(..., max_length=200)
    account_number_masked: str = Field(..., max_length=20)
    account_type: str = "checking"
    currency: str = "USD"
    current_balance: float = 0.0
    available_balance: float = 0.0


class BankAccountUpdate(BaseModel):
    account_name: Optional[str] = None
    current_balance: Optional[float] = None
    available_balance: Optional[float] = None
    status: Optional[str] = None


class BankAccountOut(BaseModel):
    id: UUID
    bank_name: str
    account_name: str
    account_number_masked: str
    account_type: str
    currency: str
    current_balance: float
    available_balance: float
    status: str
    last_synced_at: Optional[datetime]
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Cash Position ──
class CashPositionOut(BaseModel):
    id: UUID
    snapshot_date: date
    total_cash: float
    total_investments: float
    total_credit_available: float
    net_position: float
    currency: str
    created_at: datetime

    model_config = {"from_attributes": True}


class CashPositionSummary(BaseModel):
    total_cash: float
    total_investments: float
    total_credit_available: float
    net_position: float
    accounts_count: int
    last_updated: Optional[datetime]


# ── Cash Forecast ──
class CashForecastOut(BaseModel):
    id: UUID
    forecast_date: date
    projected_inflow: float
    projected_outflow: float
    projected_balance: float
    scenario: str
    confidence_score: Optional[float]
    generated_by: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ── AR Aging ──
class ArInvoiceOut(BaseModel):
    id: UUID
    invoice_number: str
    customer_name: str
    amount: float
    amount_paid: float
    currency: str
    issue_date: date
    due_date: date
    status: str
    days_outstanding: int
    aging_bucket: str
    created_at: datetime

    model_config = {"from_attributes": True}


class AgingBucketSummary(BaseModel):
    bucket: str
    count: int
    total_amount: float
    percentage: float


class ArAgingSummary(BaseModel):
    total_receivables: float
    total_overdue: float
    buckets: List[AgingBucketSummary]


# ── Liquidity ──
class LiquidityOut(BaseModel):
    id: UUID
    metric_date: date
    current_ratio: Optional[float]
    quick_ratio: Optional[float]
    cash_ratio: Optional[float]
    working_capital: Optional[float]
    days_cash_on_hand: Optional[float]
    burn_rate: Optional[float]
    runway_months: Optional[float]
    created_at: datetime

    model_config = {"from_attributes": True}


class LiquidityRatios(BaseModel):
    current_ratio: Optional[float]
    quick_ratio: Optional[float]
    cash_ratio: Optional[float]
    working_capital: Optional[float]
    days_cash_on_hand: Optional[float]
    burn_rate: Optional[float]
    runway_months: Optional[float]
    as_of: date
PYEOF

# --- dao.py ---
cat > "$MOD/dao.py" << 'PYEOF'
from uuid import UUID
from datetime import date
from typing import Optional, List
from sqlalchemy import select, func, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.treasury.models import (
    BankAccount, CashPosition, CashTransaction, CashForecast, ArInvoice, LiquidityMetric,
)


class BankAccountDAO:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self, status: Optional[str] = None) -> List[BankAccount]:
        q = select(BankAccount)
        if status:
            q = q.where(BankAccount.status == status)
        result = await self.db.execute(q.order_by(BankAccount.bank_name))
        return list(result.scalars().all())

    async def get_by_id(self, account_id: UUID) -> Optional[BankAccount]:
        result = await self.db.execute(select(BankAccount).where(BankAccount.id == account_id))
        return result.scalar_one_or_none()

    async def create(self, data: dict) -> BankAccount:
        account = BankAccount(**data)
        self.db.add(account)
        await self.db.commit()
        await self.db.refresh(account)
        return account

    async def update(self, account_id: UUID, data: dict) -> Optional[BankAccount]:
        await self.db.execute(update(BankAccount).where(BankAccount.id == account_id).values(**data))
        await self.db.commit()
        return await self.get_by_id(account_id)


class CashPositionDAO:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_current(self) -> Optional[CashPosition]:
        result = await self.db.execute(
            select(CashPosition).order_by(CashPosition.snapshot_date.desc()).limit(1)
        )
        return result.scalar_one_or_none()

    async def get_history(self, days: int = 90) -> List[CashPosition]:
        result = await self.db.execute(
            select(CashPosition).order_by(CashPosition.snapshot_date.desc()).limit(days)
        )
        return list(result.scalars().all())


class CashForecastDAO:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_forecast(self, scenario: str = "base", days: int = 90) -> List[CashForecast]:
        result = await self.db.execute(
            select(CashForecast)
                .where(CashForecast.scenario == scenario)
                .order_by(CashForecast.forecast_date)
                .limit(days)
        )
        return list(result.scalars().all())

    async def create(self, data: dict) -> CashForecast:
        forecast = CashForecast(**data)
        self.db.add(forecast)
        await self.db.commit()
        await self.db.refresh(forecast)
        return forecast


class ArInvoiceDAO:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self, status: Optional[str] = None, limit: int = 100, offset: int = 0) -> List[ArInvoice]:
        q = select(ArInvoice)
        if status:
            q = q.where(ArInvoice.status == status)
        result = await self.db.execute(q.order_by(ArInvoice.due_date).offset(offset).limit(limit))
        return list(result.scalars().all())

    async def get_aging_summary(self) -> list:
        result = await self.db.execute(
            select(
                ArInvoice.aging_bucket,
                func.count().label("count"),
                func.sum(ArInvoice.amount - ArInvoice.amount_paid).label("total_amount"),
            )
            .where(ArInvoice.status.in_(["open", "partial", "overdue"]))
            .group_by(ArInvoice.aging_bucket)
        )
        return [dict(row._mapping) for row in result.all()]

    async def get_total_receivables(self) -> float:
        result = await self.db.execute(
            select(func.sum(ArInvoice.amount - ArInvoice.amount_paid))
                .where(ArInvoice.status.in_(["open", "partial", "overdue"]))
        )
        return result.scalar() or 0.0

    async def get_total_overdue(self) -> float:
        result = await self.db.execute(
            select(func.sum(ArInvoice.amount - ArInvoice.amount_paid))
                .where(ArInvoice.status == "overdue")
        )
        return result.scalar() or 0.0


class LiquidityDAO:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_latest(self) -> Optional[LiquidityMetric]:
        result = await self.db.execute(
            select(LiquidityMetric).order_by(LiquidityMetric.metric_date.desc()).limit(1)
        )
        return result.scalar_one_or_none()

    async def get_history(self, days: int = 90) -> List[LiquidityMetric]:
        result = await self.db.execute(
            select(LiquidityMetric).order_by(LiquidityMetric.metric_date.desc()).limit(days)
        )
        return list(result.scalars().all())
PYEOF

# --- service.py ---
cat > "$MOD/service.py" << 'PYEOF'
from uuid import UUID
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.treasury.dao import (
    BankAccountDAO, CashPositionDAO, CashForecastDAO, ArInvoiceDAO, LiquidityDAO,
)
from app.modules.treasury.dtos import (
    BankAccountCreate, BankAccountUpdate, CashPositionSummary,
    ArAgingSummary, AgingBucketSummary, LiquidityRatios,
)
from app.shared.exceptions import NotFoundException


class BankAccountService:
    def __init__(self, db: AsyncSession):
        self.dao = BankAccountDAO(db)

    async def list_accounts(self, status=None):
        return await self.dao.get_all(status)

    async def get_account(self, account_id: UUID):
        account = await self.dao.get_by_id(account_id)
        if not account:
            raise NotFoundException("Bank Account", account_id)
        return account

    async def create_account(self, data: BankAccountCreate):
        return await self.dao.create(data.model_dump())

    async def update_account(self, account_id: UUID, data: BankAccountUpdate):
        existing = await self.dao.get_by_id(account_id)
        if not existing:
            raise NotFoundException("Bank Account", account_id)
        return await self.dao.update(account_id, data.model_dump(exclude_unset=True))


class CashPositionService:
    def __init__(self, db: AsyncSession):
        self.position_dao = CashPositionDAO(db)
        self.account_dao = BankAccountDAO(db)

    async def get_current(self) -> CashPositionSummary:
        accounts = await self.account_dao.get_all(status="active")
        total_cash = sum(a.current_balance for a in accounts if a.account_type.value in ("checking", "savings"))
        total_inv = sum(a.current_balance for a in accounts if a.account_type.value == "investment")
        total_credit = sum(a.available_balance for a in accounts if a.account_type.value == "credit_line")
        last_sync = max((a.last_synced_at for a in accounts if a.last_synced_at), default=None)
        return CashPositionSummary(
            total_cash=total_cash,
            total_investments=total_inv,
            total_credit_available=total_credit,
            net_position=total_cash + total_inv,
            accounts_count=len(accounts),
            last_updated=last_sync,
        )

    async def get_history(self, days=90):
        return await self.position_dao.get_history(days)


class CashForecastService:
    def __init__(self, db: AsyncSession):
        self.dao = CashForecastDAO(db)

    async def get_forecast(self, scenario="base", days=90):
        return await self.dao.get_forecast(scenario, days)

    async def generate_forecast(self):
        # Placeholder — AGT-030 (Cash Flow Forecast Agent) generates this
        from datetime import date, timedelta
        entries = []
        base_balance = 2_500_000.0
        for i in range(30):
            d = date.today() + timedelta(days=i)
            inflow = 85000 + (i * 1000)
            outflow = 72000 + (i * 800)
            base_balance += inflow - outflow
            entry = await self.dao.create({
                "forecast_date": d,
                "projected_inflow": inflow,
                "projected_outflow": outflow,
                "projected_balance": base_balance,
                "scenario": "base",
                "confidence_score": max(95 - i, 60),
                "generated_by": "AGT-030",
            })
            entries.append(entry)
        return entries


class ArAgingService:
    def __init__(self, db: AsyncSession):
        self.dao = ArInvoiceDAO(db)

    async def get_summary(self) -> ArAgingSummary:
        total_recv = await self.dao.get_total_receivables()
        total_overdue = await self.dao.get_total_overdue()
        raw_buckets = await self.dao.get_aging_summary()
        buckets = [
            AgingBucketSummary(
                bucket=b["aging_bucket"],
                count=b["count"],
                total_amount=b["total_amount"] or 0,
                percentage=round((b["total_amount"] or 0) / total_recv * 100, 2) if total_recv else 0,
            )
            for b in raw_buckets
        ]
        return ArAgingSummary(total_receivables=total_recv, total_overdue=total_overdue, buckets=buckets)

    async def get_buckets(self):
        return await self.dao.get_aging_summary()

    async def get_invoices(self, status=None, limit=100, offset=0):
        return await self.dao.get_all(status, limit, offset)


class LiquidityService:
    def __init__(self, db: AsyncSession):
        self.dao = LiquidityDAO(db)

    async def get_metrics(self):
        return await self.dao.get_history()

    async def get_ratios(self) -> LiquidityRatios:
        latest = await self.dao.get_latest()
        if not latest:
            raise NotFoundException("Liquidity Metrics")
        return LiquidityRatios(
            current_ratio=latest.current_ratio,
            quick_ratio=latest.quick_ratio,
            cash_ratio=latest.cash_ratio,
            working_capital=latest.working_capital,
            days_cash_on_hand=latest.days_cash_on_hand,
            burn_rate=latest.burn_rate,
            runway_months=latest.runway_months,
            as_of=latest.metric_date,
        )
PYEOF

# --- facade.py ---
cat > "$MOD/facade.py" << 'PYEOF'
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.treasury.service import (
    BankAccountService, CashPositionService, CashForecastService, ArAgingService, LiquidityService,
)


class TreasuryFacade:
    def __init__(self, db: AsyncSession):
        self.bank_svc = BankAccountService(db)
        self.cash_svc = CashPositionService(db)
        self.forecast_svc = CashForecastService(db)
        self.ar_svc = ArAgingService(db)
        self.liquidity_svc = LiquidityService(db)
PYEOF

# --- router.py ---
cat > "$MOD/router.py" << 'PYEOF'
from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.shared.responses import ApiResponse
from app.modules.treasury.service import (
    BankAccountService, CashPositionService, CashForecastService, ArAgingService, LiquidityService,
)
from app.modules.treasury.dtos import (
    BankAccountCreate, BankAccountUpdate, BankAccountOut,
    CashPositionOut, CashPositionSummary,
    CashForecastOut,
    ArInvoiceOut, ArAgingSummary,
    LiquidityOut, LiquidityRatios,
)

router = APIRouter()


# ── Cash Position ──
@router.get("/cash-position", response_model=ApiResponse[CashPositionSummary])
async def get_cash_position(db: AsyncSession = Depends(get_db)):
    svc = CashPositionService(db)
    summary = await svc.get_current()
    return ApiResponse(data=summary)


@router.get("/cash-position/history", response_model=ApiResponse[list[CashPositionOut]])
async def cash_position_history(days: int = Query(90, ge=1, le=365), db: AsyncSession = Depends(get_db)):
    svc = CashPositionService(db)
    history = await svc.get_history(days)
    return ApiResponse(data=history)


# ── Bank Accounts ──
@router.get("/bank-accounts", response_model=ApiResponse[list[BankAccountOut]])
async def list_bank_accounts(status: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    svc = BankAccountService(db)
    accounts = await svc.list_accounts(status)
    return ApiResponse(data=accounts)


@router.post("/bank-accounts", response_model=ApiResponse[BankAccountOut], status_code=201)
async def create_bank_account(data: BankAccountCreate, db: AsyncSession = Depends(get_db)):
    svc = BankAccountService(db)
    account = await svc.create_account(data)
    return ApiResponse(data=account, message="Bank account created")


@router.get("/bank-accounts/{account_id}", response_model=ApiResponse[BankAccountOut])
async def get_bank_account(account_id: UUID, db: AsyncSession = Depends(get_db)):
    svc = BankAccountService(db)
    account = await svc.get_account(account_id)
    return ApiResponse(data=account)


# ── Cash Forecast ──
@router.get("/cash-forecast", response_model=ApiResponse[list[CashForecastOut]])
async def get_cash_forecast(
    scenario: str = "base",
    days: int = Query(90, ge=1, le=365),
    db: AsyncSession = Depends(get_db),
):
    svc = CashForecastService(db)
    forecast = await svc.get_forecast(scenario, days)
    return ApiResponse(data=forecast)


@router.post("/cash-forecast/generate", response_model=ApiResponse[list[CashForecastOut]], status_code=201)
async def generate_cash_forecast(db: AsyncSession = Depends(get_db)):
    svc = CashForecastService(db)
    forecast = await svc.generate_forecast()
    return ApiResponse(data=forecast, message="Cash forecast generated")


# ── AR Aging ──
@router.get("/ar-aging", response_model=ApiResponse[ArAgingSummary])
async def ar_aging_summary(db: AsyncSession = Depends(get_db)):
    svc = ArAgingService(db)
    summary = await svc.get_summary()
    return ApiResponse(data=summary)


@router.get("/ar-aging/buckets")
async def ar_aging_buckets(db: AsyncSession = Depends(get_db)):
    svc = ArAgingService(db)
    buckets = await svc.get_buckets()
    return ApiResponse(data=buckets)


@router.get("/ar-aging/invoices", response_model=ApiResponse[list[ArInvoiceOut]])
async def ar_invoices(
    status: Optional[str] = None,
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    svc = ArAgingService(db)
    invoices = await svc.get_invoices(status, limit, offset)
    return ApiResponse(data=invoices)


# ── Liquidity ──
@router.get("/liquidity", response_model=ApiResponse[list[LiquidityOut]])
async def get_liquidity(db: AsyncSession = Depends(get_db)):
    svc = LiquidityService(db)
    metrics = await svc.get_metrics()
    return ApiResponse(data=metrics)


@router.get("/liquidity/ratios", response_model=ApiResponse[LiquidityRatios])
async def get_liquidity_ratios(db: AsyncSession = Depends(get_db)):
    svc = LiquidityService(db)
    ratios = await svc.get_ratios()
    return ApiResponse(data=ratios)
PYEOF

echo "✅ [04] Treasury module created at $MOD"
echo "    → models.py  — BankAccount, CashPosition, CashTransaction, CashForecast, ArInvoice, LiquidityMetric"
echo "    → dtos.py    — 12 Pydantic schemas"
echo "    → dao.py     — BankAccountDAO, CashPositionDAO, CashForecastDAO, ArInvoiceDAO, LiquidityDAO"
echo "    → service.py — 5 service classes (cash position aggregation, AR aging buckets, liquidity ratios)"
echo "    → facade.py  — TreasuryFacade orchestrator"
echo "    → router.py  — 13 endpoints under /api/v1/treasury"
echo ""
echo "   ⚡ Uncomment treasury router in main.py to activate"
echo "   Next: Run 05_accounting_module.sh"
