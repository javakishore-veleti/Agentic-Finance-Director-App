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
