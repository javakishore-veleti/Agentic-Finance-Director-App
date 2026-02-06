from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.risk.service import AlertService, AlertRuleService, RiskDashboardService, AlertHistoryService


class RiskFacade:
    def __init__(self, db: AsyncSession):
        self.alert_svc = AlertService(db)
        self.rule_svc = AlertRuleService(db)
        self.dashboard_svc = RiskDashboardService(db)
        self.history_svc = AlertHistoryService(db)
