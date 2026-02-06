from datetime import datetime
from typing import Optional, Dict, Any, List
from uuid import UUID
from pydantic import BaseModel, Field


# ── Alert ──
class AlertOut(BaseModel):
    id: UUID
    title: str
    description: Optional[str]
    severity: str
    status: str
    category: str
    source_agent: Optional[str]
    rule_id: Optional[UUID]
    affected_entity: Optional[str]
    metadata_json: Optional[Dict[str, Any]]
    acknowledged_by: Optional[str]
    acknowledged_at: Optional[datetime]
    resolved_by: Optional[str]
    resolved_at: Optional[datetime]
    resolution_notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


class AlertAcknowledge(BaseModel):
    acknowledged_by: str


class AlertResolve(BaseModel):
    resolved_by: str
    resolution_notes: Optional[str] = None


# ── Alert Rule ──
class AlertRuleCreate(BaseModel):
    name: str = Field(..., max_length=200)
    description: Optional[str] = None
    category: str = "financial"
    severity: str = "medium"
    condition_type: str  # threshold, anomaly, pattern, composite
    condition_config: Dict[str, Any]  # e.g. {"metric": "cash_balance", "operator": "<", "value": 100000}
    cooldown_minutes: int = 60


class AlertRuleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[str] = None
    condition_config: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None
    cooldown_minutes: Optional[int] = None


class AlertRuleOut(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    category: str
    severity: str
    condition_type: str
    condition_config: Dict[str, Any]
    is_active: bool
    cooldown_minutes: int
    last_triggered_at: Optional[datetime]
    trigger_count: int
    created_at: datetime
    model_config = {"from_attributes": True}


# ── Risk Dashboard ──
class RiskScoreOut(BaseModel):
    id: UUID
    entity_type: str
    entity_name: str
    overall_score: float
    financial_risk: float
    operational_risk: float
    compliance_risk: float
    trend: str
    factors_json: Optional[Dict[str, Any]]
    scored_by: str
    scored_at: datetime
    model_config = {"from_attributes": True}


class RiskHeatmapItem(BaseModel):
    entity_name: str
    category: str
    score: float
    severity: str  # derived from score


class RiskDashboardData(BaseModel):
    total_open_alerts: int
    critical_alerts: int
    high_alerts: int
    avg_risk_score: float
    top_risks: List[RiskScoreOut]
    alert_trend_7d: List[Dict[str, Any]]


# ── History ──
class AlertHistoryOut(BaseModel):
    id: UUID
    alert_id: UUID
    action: str
    performed_by: Optional[str]
    details: Optional[str]
    created_at: datetime
    model_config = {"from_attributes": True}


class AlertTrend(BaseModel):
    period: str
    total: int
    critical: int
    high: int
    medium: int
    low: int
