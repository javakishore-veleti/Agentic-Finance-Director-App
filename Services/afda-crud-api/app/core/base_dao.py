"""
Base DAO with organization_id filtering built in.
All domain DAOs should inherit from this.
"""
import uuid
from typing import TypeVar, Generic, Optional, List
from sqlalchemy import select, update, delete, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import Base

T = TypeVar("T", bound=Base)


class OrgScopedDAO(Generic[T]):
    """
    Base DAO that automatically scopes all queries to organization_id.
    
    Usage:
        class KpiDAO(OrgScopedDAO[KpiDefinition]):
            model = KpiDefinition
    """
    model: type[T] = None

    def __init__(self, db: AsyncSession, org_id: uuid.UUID):
        self.db = db
        self.org_id = org_id

    def _base_query(self):
        """All queries start with org filter."""
        return select(self.model).where(self.model.organization_id == self.org_id)

    async def get_all(self, limit: int = 100, offset: int = 0, **filters) -> List[T]:
        q = self._base_query()
        for col, val in filters.items():
            if val is not None and hasattr(self.model, col):
                q = q.where(getattr(self.model, col) == val)
        q = q.offset(offset).limit(limit)
        result = await self.db.execute(q)
        return list(result.scalars().all())

    async def get_by_id(self, entity_id: uuid.UUID) -> Optional[T]:
        """Get by id — still scoped to org for safety."""
        result = await self.db.execute(
            self._base_query().where(self.model.id == entity_id)
        )
        return result.scalar_one_or_none()

    async def count(self, **filters) -> int:
        q = select(func.count(self.model.id)).where(self.model.organization_id == self.org_id)
        for col, val in filters.items():
            if val is not None and hasattr(self.model, col):
                q = q.where(getattr(self.model, col) == val)
        result = await self.db.execute(q)
        return result.scalar() or 0

    async def create(self, data: dict) -> T:
        """Create with organization_id automatically injected."""
        data["organization_id"] = self.org_id
        entity = self.model(**data)
        self.db.add(entity)
        await self.db.commit()
        await self.db.refresh(entity)
        return entity

    async def update(self, entity_id: uuid.UUID, data: dict) -> Optional[T]:
        """Update — scoped to org."""
        data = {k: v for k, v in data.items() if v is not None}
        if data:
            await self.db.execute(
                update(self.model)
                .where(self.model.id == entity_id, self.model.organization_id == self.org_id)
                .values(**data)
            )
            await self.db.commit()
        return await self.get_by_id(entity_id)

    async def delete(self, entity_id: uuid.UUID) -> bool:
        result = await self.db.execute(
            delete(self.model)
            .where(self.model.id == entity_id, self.model.organization_id == self.org_id)
        )
        await self.db.commit()
        return result.rowcount > 0
