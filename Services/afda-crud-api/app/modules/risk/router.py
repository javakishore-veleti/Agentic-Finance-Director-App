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
