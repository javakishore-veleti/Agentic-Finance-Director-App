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
