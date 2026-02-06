from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.org_context import get_org_context, OrgContext
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
