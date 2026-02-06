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
