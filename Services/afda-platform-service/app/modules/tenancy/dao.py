"""Tenancy DAO — re-uses identity DAO for Customer/Organization, adds currency ops."""
import uuid
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.identity.models import Organization, OrganizationCurrency

# Re-export from identity DAO
from app.modules.identity.dao import CustomerDAO, OrganizationDAO


class OrgCurrencyDAO:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_by_org(self, org_id: uuid.UUID) -> list[OrganizationCurrency]:
        result = await self.db.execute(
            select(OrganizationCurrency).where(OrganizationCurrency.organization_id == org_id)
        )
        return list(result.scalars().all())

    async def create(self, currency: OrganizationCurrency) -> OrganizationCurrency:
        self.db.add(currency)
        await self.db.flush()
        await self.db.refresh(currency)
        return currency

    async def delete(self, currency_id: uuid.UUID):
        await self.db.execute(
            delete(OrganizationCurrency).where(OrganizationCurrency.id == currency_id)
        )
