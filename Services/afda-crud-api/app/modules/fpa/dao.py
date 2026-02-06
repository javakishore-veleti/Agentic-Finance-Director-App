from uuid import UUID
from typing import Optional, List
from sqlalchemy import select, func, update, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.modules.fpa.models import (
    Budget, BudgetLineItem, VarianceRecord, FluxCommentary, Forecast, FpaReport,
)


class BudgetDAO:
    def __init__(self, db: AsyncSession, org_id=None):
        self.db = db
        self.org_id = org_id

    async def get_all(self, fiscal_year: Optional[int] = None, department: Optional[str] = None,
                      limit: int = 50, offset: int = 0) -> List[Budget]:
        q = select(Budget)
        if fiscal_year:
            q = q.where(Budget.fiscal_year == fiscal_year)
        if department:
            q = q.where(Budget.department == department)
        result = await self.db.execute(q.order_by(Budget.created_at.desc()).offset(offset).limit(limit))
        return list(result.scalars().all())

    async def get_by_id(self, budget_id: UUID) -> Optional[Budget]:
        result = await self.db.execute(
            select(Budget).options(selectinload(Budget.line_items)).where(Budget.id == budget_id)
        )
        return result.scalar_one_or_none()

    async def create(self, data: dict) -> Budget:
        budget = Budget(**data)
        self.db.add(budget)
        await self.db.commit()
        await self.db.refresh(budget)
        return budget

    async def update(self, budget_id: UUID, data: dict) -> Optional[Budget]:
        await self.db.execute(update(Budget).where(Budget.id == budget_id).values(**data))
        await self.db.commit()
        return await self.get_by_id(budget_id)

    async def get_vs_actual(self, budget_id: UUID) -> List[BudgetLineItem]:
        result = await self.db.execute(
            select(BudgetLineItem).where(BudgetLineItem.budget_id == budget_id)
                .order_by(BudgetLineItem.period, BudgetLineItem.account_code)
        )
        return list(result.scalars().all())


class VarianceDAO:
    def __init__(self, db: AsyncSession, org_id=None):
        self.db = db
        self.org_id = org_id

    async def get_all(self, period: Optional[str] = None, department: Optional[str] = None) -> List[VarianceRecord]:
        q = select(VarianceRecord)
        if period:
            q = q.where(VarianceRecord.period == period)
        if department:
            q = q.where(VarianceRecord.department == department)
        result = await self.db.execute(q.order_by(VarianceRecord.variance_amount.desc()))
        return list(result.scalars().all())

    async def get_by_department(self, period: Optional[str] = None) -> list:
        q = select(
            VarianceRecord.department,
            func.sum(VarianceRecord.budgeted).label("total_budgeted"),
            func.sum(VarianceRecord.actual).label("total_actual"),
            func.sum(VarianceRecord.variance_amount).label("total_variance"),
        ).group_by(VarianceRecord.department)
        if period:
            q = q.where(VarianceRecord.period == period)
        result = await self.db.execute(q)
        return [dict(row._mapping) for row in result.all()]

    async def get_by_account(self, period: Optional[str] = None) -> list:
        q = select(
            VarianceRecord.account_code,
            VarianceRecord.account_name,
            func.sum(VarianceRecord.budgeted).label("total_budgeted"),
            func.sum(VarianceRecord.actual).label("total_actual"),
            func.sum(VarianceRecord.variance_amount).label("total_variance"),
        ).group_by(VarianceRecord.account_code, VarianceRecord.account_name)
        if period:
            q = q.where(VarianceRecord.period == period)
        result = await self.db.execute(q)
        return [dict(row._mapping) for row in result.all()]


class FluxDAO:
    def __init__(self, db: AsyncSession, org_id=None):
        self.db = db
        self.org_id = org_id

    async def get_all(self, period: Optional[str] = None, limit: int = 50) -> List[FluxCommentary]:
        q = select(FluxCommentary)
        if period:
            q = q.where(FluxCommentary.period == period)
        result = await self.db.execute(q.order_by(FluxCommentary.created_at.desc()).limit(limit))
        return list(result.scalars().all())

    async def create(self, data: dict) -> FluxCommentary:
        flux = FluxCommentary(**data)
        self.db.add(flux)
        await self.db.commit()
        await self.db.refresh(flux)
        return flux


class ForecastDAO:
    def __init__(self, db: AsyncSession, org_id=None):
        self.db = db
        self.org_id = org_id

    async def get_all(self, fiscal_year: Optional[int] = None, forecast_type: Optional[str] = None) -> List[Forecast]:
        q = select(Forecast)
        if fiscal_year:
            q = q.where(Forecast.fiscal_year == fiscal_year)
        if forecast_type:
            q = q.where(Forecast.forecast_type == forecast_type)
        result = await self.db.execute(q.order_by(Forecast.created_at.desc()))
        return list(result.scalars().all())

    async def get_by_id(self, forecast_id: UUID) -> Optional[Forecast]:
        result = await self.db.execute(select(Forecast).where(Forecast.id == forecast_id))
        return result.scalar_one_or_none()

    async def create(self, data: dict) -> Forecast:
        forecast = Forecast(**data)
        self.db.add(forecast)
        await self.db.commit()
        await self.db.refresh(forecast)
        return forecast

    async def get_scenarios(self, forecast_id: UUID) -> List[Forecast]:
        base = await self.get_by_id(forecast_id)
        if not base:
            return []
        result = await self.db.execute(
            select(Forecast).where(
                Forecast.name == base.name,
                Forecast.fiscal_year == base.fiscal_year,
                Forecast.forecast_type == base.forecast_type,
            )
        )
        return list(result.scalars().all())


class ReportDAO:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self, report_type: Optional[str] = None) -> List[FpaReport]:
        q = select(FpaReport)
        if report_type:
            q = q.where(FpaReport.report_type == report_type)
        result = await self.db.execute(q.order_by(FpaReport.created_at.desc()))
        return list(result.scalars().all())

    async def get_by_id(self, report_id: UUID) -> Optional[FpaReport]:
        result = await self.db.execute(select(FpaReport).where(FpaReport.id == report_id))
        return result.scalar_one_or_none()

    async def create(self, data: dict) -> FpaReport:
        report = FpaReport(**data)
        self.db.add(report)
        await self.db.commit()
        await self.db.refresh(report)
        return report
