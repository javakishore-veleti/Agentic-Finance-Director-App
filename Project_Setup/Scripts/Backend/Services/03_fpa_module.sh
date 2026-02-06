#!/bin/bash
###############################################################################
# 03_fpa_module.sh
# Creates: FP&A module — budgets, variance, flux, forecasts, reports
# Endpoints: /api/v1/fpa/*
# Run from: git repo root (Agentic-Finance-Director-App/)
###############################################################################
set -e

MOD="Services/afda-crud-api/app/modules/fpa"

echo "🔧 [03] Creating FP&A module..."

# --- models.py ---
cat > "$MOD/models.py" << 'PYEOF'
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
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    report_type: Mapped[str] = mapped_column(String(50), nullable=False)  # monthly, quarterly, annual, ad_hoc
    period: Mapped[str] = mapped_column(String(20), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=True)  # markdown/html
    file_path: Mapped[str] = mapped_column(String(500), nullable=True)  # stored file path
    generated_by: Mapped[str] = mapped_column(String(50), default="AGT-020")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
PYEOF

# --- dtos.py ---
cat > "$MOD/dtos.py" << 'PYEOF'
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
PYEOF

# --- dao.py ---
cat > "$MOD/dao.py" << 'PYEOF'
from uuid import UUID
from typing import Optional, List
from sqlalchemy import select, func, update, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.modules.fpa.models import (
    Budget, BudgetLineItem, VarianceRecord, FluxCommentary, Forecast, FpaReport,
)


class BudgetDAO:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self, fiscal_year: Optional[int] = None, department: Optional[str] = None,
                      limit: int = 50, offset: int = 0) -> List[Budget]:
        q = select(Budget)
        if fiscal_year:
            q = q.where(Budget.fiscal_year == fiscal_year)
        if department:
            q = q.where(Budget.department == department)
        result = await self.db.execute(q.order_by(Budget.created_at.desc()).offset(offset).limit(limit))
        return list(result.scalars().all())

    async def get_by_id(self, budget_id: UUID) -> Optional[Budget]:
        result = await self.db.execute(
            select(Budget).options(selectinload(Budget.line_items)).where(Budget.id == budget_id)
        )
        return result.scalar_one_or_none()

    async def create(self, data: dict) -> Budget:
        budget = Budget(**data)
        self.db.add(budget)
        await self.db.commit()
        await self.db.refresh(budget)
        return budget

    async def update(self, budget_id: UUID, data: dict) -> Optional[Budget]:
        await self.db.execute(update(Budget).where(Budget.id == budget_id).values(**data))
        await self.db.commit()
        return await self.get_by_id(budget_id)

    async def get_vs_actual(self, budget_id: UUID) -> List[BudgetLineItem]:
        result = await self.db.execute(
            select(BudgetLineItem).where(BudgetLineItem.budget_id == budget_id)
                .order_by(BudgetLineItem.period, BudgetLineItem.account_code)
        )
        return list(result.scalars().all())


class VarianceDAO:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self, period: Optional[str] = None, department: Optional[str] = None) -> List[VarianceRecord]:
        q = select(VarianceRecord)
        if period:
            q = q.where(VarianceRecord.period == period)
        if department:
            q = q.where(VarianceRecord.department == department)
        result = await self.db.execute(q.order_by(VarianceRecord.variance_amount.desc()))
        return list(result.scalars().all())

    async def get_by_department(self, period: Optional[str] = None) -> list:
        q = select(
            VarianceRecord.department,
            func.sum(VarianceRecord.budgeted).label("total_budgeted"),
            func.sum(VarianceRecord.actual).label("total_actual"),
            func.sum(VarianceRecord.variance_amount).label("total_variance"),
        ).group_by(VarianceRecord.department)
        if period:
            q = q.where(VarianceRecord.period == period)
        result = await self.db.execute(q)
        return [dict(row._mapping) for row in result.all()]

    async def get_by_account(self, period: Optional[str] = None) -> list:
        q = select(
            VarianceRecord.account_code,
            VarianceRecord.account_name,
            func.sum(VarianceRecord.budgeted).label("total_budgeted"),
            func.sum(VarianceRecord.actual).label("total_actual"),
            func.sum(VarianceRecord.variance_amount).label("total_variance"),
        ).group_by(VarianceRecord.account_code, VarianceRecord.account_name)
        if period:
            q = q.where(VarianceRecord.period == period)
        result = await self.db.execute(q)
        return [dict(row._mapping) for row in result.all()]


class FluxDAO:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self, period: Optional[str] = None, limit: int = 50) -> List[FluxCommentary]:
        q = select(FluxCommentary)
        if period:
            q = q.where(FluxCommentary.period == period)
        result = await self.db.execute(q.order_by(FluxCommentary.created_at.desc()).limit(limit))
        return list(result.scalars().all())

    async def create(self, data: dict) -> FluxCommentary:
        flux = FluxCommentary(**data)
        self.db.add(flux)
        await self.db.commit()
        await self.db.refresh(flux)
        return flux


class ForecastDAO:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self, fiscal_year: Optional[int] = None, forecast_type: Optional[str] = None) -> List[Forecast]:
        q = select(Forecast)
        if fiscal_year:
            q = q.where(Forecast.fiscal_year == fiscal_year)
        if forecast_type:
            q = q.where(Forecast.forecast_type == forecast_type)
        result = await self.db.execute(q.order_by(Forecast.created_at.desc()))
        return list(result.scalars().all())

    async def get_by_id(self, forecast_id: UUID) -> Optional[Forecast]:
        result = await self.db.execute(select(Forecast).where(Forecast.id == forecast_id))
        return result.scalar_one_or_none()

    async def create(self, data: dict) -> Forecast:
        forecast = Forecast(**data)
        self.db.add(forecast)
        await self.db.commit()
        await self.db.refresh(forecast)
        return forecast

    async def get_scenarios(self, forecast_id: UUID) -> List[Forecast]:
        base = await self.get_by_id(forecast_id)
        if not base:
            return []
        result = await self.db.execute(
            select(Forecast).where(
                Forecast.name == base.name,
                Forecast.fiscal_year == base.fiscal_year,
                Forecast.forecast_type == base.forecast_type,
            )
        )
        return list(result.scalars().all())


class ReportDAO:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self, report_type: Optional[str] = None) -> List[FpaReport]:
        q = select(FpaReport)
        if report_type:
            q = q.where(FpaReport.report_type == report_type)
        result = await self.db.execute(q.order_by(FpaReport.created_at.desc()))
        return list(result.scalars().all())

    async def get_by_id(self, report_id: UUID) -> Optional[FpaReport]:
        result = await self.db.execute(select(FpaReport).where(FpaReport.id == report_id))
        return result.scalar_one_or_none()

    async def create(self, data: dict) -> FpaReport:
        report = FpaReport(**data)
        self.db.add(report)
        await self.db.commit()
        await self.db.refresh(report)
        return report
PYEOF

# --- service.py ---
cat > "$MOD/service.py" << 'PYEOF'
from uuid import UUID
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.fpa.dao import BudgetDAO, VarianceDAO, FluxDAO, ForecastDAO, ReportDAO
from app.modules.fpa.dtos import (
    BudgetCreate, BudgetUpdate, BudgetVsActualOut,
    FluxGenerateRequest, ForecastCreate, ReportGenerateRequest,
)
from app.shared.exceptions import NotFoundException


class BudgetService:
    def __init__(self, db: AsyncSession):
        self.dao = BudgetDAO(db)

    async def list_budgets(self, fiscal_year=None, department=None, limit=50, offset=0):
        return await self.dao.get_all(fiscal_year, department, limit, offset)

    async def get_budget(self, budget_id: UUID):
        budget = await self.dao.get_by_id(budget_id)
        if not budget:
            raise NotFoundException("Budget", budget_id)
        return budget

    async def create_budget(self, data: BudgetCreate):
        return await self.dao.create(data.model_dump())

    async def update_budget(self, budget_id: UUID, data: BudgetUpdate):
        existing = await self.dao.get_by_id(budget_id)
        if not existing:
            raise NotFoundException("Budget", budget_id)
        return await self.dao.update(budget_id, data.model_dump(exclude_unset=True))

    async def get_vs_actual(self, budget_id: UUID) -> list[BudgetVsActualOut]:
        items = await self.dao.get_vs_actual(budget_id)
        return [
            BudgetVsActualOut(
                account_code=i.account_code,
                account_name=i.account_name,
                period=i.period,
                budgeted=i.budgeted_amount,
                actual=i.actual_amount,
                variance=i.actual_amount - i.budgeted_amount,
                variance_pct=round(((i.actual_amount - i.budgeted_amount) / i.budgeted_amount) * 100, 2)
                    if i.budgeted_amount != 0 else 0.0,
            )
            for i in items
        ]


class VarianceService:
    def __init__(self, db: AsyncSession):
        self.dao = VarianceDAO(db)

    async def get_variance(self, period=None, department=None):
        return await self.dao.get_all(period, department)

    async def get_by_department(self, period=None):
        return await self.dao.get_by_department(period)

    async def get_by_account(self, period=None):
        return await self.dao.get_by_account(period)


class FluxService:
    def __init__(self, db: AsyncSession):
        self.dao = FluxDAO(db)

    async def list_flux(self, period=None, limit=50):
        return await self.dao.get_all(period, limit)

    async def generate_flux(self, req: FluxGenerateRequest):
        # Placeholder — AGT-017 (Flux Commentary Agent) generates this
        data = {
            "period": req.period,
            "comparison_period": req.comparison_period,
            "account_code": "5000",
            "account_name": "Operating Expenses",
            "current_value": 150000.0,
            "prior_value": 140000.0,
            "change_amount": 10000.0,
            "change_pct": 7.14,
            "ai_commentary": f"Operating expenses increased 7.1% from {req.comparison_period} to {req.period}, "
                             f"driven primarily by headcount growth and cloud infrastructure costs.",
            "generated_by": "AGT-017",
        }
        return await self.dao.create(data)


class ForecastService:
    def __init__(self, db: AsyncSession):
        self.dao = ForecastDAO(db)

    async def list_forecasts(self, fiscal_year=None, forecast_type=None):
        return await self.dao.get_all(fiscal_year, forecast_type)

    async def get_forecast(self, forecast_id: UUID):
        forecast = await self.dao.get_by_id(forecast_id)
        if not forecast:
            raise NotFoundException("Forecast", forecast_id)
        return forecast

    async def create_forecast(self, data: ForecastCreate):
        return await self.dao.create(data.model_dump())

    async def get_scenarios(self, forecast_id: UUID):
        scenarios = await self.dao.get_scenarios(forecast_id)
        if not scenarios:
            raise NotFoundException("Forecast", forecast_id)
        return scenarios


class ReportService:
    def __init__(self, db: AsyncSession):
        self.dao = ReportDAO(db)

    async def list_reports(self, report_type=None):
        return await self.dao.get_all(report_type)

    async def get_report(self, report_id: UUID):
        report = await self.dao.get_by_id(report_id)
        if not report:
            raise NotFoundException("Report", report_id)
        return report

    async def generate_report(self, req: ReportGenerateRequest):
        # Placeholder — AGT-020 (Report Generation Agent) generates this
        data = {
            "title": req.title,
            "report_type": req.report_type,
            "period": req.period,
            "content": f"# {req.title}\n\nAI-generated {req.report_type} report for {req.period}.",
            "generated_by": "AGT-020",
        }
        return await self.dao.create(data)
PYEOF

# --- facade.py ---
cat > "$MOD/facade.py" << 'PYEOF'
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.fpa.service import BudgetService, VarianceService, FluxService, ForecastService, ReportService


class FpaFacade:
    """Thin orchestrator — use when endpoints need cross-service data."""

    def __init__(self, db: AsyncSession):
        self.budget_svc = BudgetService(db)
        self.variance_svc = VarianceService(db)
        self.flux_svc = FluxService(db)
        self.forecast_svc = ForecastService(db)
        self.report_svc = ReportService(db)
PYEOF

# --- router.py ---
cat > "$MOD/router.py" << 'PYEOF'
from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.shared.responses import ApiResponse
from app.modules.fpa.service import (
    BudgetService, VarianceService, FluxService, ForecastService, ReportService,
)
from app.modules.fpa.dtos import (
    BudgetCreate, BudgetUpdate, BudgetOut, BudgetDetailOut, BudgetVsActualOut,
    VarianceOut, FluxOut, FluxGenerateRequest,
    ForecastCreate, ForecastOut,
    ReportGenerateRequest, ReportOut,
)

router = APIRouter()


# ── Budgets ──
@router.get("/budgets", response_model=ApiResponse[list[BudgetOut]])
async def list_budgets(
    fiscal_year: Optional[int] = None,
    department: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    svc = BudgetService(db)
    budgets = await svc.list_budgets(fiscal_year, department, limit, offset)
    return ApiResponse(data=budgets)


@router.post("/budgets", response_model=ApiResponse[BudgetOut], status_code=201)
async def create_budget(data: BudgetCreate, db: AsyncSession = Depends(get_db)):
    svc = BudgetService(db)
    budget = await svc.create_budget(data)
    return ApiResponse(data=budget, message="Budget created")


@router.get("/budgets/{budget_id}", response_model=ApiResponse[BudgetDetailOut])
async def get_budget(budget_id: UUID, db: AsyncSession = Depends(get_db)):
    svc = BudgetService(db)
    budget = await svc.get_budget(budget_id)
    return ApiResponse(data=budget)


@router.put("/budgets/{budget_id}", response_model=ApiResponse[BudgetOut])
async def update_budget(budget_id: UUID, data: BudgetUpdate, db: AsyncSession = Depends(get_db)):
    svc = BudgetService(db)
    budget = await svc.update_budget(budget_id, data)
    return ApiResponse(data=budget, message="Budget updated")


@router.get("/budgets/{budget_id}/vs-actual", response_model=ApiResponse[list[BudgetVsActualOut]])
async def budget_vs_actual(budget_id: UUID, db: AsyncSession = Depends(get_db)):
    svc = BudgetService(db)
    result = await svc.get_vs_actual(budget_id)
    return ApiResponse(data=result)


# ── Variance ──
@router.get("/variance", response_model=ApiResponse[list[VarianceOut]])
async def get_variance(
    period: Optional[str] = None,
    department: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    svc = VarianceService(db)
    records = await svc.get_variance(period, department)
    return ApiResponse(data=records)


@router.get("/variance/by-department")
async def variance_by_department(period: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    svc = VarianceService(db)
    result = await svc.get_by_department(period)
    return ApiResponse(data=result)


@router.get("/variance/by-account")
async def variance_by_account(period: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    svc = VarianceService(db)
    result = await svc.get_by_account(period)
    return ApiResponse(data=result)


# ── Flux Commentary ──
@router.get("/flux", response_model=ApiResponse[list[FluxOut]])
async def list_flux(period: Optional[str] = None, limit: int = 50, db: AsyncSession = Depends(get_db)):
    svc = FluxService(db)
    records = await svc.list_flux(period, limit)
    return ApiResponse(data=records)


@router.post("/flux/generate", response_model=ApiResponse[FluxOut], status_code=201)
async def generate_flux(data: FluxGenerateRequest, db: AsyncSession = Depends(get_db)):
    svc = FluxService(db)
    flux = await svc.generate_flux(data)
    return ApiResponse(data=flux, message="Flux commentary generated")


# ── Forecasts ──
@router.get("/forecasts", response_model=ApiResponse[list[ForecastOut]])
async def list_forecasts(
    fiscal_year: Optional[int] = None,
    forecast_type: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    svc = ForecastService(db)
    forecasts = await svc.list_forecasts(fiscal_year, forecast_type)
    return ApiResponse(data=forecasts)


@router.post("/forecasts", response_model=ApiResponse[ForecastOut], status_code=201)
async def create_forecast(data: ForecastCreate, db: AsyncSession = Depends(get_db)):
    svc = ForecastService(db)
    forecast = await svc.create_forecast(data)
    return ApiResponse(data=forecast, message="Forecast created")


@router.get("/forecasts/{forecast_id}", response_model=ApiResponse[ForecastOut])
async def get_forecast(forecast_id: UUID, db: AsyncSession = Depends(get_db)):
    svc = ForecastService(db)
    forecast = await svc.get_forecast(forecast_id)
    return ApiResponse(data=forecast)


@router.get("/forecasts/{forecast_id}/scenarios", response_model=ApiResponse[list[ForecastOut]])
async def get_scenarios(forecast_id: UUID, db: AsyncSession = Depends(get_db)):
    svc = ForecastService(db)
    scenarios = await svc.get_scenarios(forecast_id)
    return ApiResponse(data=scenarios)


# ── Reports ──
@router.get("/reports", response_model=ApiResponse[list[ReportOut]])
async def list_reports(report_type: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    svc = ReportService(db)
    reports = await svc.list_reports(report_type)
    return ApiResponse(data=reports)


@router.post("/reports/generate", response_model=ApiResponse[ReportOut], status_code=201)
async def generate_report(data: ReportGenerateRequest, db: AsyncSession = Depends(get_db)):
    svc = ReportService(db)
    report = await svc.generate_report(data)
    return ApiResponse(data=report, message="Report generated")


@router.get("/reports/{report_id}", response_model=ApiResponse[ReportOut])
async def get_report(report_id: UUID, db: AsyncSession = Depends(get_db)):
    svc = ReportService(db)
    report = await svc.get_report(report_id)
    return ApiResponse(data=report)
PYEOF

echo "✅ [03] FP&A module created at $MOD"
echo "    → models.py  — Budget, BudgetLineItem, VarianceRecord, FluxCommentary, Forecast, FpaReport"
echo "    → dtos.py    — 14 Pydantic schemas"
echo "    → dao.py     — BudgetDAO, VarianceDAO, FluxDAO, ForecastDAO, ReportDAO"
echo "    → service.py — 5 service classes with business logic"
echo "    → facade.py  — FpaFacade orchestrator"
echo "    → router.py  — 17 endpoints under /api/v1/fpa"
echo ""
echo "   ⚡ Uncomment fpa router in main.py to activate"
echo "   Next: Run 04_treasury_module.sh"
