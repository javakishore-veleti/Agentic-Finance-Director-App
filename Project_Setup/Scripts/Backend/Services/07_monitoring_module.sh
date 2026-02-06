#!/bin/bash
###############################################################################
# 07_monitoring_module.sh
# Creates: Monitoring module — system health, service status, API metrics, Grafana
# Endpoints: /api/v1/monitoring/*
# Run from: git repo root (Agentic-Finance-Director-App/)
###############################################################################
set -e

MOD="Services/afda-crud-api/app/modules/monitoring"

echo "🔧 [07] Creating Monitoring module..."

# --- models.py ---
cat > "$MOD/models.py" << 'PYEOF'
import uuid
from datetime import datetime
from sqlalchemy import String, Text, Float, Integer, Boolean, DateTime, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.database import Base
import enum


class ServiceHealth(str, enum.Enum):
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    DOWN = "down"
    UNKNOWN = "unknown"


class ServiceRegistry(Base):
    __tablename__ = "service_registry"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    service_name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    display_name: Mapped[str] = mapped_column(String(200), nullable=False)
    service_type: Mapped[str] = mapped_column(String(50), nullable=False)  # api, database, cache, agent_engine, monitoring
    host: Mapped[str] = mapped_column(String(200), nullable=False)
    port: Mapped[int] = mapped_column(Integer, nullable=False)
    health_endpoint: Mapped[str] = mapped_column(String(200), nullable=True)  # /health, /api/v1/health
    status: Mapped[ServiceHealth] = mapped_column(SAEnum(ServiceHealth), default=ServiceHealth.UNKNOWN)
    uptime_pct: Mapped[float] = mapped_column(Float, default=100.0)
    last_check_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    last_error: Mapped[str] = mapped_column(Text, nullable=True)
    depends_on: Mapped[dict] = mapped_column(JSONB, nullable=True)  # ["afda-postgres", "afda-redis"]
    metadata_json: Mapped[dict] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Incident(Base):
    __tablename__ = "incidents"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    service_name: Mapped[str] = mapped_column(String(100), nullable=False)
    severity: Mapped[str] = mapped_column(String(20), default="medium")  # low, medium, high, critical
    status: Mapped[str] = mapped_column(String(20), default="open")  # open, investigating, mitigated, resolved
    description: Mapped[str] = mapped_column(Text, nullable=True)
    root_cause: Mapped[str] = mapped_column(Text, nullable=True)
    resolution: Mapped[str] = mapped_column(Text, nullable=True)
    started_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    resolved_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    duration_minutes: Mapped[int] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ApiMetricsLog(Base):
    __tablename__ = "api_metrics_log"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    endpoint: Mapped[str] = mapped_column(String(300), nullable=False)
    method: Mapped[str] = mapped_column(String(10), nullable=False)
    status_code: Mapped[int] = mapped_column(Integer, nullable=False)
    response_time_ms: Mapped[float] = mapped_column(Float, nullable=False)
    request_size_bytes: Mapped[int] = mapped_column(Integer, default=0)
    response_size_bytes: Mapped[int] = mapped_column(Integer, default=0)
    user_id: Mapped[str] = mapped_column(String(200), nullable=True)
    error_message: Mapped[str] = mapped_column(Text, nullable=True)
    recorded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
PYEOF

# --- dtos.py ---
cat > "$MOD/dtos.py" << 'PYEOF'
from datetime import datetime
from typing import Optional, Dict, Any, List
from uuid import UUID
from pydantic import BaseModel


# ── System Health ──
class ServiceOut(BaseModel):
    id: UUID
    service_name: str
    display_name: str
    service_type: str
    host: str
    port: int
    health_endpoint: Optional[str]
    status: str
    uptime_pct: float
    last_check_at: Optional[datetime]
    last_error: Optional[str]
    depends_on: Optional[Dict[str, Any]]
    metadata_json: Optional[Dict[str, Any]]
    model_config = {"from_attributes": True}


class SystemHealthSummary(BaseModel):
    total_services: int
    healthy: int
    degraded: int
    down: int
    overall_status: str  # healthy, degraded, critical
    avg_uptime_pct: float
    active_incidents: int


# ── Service Dependency ──
class DependencyNode(BaseModel):
    service_name: str
    status: str
    depends_on: List[str]


# ── API Metrics ──
class ApiMetricsOut(BaseModel):
    id: UUID
    endpoint: str
    method: str
    status_code: int
    response_time_ms: float
    recorded_at: datetime
    model_config = {"from_attributes": True}


class EndpointMetrics(BaseModel):
    endpoint: str
    method: str
    total_requests: int
    avg_response_ms: float
    p95_response_ms: float
    p99_response_ms: float
    error_rate: float
    last_called_at: Optional[datetime]


class LatencyPercentiles(BaseModel):
    p50: float
    p75: float
    p90: float
    p95: float
    p99: float
    period: str


class ApiMetricsSummary(BaseModel):
    total_requests_24h: int
    avg_response_ms: float
    error_rate_pct: float
    top_slow_endpoints: List[EndpointMetrics]
    status_code_distribution: Dict[str, int]


# ── Incident ──
class IncidentOut(BaseModel):
    id: UUID
    title: str
    service_name: str
    severity: str
    status: str
    description: Optional[str]
    root_cause: Optional[str]
    resolution: Optional[str]
    started_at: datetime
    resolved_at: Optional[datetime]
    duration_minutes: Optional[int]
    created_at: datetime
    model_config = {"from_attributes": True}


# ── Grafana ──
class GrafanaDashboard(BaseModel):
    uid: str
    title: str
    url: str
    tags: List[str]
PYEOF

# --- dao.py ---
cat > "$MOD/dao.py" << 'PYEOF'
from uuid import UUID
from datetime import datetime, timedelta
from typing import Optional, List
from sqlalchemy import select, func, update, text
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.monitoring.models import ServiceRegistry, Incident, ApiMetricsLog


class ServiceRegistryDAO:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self) -> List[ServiceRegistry]:
        result = await self.db.execute(select(ServiceRegistry).order_by(ServiceRegistry.service_name))
        return list(result.scalars().all())

    async def get_by_name(self, name: str) -> Optional[ServiceRegistry]:
        result = await self.db.execute(
            select(ServiceRegistry).where(ServiceRegistry.service_name == name)
        )
        return result.scalar_one_or_none()

    async def count_by_status(self) -> dict:
        result = await self.db.execute(
            select(ServiceRegistry.status, func.count()).group_by(ServiceRegistry.status)
        )
        return {row[0].value: row[1] for row in result.all()}

    async def avg_uptime(self) -> float:
        result = await self.db.execute(select(func.avg(ServiceRegistry.uptime_pct)))
        return round(result.scalar() or 0, 2)

    async def update_status(self, service_name: str, status: str, error: Optional[str] = None):
        data = {"status": status, "last_check_at": datetime.utcnow(), "last_error": error}
        await self.db.execute(
            update(ServiceRegistry).where(ServiceRegistry.service_name == service_name).values(**data)
        )
        await self.db.commit()


class IncidentDAO:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_active(self) -> List[Incident]:
        result = await self.db.execute(
            select(Incident).where(Incident.status.in_(["open", "investigating", "mitigated"]))
                .order_by(Incident.started_at.desc())
        )
        return list(result.scalars().all())

    async def count_active(self) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(Incident)
                .where(Incident.status.in_(["open", "investigating", "mitigated"]))
        )
        return result.scalar() or 0


class ApiMetricsDAO:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_recent(self, limit: int = 100) -> List[ApiMetricsLog]:
        result = await self.db.execute(
            select(ApiMetricsLog).order_by(ApiMetricsLog.recorded_at.desc()).limit(limit)
        )
        return list(result.scalars().all())

    async def get_summary_24h(self) -> dict:
        cutoff = datetime.utcnow() - timedelta(hours=24)
        total_q = await self.db.execute(
            select(func.count()).select_from(ApiMetricsLog).where(ApiMetricsLog.recorded_at >= cutoff)
        )
        avg_q = await self.db.execute(
            select(func.avg(ApiMetricsLog.response_time_ms)).where(ApiMetricsLog.recorded_at >= cutoff)
        )
        error_q = await self.db.execute(
            select(func.count()).select_from(ApiMetricsLog)
                .where(ApiMetricsLog.recorded_at >= cutoff, ApiMetricsLog.status_code >= 500)
        )
        total = total_q.scalar() or 0
        errors = error_q.scalar() or 0
        return {
            "total_requests_24h": total,
            "avg_response_ms": round(avg_q.scalar() or 0, 2),
            "error_rate_pct": round((errors / total * 100) if total else 0, 2),
        }

    async def get_by_endpoint(self) -> list:
        result = await self.db.execute(
            select(
                ApiMetricsLog.endpoint,
                ApiMetricsLog.method,
                func.count().label("total_requests"),
                func.avg(ApiMetricsLog.response_time_ms).label("avg_response_ms"),
                func.max(ApiMetricsLog.recorded_at).label("last_called_at"),
            )
            .group_by(ApiMetricsLog.endpoint, ApiMetricsLog.method)
            .order_by(func.avg(ApiMetricsLog.response_time_ms).desc())
        )
        return [dict(row._mapping) for row in result.all()]

    async def get_status_distribution(self) -> dict:
        cutoff = datetime.utcnow() - timedelta(hours=24)
        result = await self.db.execute(
            select(ApiMetricsLog.status_code, func.count())
                .where(ApiMetricsLog.recorded_at >= cutoff)
                .group_by(ApiMetricsLog.status_code)
        )
        return {str(row[0]): row[1] for row in result.all()}

    async def get_latency_percentiles(self) -> dict:
        cutoff = datetime.utcnow() - timedelta(hours=24)
        result = await self.db.execute(
            select(ApiMetricsLog.response_time_ms)
                .where(ApiMetricsLog.recorded_at >= cutoff)
                .order_by(ApiMetricsLog.response_time_ms)
        )
        values = [row[0] for row in result.all()]
        if not values:
            return {"p50": 0, "p75": 0, "p90": 0, "p95": 0, "p99": 0}
        n = len(values)
        return {
            "p50": values[int(n * 0.50)] if n else 0,
            "p75": values[int(n * 0.75)] if n else 0,
            "p90": values[int(n * 0.90)] if n else 0,
            "p95": values[min(int(n * 0.95), n - 1)] if n else 0,
            "p99": values[min(int(n * 0.99), n - 1)] if n else 0,
        }
PYEOF

# --- service.py ---
cat > "$MOD/service.py" << 'PYEOF'
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
PYEOF

# --- facade.py ---
cat > "$MOD/facade.py" << 'PYEOF'
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
PYEOF

# --- router.py ---
cat > "$MOD/router.py" << 'PYEOF'
from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.shared.responses import ApiResponse
from app.modules.monitoring.service import (
    SystemHealthService, ServiceStatusService, ApiMetricsService, GrafanaService,
)
from app.modules.monitoring.dtos import (
    ServiceOut, SystemHealthSummary, DependencyNode,
    ApiMetricsSummary, LatencyPercentiles,
    GrafanaDashboard,
)

router = APIRouter()


# ── System Health ──
@router.get("/system-health", response_model=ApiResponse[SystemHealthSummary])
async def system_health(db: AsyncSession = Depends(get_db)):
    svc = SystemHealthService(db)
    summary = await svc.get_summary()
    return ApiResponse(data=summary)


@router.get("/system-health/services", response_model=ApiResponse[list[ServiceOut]])
async def system_services(db: AsyncSession = Depends(get_db)):
    svc = SystemHealthService(db)
    services = await svc.get_services()
    return ApiResponse(data=services)


# ── Service Status ──
@router.get("/service-status", response_model=ApiResponse[list[DependencyNode]])
async def service_dependency_map(db: AsyncSession = Depends(get_db)):
    svc = ServiceStatusService(db)
    deps = await svc.get_dependency_map()
    return ApiResponse(data=deps)


@router.get("/service-status/{name}", response_model=ApiResponse[ServiceOut])
async def service_detail(name: str, db: AsyncSession = Depends(get_db)):
    svc = ServiceStatusService(db)
    service = await svc.get_service(name)
    return ApiResponse(data=service)


# ── API Metrics ──
@router.get("/api-metrics", response_model=ApiResponse[ApiMetricsSummary])
async def api_metrics(db: AsyncSession = Depends(get_db)):
    svc = ApiMetricsService(db)
    summary = await svc.get_summary()
    return ApiResponse(data=summary)


@router.get("/api-metrics/endpoints")
async def api_metrics_endpoints(db: AsyncSession = Depends(get_db)):
    svc = ApiMetricsService(db)
    endpoints = await svc.get_endpoints()
    return ApiResponse(data=endpoints)


@router.get("/api-metrics/latency", response_model=ApiResponse[LatencyPercentiles])
async def api_latency(db: AsyncSession = Depends(get_db)):
    svc = ApiMetricsService(db)
    latency = await svc.get_latency()
    return ApiResponse(data=latency)


# ── Grafana ──
@router.get("/grafana/dashboards", response_model=ApiResponse[list[GrafanaDashboard]])
async def grafana_dashboards():
    svc = GrafanaService()
    dashboards = await svc.list_dashboards()
    return ApiResponse(data=dashboards)
PYEOF

echo "✅ [07] Monitoring module created at $MOD"
echo "    → models.py  — ServiceRegistry, Incident, ApiMetricsLog"
echo "    → dtos.py    — 10 schemas (SystemHealthSummary, EndpointMetrics, LatencyPercentiles, GrafanaDashboard)"
echo "    → dao.py     — ServiceRegistryDAO, IncidentDAO, ApiMetricsDAO (24h aggregation, percentiles)"
echo "    → service.py — Health summary, dependency map, API metrics + percentiles, Grafana metadata"
echo "    → facade.py  — MonitoringFacade"
echo "    → router.py  — 8 endpoints under /api/v1/monitoring"
echo ""
echo "   ⚡ Uncomment monitoring router in main.py to activate"
echo "   Next: Run 08_admin_module.sh"
