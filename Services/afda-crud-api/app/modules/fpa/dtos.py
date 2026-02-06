from datetime import datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field


# ── Budget ──
class BudgetCreate(BaseModel):
    name: str = Field(..., max_length=200)
    fiscal_year: int
    department: Optional[str] = None
    total_amount: float = 0.0
    currency: str = "USD"


class BudgetUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None
    total_amount: Optional[float] = None
    department: Optional[str] = None


class LineItemOut(BaseModel):
    id: UUID
    account_code: str
    account_name: str
    period: str
    budgeted_amount: float
    actual_amount: float

    model_config = {"from_attributes": True}


class BudgetOut(BaseModel):
    id: UUID
    name: str
    fiscal_year: int
    department: Optional[str]
    status: str
    total_amount: float
    currency: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class BudgetDetailOut(BudgetOut):
    line_items: List[LineItemOut] = []


class BudgetVsActualOut(BaseModel):
    account_code: str
    account_name: str
    period: str
    budgeted: float
    actual: float
    variance: float
    variance_pct: float


# ── Variance ──
class VarianceOut(BaseModel):
    id: UUID
    period: str
    department: str
    account_code: str
    account_name: str
    budgeted: float
    actual: float
    variance_amount: float
    variance_pct: float
    explanation: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Flux ──
class FluxOut(BaseModel):
    id: UUID
    period: str
    comparison_period: str
    account_code: str
    account_name: str
    current_value: float
    prior_value: float
    change_amount: float
    change_pct: float
    ai_commentary: Optional[str]
    generated_by: str
    created_at: datetime

    model_config = {"from_attributes": True}


class FluxGenerateRequest(BaseModel):
    period: str
    comparison_period: str


# ── Forecast ──
class ForecastCreate(BaseModel):
    name: str = Field(..., max_length=200)
    forecast_type: str
    scenario: str = "base"
    fiscal_year: int
    total_projected: float = 0.0
    methodology: Optional[str] = None


class ForecastOut(BaseModel):
    id: UUID
    name: str
    forecast_type: str
    scenario: str
    fiscal_year: int
    total_projected: float
    confidence_score: Optional[float]
    methodology: Optional[str]
    generated_by: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Report ──
class ReportGenerateRequest(BaseModel):
    title: str
    report_type: str = "monthly"
    period: str


class ReportOut(BaseModel):
    id: UUID
    title: str
    report_type: str
    period: str
    content: Optional[str]
    file_path: Optional[str]
    generated_by: str
    created_at: datetime

    model_config = {"from_attributes": True}
