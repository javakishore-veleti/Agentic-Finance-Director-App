#!/bin/bash
###############################################################################
# 06_risk_module.sh
# Creates: Risk Intelligence module — alerts, rules, dashboard, history
# Endpoints: /api/v1/risk/*
# Run from: git repo root (Agentic-Finance-Director-App/)
###############################################################################
set -e

MOD="Services/afda-crud-api/app/modules/risk"

echo "🔧 [06] Creating Risk Intelligence module..."

# --- models.py ---
cat > "$MOD/models.py" << 'PYEOF'
import uuid
from datetime import datetime
from sqlalchemy import String, Text, Float, Integer, Boolean, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.database import Base
import enum


class AlertSeverity(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class AlertStatus(str, enum.Enum):
    OPEN = "open"
    ACKNOWLEDGED = "acknowledged"
    INVESTIGATING = "investigating"
    RESOLVED = "resolved"
    FALSE_POSITIVE = "false_positive"


class AlertCategory(str, enum.Enum):
    FINANCIAL = "financial"
    COMPLIANCE = "compliance"
    OPERATIONAL = "operational"
    SECURITY = "security"
    FRAUD = "fraud"


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    severity: Mapped[AlertSeverity] = mapped_column(SAEnum(AlertSeverity), default=AlertSeverity.MEDIUM)
    status: Mapped[AlertStatus] = mapped_column(SAEnum(AlertStatus), default=AlertStatus.OPEN)
    category: Mapped[AlertCategory] = mapped_column(SAEnum(AlertCategory), default=AlertCategory.FINANCIAL)
    source_agent: Mapped[str] = mapped_column(String(50), nullable=True)
    rule_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=True)
    affected_entity: Mapped[str] = mapped_column(String(200), nullable=True)
    metadata_json: Mapped[dict] = mapped_column(JSONB, nullable=True)
    acknowledged_by: Mapped[str] = mapped_column(String(200), nullable=True)
    acknowledged_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    resolved_by: Mapped[str] = mapped_column(String(200), nullable=True)
    resolved_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    resolution_notes: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class AlertRule(Base):
    __tablename__ = "alert_rules"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    category: Mapped[AlertCategory] = mapped_column(SAEnum(AlertCategory), default=AlertCategory.FINANCIAL)
    severity: Mapped[AlertSeverity] = mapped_column(SAEnum(AlertSeverity), default=AlertSeverity.MEDIUM)
    condition_type: Mapped[str] = mapped_column(String(50), nullable=False)  # threshold, anomaly, pattern, composite
    condition_config: Mapped[dict] = mapped_column(JSONB, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    cooldown_minutes: Mapped[int] = mapped_column(Integer, default=60)
    last_triggered_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    trigger_count: Mapped[int] = mapped_column(Integer, default=0)
    created_by: Mapped[str] = mapped_column(String(200), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class RiskScore(Base):
    __tablename__ = "risk_scores"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)  # department, vendor, process, portfolio
    entity_name: Mapped[str] = mapped_column(String(200), nullable=False)
    overall_score: Mapped[float] = mapped_column(Float, nullable=False)  # 0-100
    financial_risk: Mapped[float] = mapped_column(Float, default=0.0)
    operational_risk: Mapped[float] = mapped_column(Float, default=0.0)
    compliance_risk: Mapped[float] = mapped_column(Float, default=0.0)
    trend: Mapped[str] = mapped_column(String(20), default="stable")  # improving, stable, deteriorating
    factors_json: Mapped[dict] = mapped_column(JSONB, nullable=True)
    scored_by: Mapped[str] = mapped_column(String(50), default="AGT-071")
    scored_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class AlertHistory(Base):
    __tablename__ = "alert_history"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    alert_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    action: Mapped[str] = mapped_column(String(50), nullable=False)  # created, acknowledged, escalated, resolved
    performed_by: Mapped[str] = mapped_column(String(200), nullable=True)
    details: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
PYEOF

# --- dtos.py ---
cat > "$MOD/dtos.py" << 'PYEOF'
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
PYEOF

# --- dao.py ---
cat > "$MOD/dao.py" << 'PYEOF'
from uuid import UUID
from typing import Optional, List
from sqlalchemy import select, func, update, delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.risk.models import Alert, AlertRule, RiskScore, AlertHistory, AlertSeverity, AlertStatus


class AlertDAO:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self, severity: Optional[str] = None, status: Optional[str] = None,
                      category: Optional[str] = None, limit: int = 50, offset: int = 0) -> List[Alert]:
        q = select(Alert)
        if severity:
            q = q.where(Alert.severity == severity)
        if status:
            q = q.where(Alert.status == status)
        if category:
            q = q.where(Alert.category == category)
        result = await self.db.execute(q.order_by(Alert.created_at.desc()).offset(offset).limit(limit))
        return list(result.scalars().all())

    async def get_by_id(self, alert_id: UUID) -> Optional[Alert]:
        result = await self.db.execute(select(Alert).where(Alert.id == alert_id))
        return result.scalar_one_or_none()

    async def update(self, alert_id: UUID, data: dict) -> Optional[Alert]:
        await self.db.execute(update(Alert).where(Alert.id == alert_id).values(**data))
        await self.db.commit()
        return await self.get_by_id(alert_id)

    async def count_by_severity(self, status: str = "open") -> dict:
        result = await self.db.execute(
            select(Alert.severity, func.count())
                .where(Alert.status == status)
                .group_by(Alert.severity)
        )
        return {row[0].value: row[1] for row in result.all()}

    async def count_open(self) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(Alert)
                .where(Alert.status.in_(["open", "acknowledged", "investigating"]))
        )
        return result.scalar() or 0


class AlertRuleDAO:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self, is_active: Optional[bool] = None) -> List[AlertRule]:
        q = select(AlertRule)
        if is_active is not None:
            q = q.where(AlertRule.is_active == is_active)
        result = await self.db.execute(q.order_by(AlertRule.name))
        return list(result.scalars().all())

    async def get_by_id(self, rule_id: UUID) -> Optional[AlertRule]:
        result = await self.db.execute(select(AlertRule).where(AlertRule.id == rule_id))
        return result.scalar_one_or_none()

    async def create(self, data: dict) -> AlertRule:
        rule = AlertRule(**data)
        self.db.add(rule)
        await self.db.commit()
        await self.db.refresh(rule)
        return rule

    async def update(self, rule_id: UUID, data: dict) -> Optional[AlertRule]:
        await self.db.execute(update(AlertRule).where(AlertRule.id == rule_id).values(**data))
        await self.db.commit()
        return await self.get_by_id(rule_id)

    async def delete(self, rule_id: UUID) -> bool:
        result = await self.db.execute(delete(AlertRule).where(AlertRule.id == rule_id))
        await self.db.commit()
        return result.rowcount > 0


class RiskScoreDAO:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self, entity_type: Optional[str] = None) -> List[RiskScore]:
        q = select(RiskScore)
        if entity_type:
            q = q.where(RiskScore.entity_type == entity_type)
        result = await self.db.execute(q.order_by(RiskScore.overall_score.desc()))
        return list(result.scalars().all())

    async def get_top(self, limit: int = 5) -> List[RiskScore]:
        result = await self.db.execute(
            select(RiskScore).order_by(RiskScore.overall_score.desc()).limit(limit)
        )
        return list(result.scalars().all())

    async def avg_score(self) -> float:
        result = await self.db.execute(select(func.avg(RiskScore.overall_score)))
        return round(result.scalar() or 0, 2)


class AlertHistoryDAO:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_alert(self, alert_id: UUID) -> List[AlertHistory]:
        result = await self.db.execute(
            select(AlertHistory).where(AlertHistory.alert_id == alert_id)
                .order_by(AlertHistory.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_all(self, limit: int = 100, offset: int = 0) -> List[AlertHistory]:
        result = await self.db.execute(
            select(AlertHistory).order_by(AlertHistory.created_at.desc()).offset(offset).limit(limit)
        )
        return list(result.scalars().all())

    async def create(self, data: dict) -> AlertHistory:
        entry = AlertHistory(**data)
        self.db.add(entry)
        await self.db.commit()
        await self.db.refresh(entry)
        return entry
PYEOF

# --- service.py ---
cat > "$MOD/service.py" << 'PYEOF'
from uuid import UUID
from datetime import datetime
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.risk.dao import AlertDAO, AlertRuleDAO, RiskScoreDAO, AlertHistoryDAO
from app.modules.risk.dtos import (
    AlertAcknowledge, AlertResolve, AlertRuleCreate, AlertRuleUpdate, RiskDashboardData,
)
from app.shared.exceptions import NotFoundException


class AlertService:
    def __init__(self, db: AsyncSession):
        self.dao = AlertDAO(db)
        self.history_dao = AlertHistoryDAO(db)

    async def list_alerts(self, severity=None, status=None, category=None, limit=50, offset=0):
        return await self.dao.get_all(severity, status, category, limit, offset)

    async def get_alert(self, alert_id: UUID):
        alert = await self.dao.get_by_id(alert_id)
        if not alert:
            raise NotFoundException("Alert", alert_id)
        return alert

    async def acknowledge(self, alert_id: UUID, data: AlertAcknowledge):
        alert = await self.dao.get_by_id(alert_id)
        if not alert:
            raise NotFoundException("Alert", alert_id)
        updated = await self.dao.update(alert_id, {
            "status": "acknowledged",
            "acknowledged_by": data.acknowledged_by,
            "acknowledged_at": datetime.utcnow(),
        })
        await self.history_dao.create({
            "alert_id": alert_id,
            "action": "acknowledged",
            "performed_by": data.acknowledged_by,
        })
        return updated

    async def resolve(self, alert_id: UUID, data: AlertResolve):
        alert = await self.dao.get_by_id(alert_id)
        if not alert:
            raise NotFoundException("Alert", alert_id)
        updated = await self.dao.update(alert_id, {
            "status": "resolved",
            "resolved_by": data.resolved_by,
            "resolved_at": datetime.utcnow(),
            "resolution_notes": data.resolution_notes,
        })
        await self.history_dao.create({
            "alert_id": alert_id,
            "action": "resolved",
            "performed_by": data.resolved_by,
            "details": data.resolution_notes,
        })
        return updated


class AlertRuleService:
    def __init__(self, db: AsyncSession):
        self.dao = AlertRuleDAO(db)

    async def list_rules(self, is_active=None):
        return await self.dao.get_all(is_active)

    async def create_rule(self, data: AlertRuleCreate):
        return await self.dao.create(data.model_dump())

    async def update_rule(self, rule_id: UUID, data: AlertRuleUpdate):
        existing = await self.dao.get_by_id(rule_id)
        if not existing:
            raise NotFoundException("Alert Rule", rule_id)
        return await self.dao.update(rule_id, data.model_dump(exclude_unset=True))

    async def delete_rule(self, rule_id: UUID):
        success = await self.dao.delete(rule_id)
        if not success:
            raise NotFoundException("Alert Rule", rule_id)
        return True


class RiskDashboardService:
    def __init__(self, db: AsyncSession):
        self.alert_dao = AlertDAO(db)
        self.score_dao = RiskScoreDAO(db)

    async def get_dashboard(self) -> RiskDashboardData:
        open_count = await self.alert_dao.count_open()
        severity_counts = await self.alert_dao.count_by_severity()
        avg_score = await self.score_dao.avg_score()
        top_risks = await self.score_dao.get_top(5)
        return RiskDashboardData(
            total_open_alerts=open_count,
            critical_alerts=severity_counts.get("critical", 0),
            high_alerts=severity_counts.get("high", 0),
            avg_risk_score=avg_score,
            top_risks=top_risks,
            alert_trend_7d=[],  # Placeholder — AGT-075 computes trends
        )

    async def get_heatmap(self):
        scores = await self.score_dao.get_all()
        heatmap = []
        for s in scores:
            severity = "critical" if s.overall_score >= 80 else "high" if s.overall_score >= 60 else "medium" if s.overall_score >= 40 else "low"
            heatmap.append({
                "entity_name": s.entity_name,
                "category": s.entity_type,
                "score": s.overall_score,
                "severity": severity,
            })
        return heatmap

    async def get_scores(self, entity_type=None):
        return await self.score_dao.get_all(entity_type)


class AlertHistoryService:
    def __init__(self, db: AsyncSession):
        self.dao = AlertHistoryDAO(db)

    async def get_history(self, limit=100, offset=0):
        return await self.dao.get_all(limit, offset)

    async def get_alert_history(self, alert_id: UUID):
        return await self.dao.get_by_alert(alert_id)
PYEOF

# --- facade.py ---
cat > "$MOD/facade.py" << 'PYEOF'
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.risk.service import AlertService, AlertRuleService, RiskDashboardService, AlertHistoryService


class RiskFacade:
    def __init__(self, db: AsyncSession):
        self.alert_svc = AlertService(db)
        self.rule_svc = AlertRuleService(db)
        self.dashboard_svc = RiskDashboardService(db)
        self.history_svc = AlertHistoryService(db)
PYEOF

# --- router.py ---
cat > "$MOD/router.py" << 'PYEOF'
from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.shared.responses import ApiResponse
from app.modules.risk.service import (
    AlertService, AlertRuleService, RiskDashboardService, AlertHistoryService,
)
from app.modules.risk.dtos import (
    AlertOut, AlertAcknowledge, AlertResolve,
    AlertRuleCreate, AlertRuleUpdate, AlertRuleOut,
    RiskScoreOut, RiskDashboardData,
    AlertHistoryOut,
)

router = APIRouter()


# ── Alerts ──
@router.get("/alerts", response_model=ApiResponse[list[AlertOut]])
async def list_alerts(
    severity: Optional[str] = None,
    status: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    svc = AlertService(db)
    alerts = await svc.list_alerts(severity, status, category, limit, offset)
    return ApiResponse(data=alerts)


@router.get("/alerts/{alert_id}", response_model=ApiResponse[AlertOut])
async def get_alert(alert_id: UUID, db: AsyncSession = Depends(get_db)):
    svc = AlertService(db)
    alert = await svc.get_alert(alert_id)
    return ApiResponse(data=alert)


@router.put("/alerts/{alert_id}/acknowledge", response_model=ApiResponse[AlertOut])
async def acknowledge_alert(alert_id: UUID, data: AlertAcknowledge, db: AsyncSession = Depends(get_db)):
    svc = AlertService(db)
    alert = await svc.acknowledge(alert_id, data)
    return ApiResponse(data=alert, message="Alert acknowledged")


@router.put("/alerts/{alert_id}/resolve", response_model=ApiResponse[AlertOut])
async def resolve_alert(alert_id: UUID, data: AlertResolve, db: AsyncSession = Depends(get_db)):
    svc = AlertService(db)
    alert = await svc.resolve(alert_id, data)
    return ApiResponse(data=alert, message="Alert resolved")


# ── Dashboard ──
@router.get("/dashboard", response_model=ApiResponse[RiskDashboardData])
async def risk_dashboard(db: AsyncSession = Depends(get_db)):
    svc = RiskDashboardService(db)
    data = await svc.get_dashboard()
    return ApiResponse(data=data)


@router.get("/dashboard/heatmap")
async def risk_heatmap(db: AsyncSession = Depends(get_db)):
    svc = RiskDashboardService(db)
    heatmap = await svc.get_heatmap()
    return ApiResponse(data=heatmap)


@router.get("/dashboard/scores", response_model=ApiResponse[list[RiskScoreOut]])
async def risk_scores(entity_type: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    svc = RiskDashboardService(db)
    scores = await svc.get_scores(entity_type)
    return ApiResponse(data=scores)


# ── Rules ──
@router.get("/rules", response_model=ApiResponse[list[AlertRuleOut]])
async def list_rules(is_active: Optional[bool] = None, db: AsyncSession = Depends(get_db)):
    svc = AlertRuleService(db)
    rules = await svc.list_rules(is_active)
    return ApiResponse(data=rules)


@router.post("/rules", response_model=ApiResponse[AlertRuleOut], status_code=201)
async def create_rule(data: AlertRuleCreate, db: AsyncSession = Depends(get_db)):
    svc = AlertRuleService(db)
    rule = await svc.create_rule(data)
    return ApiResponse(data=rule, message="Rule created")


@router.put("/rules/{rule_id}", response_model=ApiResponse[AlertRuleOut])
async def update_rule(rule_id: UUID, data: AlertRuleUpdate, db: AsyncSession = Depends(get_db)):
    svc = AlertRuleService(db)
    rule = await svc.update_rule(rule_id, data)
    return ApiResponse(data=rule, message="Rule updated")


@router.delete("/rules/{rule_id}")
async def delete_rule(rule_id: UUID, db: AsyncSession = Depends(get_db)):
    svc = AlertRuleService(db)
    await svc.delete_rule(rule_id)
    return ApiResponse(message="Rule deleted")


# ── History ──
@router.get("/history", response_model=ApiResponse[list[AlertHistoryOut]])
async def alert_history(
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    svc = AlertHistoryService(db)
    history = await svc.get_history(limit, offset)
    return ApiResponse(data=history)


@router.get("/history/{alert_id}", response_model=ApiResponse[list[AlertHistoryOut]])
async def alert_timeline(alert_id: UUID, db: AsyncSession = Depends(get_db)):
    svc = AlertHistoryService(db)
    history = await svc.get_alert_history(alert_id)
    return ApiResponse(data=history)
PYEOF

echo "✅ [06] Risk Intelligence module created at $MOD"
echo "    → models.py  — Alert, AlertRule, RiskScore, AlertHistory (JSONB for configs)"
echo "    → dtos.py    — 12 Pydantic schemas (dashboard, heatmap, trend)"
echo "    → dao.py     — AlertDAO, AlertRuleDAO, RiskScoreDAO, AlertHistoryDAO"
echo "    → service.py — Alert lifecycle (acknowledge/resolve + history), dashboard aggregation, heatmap"
echo "    → facade.py  — RiskFacade"
echo "    → router.py  — 15 endpoints under /api/v1/risk"
echo ""
echo "   ⚡ Uncomment risk router in main.py to activate"
echo "   Next: Run 07_monitoring_module.sh"
