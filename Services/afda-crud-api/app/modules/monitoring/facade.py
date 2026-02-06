from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.monitoring.service import (
    SystemHealthService, ServiceStatusService, ApiMetricsService, GrafanaService,
)


class MonitoringFacade:
    def __init__(self, db: AsyncSession):
        self.health_svc = SystemHealthService(db)
        self.status_svc = ServiceStatusService(db)
        self.metrics_svc = ApiMetricsService(db)
        self.grafana_svc = GrafanaService()
