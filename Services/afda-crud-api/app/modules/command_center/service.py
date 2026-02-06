from uuid import UUID
from typing import Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.command_center.dao import KpiDAO, BriefingDAO, ActionItemDAO
from app.modules.command_center.dtos import KpiCreate, KpiUpdate, ActionItemCreate, ActionItemUpdate
from app.shared.exceptions import NotFoundException


class KpiService:
    def __init__(self, db: AsyncSession):
        self.dao = KpiDAO(db)

    async def list_kpis(self, is_active: Optional[bool] = True):
        return await self.dao.get_all(is_active)

    async def get_kpi(self, kpi_id: UUID):
        kpi = await self.dao.get_by_id(kpi_id)
        if not kpi:
            raise NotFoundException("KPI", kpi_id)
        return kpi

    async def create_kpi(self, data: KpiCreate):
        return await self.dao.create(data.model_dump())

    async def update_kpi(self, kpi_id: UUID, data: KpiUpdate):
        existing = await self.dao.get_by_id(kpi_id)
        if not existing:
            raise NotFoundException("KPI", kpi_id)
        update_data = data.model_dump(exclude_unset=True)
        # Auto-calculate trend
        if "current_value" in update_data and existing.previous_value is not None:
            new_val = update_data["current_value"]
            if new_val > existing.previous_value:
                update_data["trend_direction"] = "up"
            elif new_val < existing.previous_value:
                update_data["trend_direction"] = "down"
            else:
                update_data["trend_direction"] = "flat"
        return await self.dao.update(kpi_id, update_data)


class BriefingService:
    def __init__(self, db: AsyncSession):
        self.dao = BriefingDAO(db)

    async def list_briefings(self):
        return await self.dao.get_all()

    async def get_latest(self):
        briefing = await self.dao.get_latest()
        if not briefing:
            raise NotFoundException("Executive Briefing")
        return briefing

    async def generate_briefing(self, period: str):
        # Placeholder — in production, AGT-001 (Executive Briefing Agent) generates this
        data = {
            "title": f"Executive Briefing — {period}",
            "summary": f"AI-generated briefing for {period}. Placeholder until agent integration.",
            "key_insights": '["Revenue trending 5% above target","Operating costs reduced by 3%"]',
            "risk_highlights": '["Cash flow tightening in Q2","FX exposure increasing"]',
            "generated_by": "AGT-001",
            "period": period,
        }
        return await self.dao.create(data)


class ActionItemService:
    def __init__(self, db: AsyncSession):
        self.dao = ActionItemDAO(db)

    async def list_items(self, status=None, priority=None, limit=50, offset=0):
        return await self.dao.get_all(status, priority, limit, offset)

    async def get_item(self, item_id: UUID):
        item = await self.dao.get_by_id(item_id)
        if not item:
            raise NotFoundException("Action Item", item_id)
        return item

    async def create_item(self, data: ActionItemCreate):
        return await self.dao.create(data.model_dump())

    async def update_item(self, item_id: UUID, data: ActionItemUpdate):
        existing = await self.dao.get_by_id(item_id)
        if not existing:
            raise NotFoundException("Action Item", item_id)
        update_data = data.model_dump(exclude_unset=True)
        if update_data.get("status") == "completed":
            update_data["completed_at"] = datetime.utcnow()
        return await self.dao.update(item_id, update_data)

    async def delete_item(self, item_id: UUID):
        success = await self.dao.delete(item_id)
        if not success:
            raise NotFoundException("Action Item", item_id)
        return True

    async def get_summary(self):
        return await self.dao.summary()
