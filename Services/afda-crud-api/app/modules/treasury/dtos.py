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
