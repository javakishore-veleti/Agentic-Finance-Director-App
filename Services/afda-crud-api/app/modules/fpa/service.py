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
