from uuid import UUID
from typing import Optional, List
from sqlalchemy import select, func, update, delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.command_center.models import (
    KpiDefinition, KpiValue, ExecutiveBriefing, ActionItem,
    KpiStatus, ActionItemStatus, ActionItemPriority,
)


class KpiDAO:
    def __init__(self, db: AsyncSession, org_id=None):
        self.db = db
        self.org_id = org_id

    async def get_all(self, is_active: Optional[bool] = True) -> List[KpiDefinition]:
        q = select(KpiDefinition)
        if is_active is not None:
            q = q.where(KpiDefinition.is_active == is_active)
        result = await self.db.execute(q.order_by(KpiDefinition.category, KpiDefinition.name))
        return list(result.scalars().all())

    async def get_by_id(self, kpi_id: UUID) -> Optional[KpiDefinition]:
        result = await self.db.execute(select(KpiDefinition).where(KpiDefinition.id == kpi_id))
        return result.scalar_one_or_none()

    async def create(self, data: dict) -> KpiDefinition:
        kpi = KpiDefinition(**data)
        self.db.add(kpi)
        await self.db.commit()
        await self.db.refresh(kpi)
        return kpi

    async def update(self, kpi_id: UUID, data: dict) -> Optional[KpiDefinition]:
        await self.db.execute(update(KpiDefinition).where(KpiDefinition.id == kpi_id).values(**data))
        await self.db.commit()
        return await self.get_by_id(kpi_id)

    async def count_by_status(self) -> dict:
        result = await self.db.execute(
            select(KpiDefinition.status, func.count()).where(KpiDefinition.is_active == True).group_by(KpiDefinition.status)
        )
        return {row[0]: row[1] for row in result.all()}


class BriefingDAO:
    def __init__(self, db: AsyncSession, org_id=None):
        self.db = db
        self.org_id = org_id

    async def get_all(self, limit: int = 20) -> List[ExecutiveBriefing]:
        result = await self.db.execute(
            select(ExecutiveBriefing).order_by(ExecutiveBriefing.created_at.desc()).limit(limit)
        )
        return list(result.scalars().all())

    async def get_latest(self) -> Optional[ExecutiveBriefing]:
        result = await self.db.execute(
            select(ExecutiveBriefing).where(ExecutiveBriefing.is_latest == True).limit(1)
        )
        return result.scalar_one_or_none()

    async def create(self, data: dict) -> ExecutiveBriefing:
        # Mark old ones as not latest
        await self.db.execute(
            update(ExecutiveBriefing).where(ExecutiveBriefing.is_latest == True).values(is_latest=False)
        )
        briefing = ExecutiveBriefing(**data, is_latest=True)
        self.db.add(briefing)
        await self.db.commit()
        await self.db.refresh(briefing)
        return briefing


class ActionItemDAO:
    def __init__(self, db: AsyncSession, org_id=None):
        self.db = db
        self.org_id = org_id

    async def get_all(self, status: Optional[str] = None, priority: Optional[str] = None,
                      limit: int = 50, offset: int = 0) -> List[ActionItem]:
        q = select(ActionItem)
        if status:
            q = q.where(ActionItem.status == status)
        if priority:
            q = q.where(ActionItem.priority == priority)
        result = await self.db.execute(q.order_by(ActionItem.created_at.desc()).offset(offset).limit(limit))
        return list(result.scalars().all())

    async def count(self, status: Optional[str] = None) -> int:
        q = select(func.count()).select_from(ActionItem)
        if status:
            q = q.where(ActionItem.status == status)
        result = await self.db.execute(q)
        return result.scalar()

    async def get_by_id(self, item_id: UUID) -> Optional[ActionItem]:
        result = await self.db.execute(select(ActionItem).where(ActionItem.id == item_id))
        return result.scalar_one_or_none()

    async def create(self, data: dict) -> ActionItem:
        item = ActionItem(**data)
        self.db.add(item)
        await self.db.commit()
        await self.db.refresh(item)
        return item

    async def update(self, item_id: UUID, data: dict) -> Optional[ActionItem]:
        await self.db.execute(update(ActionItem).where(ActionItem.id == item_id).values(**data))
        await self.db.commit()
        return await self.get_by_id(item_id)

    async def delete(self, item_id: UUID) -> bool:
        result = await self.db.execute(delete(ActionItem).where(ActionItem.id == item_id))
        await self.db.commit()
        return result.rowcount > 0

    async def summary(self) -> dict:
        status_q = await self.db.execute(
            select(ActionItem.status, func.count()).group_by(ActionItem.status)
        )
        priority_q = await self.db.execute(
            select(ActionItem.priority, func.count()).group_by(ActionItem.priority)
        )
        return {
            "by_status": {row[0]: row[1] for row in status_q.all()},
            "by_priority": {row[0]: row[1] for row in priority_q.all()},
        }
