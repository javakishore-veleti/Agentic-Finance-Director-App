from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.monitoring.dao import ServiceRegistryDAO, IncidentDAO, ApiMetricsDAO
from app.modules.monitoring.dtos import (
    SystemHealthSummary, DependencyNode, ApiMetricsSummary, EndpointMetrics,
    LatencyPercentiles, GrafanaDashboard,
)
from app.shared.exceptions import NotFoundException


class SystemHealthService:
    def __init__(self, db: AsyncSession):
        self.svc_dao = ServiceRegistryDAO(db)
        self.incident_dao = IncidentDAO(db)

    async def get_summary(self) -> SystemHealthSummary:
        counts = await self.svc_dao.count_by_status()
        services = await self.svc_dao.get_all()
        avg_uptime = await self.svc_dao.avg_uptime()
        incidents = await self.incident_dao.count_active()
        healthy = counts.get("healthy", 0)
        degraded = counts.get("degraded", 0)
        down = counts.get("down", 0)
        overall = "healthy"
        if down > 0:
            overall = "critical"
        elif degraded > 0:
            overall = "degraded"
        return SystemHealthSummary(
            total_services=len(services),
            healthy=healthy,
            degraded=degraded,
            down=down,
            overall_status=overall,
            avg_uptime_pct=avg_uptime,
            active_incidents=incidents,
        )

    async def get_services(self):
        return await self.svc_dao.get_all()


class ServiceStatusService:
    def __init__(self, db: AsyncSession):
        self.dao = ServiceRegistryDAO(db)

    async def get_dependency_map(self) -> list[DependencyNode]:
        services = await self.dao.get_all()
        return [
            DependencyNode(
                service_name=s.service_name,
                status=s.status.value,
                depends_on=s.depends_on if isinstance(s.depends_on, list) else [],
            )
            for s in services
        ]

    async def get_service(self, name: str):
        svc = await self.dao.get_by_name(name)
        if not svc:
            raise NotFoundException("Service", name)
        return svc


class ApiMetricsService:
    def __init__(self, db: AsyncSession):
        self.dao = ApiMetricsDAO(db)

    async def get_summary(self) -> ApiMetricsSummary:
        base = await self.dao.get_summary_24h()
        endpoints_raw = await self.dao.get_by_endpoint()
        status_dist = await self.dao.get_status_distribution()
        endpoints = [
            EndpointMetrics(
                endpoint=e["endpoint"],
                method=e["method"],
                total_requests=e["total_requests"],
                avg_response_ms=round(e["avg_response_ms"] or 0, 2),
                p95_response_ms=0,  # simplified
                p99_response_ms=0,
                error_rate=0,
                last_called_at=e["last_called_at"],
            )
            for e in endpoints_raw[:10]
        ]
        return ApiMetricsSummary(
            total_requests_24h=base["total_requests_24h"],
            avg_response_ms=base["avg_response_ms"],
            error_rate_pct=base["error_rate_pct"],
            top_slow_endpoints=endpoints,
            status_code_distribution=status_dist,
        )

    async def get_endpoints(self):
        return await self.dao.get_by_endpoint()

    async def get_latency(self) -> LatencyPercentiles:
        pcts = await self.dao.get_latency_percentiles()
        return LatencyPercentiles(**pcts, period="24h")


class GrafanaService:
    """Returns embedded Grafana dashboard metadata."""

    DASHBOARDS = [
        GrafanaDashboard(uid="afda-system", title="System Overview", url="/grafana/d/afda-system", tags=["system"]),
        GrafanaDashboard(uid="afda-api", title="API Performance", url="/grafana/d/afda-api", tags=["api"]),
        GrafanaDashboard(uid="afda-agents", title="Agent Metrics", url="/grafana/d/afda-agents", tags=["agents"]),
        GrafanaDashboard(uid="afda-db", title="Database Health", url="/grafana/d/afda-db", tags=["database"]),
    ]

    async def list_dashboards(self):
        return self.DASHBOARDS
