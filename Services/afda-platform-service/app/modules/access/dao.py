"""Access DAO: OrgAccessPolicy database operations."""
import uuid
from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.access.models import OrgAccessPolicy


class AccessPolicyDAO:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, policy_id: uuid.UUID) -> OrgAccessPolicy | None:
        result = await self.db.execute(
            select(OrgAccessPolicy).where(OrgAccessPolicy.id == policy_id)
        )
        return result.scalar_one_or_none()

    async def list_by_customer(self, customer_id: uuid.UUID) -> list[OrgAccessPolicy]:
        result = await self.db.execute(
            select(OrgAccessPolicy).where(OrgAccessPolicy.customer_id == customer_id)
            .order_by(OrgAccessPolicy.created_at.desc())
        )
        return list(result.scalars().all())

    async def list_for_org(self, org_id: uuid.UUID, direction: str = "to") -> list[OrgAccessPolicy]:
        """Get policies where org is receiving ('to') or granting ('from') access."""
        col = OrgAccessPolicy.to_organization_id if direction == "to" else OrgAccessPolicy.from_organization_id
        result = await self.db.execute(
            select(OrgAccessPolicy).where(col == org_id, OrgAccessPolicy.is_active == True)
        )
        return list(result.scalars().all())

    async def create(self, policy: OrgAccessPolicy) -> OrgAccessPolicy:
        self.db.add(policy)
        await self.db.flush()
        await self.db.refresh(policy)
        return policy

    async def update(self, policy_id: uuid.UUID, **kwargs) -> OrgAccessPolicy | None:
        from datetime import datetime as dt
        kwargs["updated_at"] = dt.utcnow()
        await self.db.execute(
            update(OrgAccessPolicy).where(OrgAccessPolicy.id == policy_id).values(**kwargs)
        )
        await self.db.flush()
        return await self.get_by_id(policy_id)

    async def delete(self, policy_id: uuid.UUID):
        await self.db.execute(
            delete(OrgAccessPolicy).where(OrgAccessPolicy.id == policy_id)
        )
