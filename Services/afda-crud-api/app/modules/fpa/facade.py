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
