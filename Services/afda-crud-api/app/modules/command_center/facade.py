from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.command_center.service import KpiService, BriefingService, ActionItemService
from app.modules.command_center.dtos import OverviewStats


class CommandCenterFacade:
    def __init__(self, db: AsyncSession):
        self.kpi_service = KpiService(db)
        self.briefing_service = BriefingService(db)
        self.action_service = ActionItemService(db)

    async def get_overview(self) -> OverviewStats:
        kpis = await self.kpi_service.list_kpis(is_active=True)
        on_track = sum(1 for k in kpis if k.status.value == "on_track")
        at_risk = sum(1 for k in kpis if k.status.value == "at_risk")
        off_track = sum(1 for k in kpis if k.status.value == "off_track")

        open_items = await self.action_service.dao.count(status="open")
        critical_items = await self.action_service.dao.count(status=None)  # will refine

        try:
            latest = await self.briefing_service.get_latest()
            latest_date = latest.created_at
        except Exception:
            latest_date = None

        return OverviewStats(
            total_kpis=len(kpis),
            on_track=on_track,
            at_risk=at_risk,
            off_track=off_track,
            open_action_items=open_items,
            critical_action_items=critical_items,
            latest_briefing_date=latest_date,
        )
