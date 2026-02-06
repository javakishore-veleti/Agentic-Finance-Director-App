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
