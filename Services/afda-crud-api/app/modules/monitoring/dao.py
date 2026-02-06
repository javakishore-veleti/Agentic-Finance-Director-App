from uuid import UUID
from datetime import datetime, timedelta
from typing import Optional, List
from sqlalchemy import select, func, update, text
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.monitoring.models import ServiceRegistry, Incident, ApiMetricsLog


class ServiceRegistryDAO:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self) -> List[ServiceRegistry]:
        result = await self.db.execute(select(ServiceRegistry).order_by(ServiceRegistry.service_name))
        return list(result.scalars().all())

    async def get_by_name(self, name: str) -> Optional[ServiceRegistry]:
        result = await self.db.execute(
            select(ServiceRegistry).where(ServiceRegistry.service_name == name)
        )
        return result.scalar_one_or_none()

    async def count_by_status(self) -> dict:
        result = await self.db.execute(
            select(ServiceRegistry.status, func.count()).group_by(ServiceRegistry.status)
        )
        return {row[0].value: row[1] for row in result.all()}

    async def avg_uptime(self) -> float:
        result = await self.db.execute(select(func.avg(ServiceRegistry.uptime_pct)))
        return round(result.scalar() or 0, 2)

    async def update_status(self, service_name: str, status: str, error: Optional[str] = None):
        data = {"status": status, "last_check_at": datetime.utcnow(), "last_error": error}
        await self.db.execute(
            update(ServiceRegistry).where(ServiceRegistry.service_name == service_name).values(**data)
        )
        await self.db.commit()


class IncidentDAO:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_active(self) -> List[Incident]:
        result = await self.db.execute(
            select(Incident).where(Incident.status.in_(["open", "investigating", "mitigated"]))
                .order_by(Incident.started_at.desc())
        )
        return list(result.scalars().all())

    async def count_active(self) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(Incident)
                .where(Incident.status.in_(["open", "investigating", "mitigated"]))
        )
        return result.scalar() or 0


class ApiMetricsDAO:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_recent(self, limit: int = 100) -> List[ApiMetricsLog]:
        result = await self.db.execute(
            select(ApiMetricsLog).order_by(ApiMetricsLog.recorded_at.desc()).limit(limit)
        )
        return list(result.scalars().all())

    async def get_summary_24h(self) -> dict:
        cutoff = datetime.utcnow() - timedelta(hours=24)
        total_q = await self.db.execute(
            select(func.count()).select_from(ApiMetricsLog).where(ApiMetricsLog.recorded_at >= cutoff)
        )
        avg_q = await self.db.execute(
            select(func.avg(ApiMetricsLog.response_time_ms)).where(ApiMetricsLog.recorded_at >= cutoff)
        )
        error_q = await self.db.execute(
            select(func.count()).select_from(ApiMetricsLog)
                .where(ApiMetricsLog.recorded_at >= cutoff, ApiMetricsLog.status_code >= 500)
        )
        total = total_q.scalar() or 0
        errors = error_q.scalar() or 0
        return {
            "total_requests_24h": total,
            "avg_response_ms": round(avg_q.scalar() or 0, 2),
            "error_rate_pct": round((errors / total * 100) if total else 0, 2),
        }

    async def get_by_endpoint(self) -> list:
        result = await self.db.execute(
            select(
                ApiMetricsLog.endpoint,
                ApiMetricsLog.method,
                func.count().label("total_requests"),
                func.avg(ApiMetricsLog.response_time_ms).label("avg_response_ms"),
                func.max(ApiMetricsLog.recorded_at).label("last_called_at"),
            )
            .group_by(ApiMetricsLog.endpoint, ApiMetricsLog.method)
            .order_by(func.avg(ApiMetricsLog.response_time_ms).desc())
        )
        return [dict(row._mapping) for row in result.all()]

    async def get_status_distribution(self) -> dict:
        cutoff = datetime.utcnow() - timedelta(hours=24)
        result = await self.db.execute(
            select(ApiMetricsLog.status_code, func.count())
                .where(ApiMetricsLog.recorded_at >= cutoff)
                .group_by(ApiMetricsLog.status_code)
        )
        return {str(row[0]): row[1] for row in result.all()}

    async def get_latency_percentiles(self) -> dict:
        cutoff = datetime.utcnow() - timedelta(hours=24)
        result = await self.db.execute(
            select(ApiMetricsLog.response_time_ms)
                .where(ApiMetricsLog.recorded_at >= cutoff)
                .order_by(ApiMetricsLog.response_time_ms)
        )
        values = [row[0] for row in result.all()]
        if not values:
            return {"p50": 0, "p75": 0, "p90": 0, "p95": 0, "p99": 0}
        n = len(values)
        return {
            "p50": values[int(n * 0.50)] if n else 0,
            "p75": values[int(n * 0.75)] if n else 0,
            "p90": values[int(n * 0.90)] if n else 0,
            "p95": values[min(int(n * 0.95), n - 1)] if n else 0,
            "p99": values[min(int(n * 0.99), n - 1)] if n else 0,
        }
