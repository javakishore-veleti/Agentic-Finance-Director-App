"""Config DAO: ApiKey, DataConnection, PlatformSetting, AuditLog."""
import uuid
import hashlib
import secrets
from datetime import datetime
from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.config.models import ApiKey, DataConnection, PlatformSetting, AuditLog


class ApiKeyDAO:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_by_customer(self, customer_id: uuid.UUID) -> list[ApiKey]:
        result = await self.db.execute(
            select(ApiKey).where(ApiKey.customer_id == customer_id).order_by(ApiKey.created_at.desc())
        )
        return list(result.scalars().all())

    async def create(self, customer_id: uuid.UUID, name: str,
                     org_id: uuid.UUID | None, scopes: list,
                     expires_at=None, created_by=None) -> tuple[ApiKey, str]:
        """Create API key. Returns (ApiKey, raw_key) — raw_key shown only once."""
        raw_key = f"afda_{secrets.token_hex(24)}"
        key_prefix = raw_key[:12]
        key_hash = hashlib.sha256(raw_key.encode()).hexdigest()

        api_key = ApiKey(
            customer_id=customer_id,
            organization_id=org_id,
            name=name,
            key_prefix=key_prefix,
            key_hash=key_hash,
            scopes=scopes,
            is_active=True,
            expires_at=expires_at,
            created_by=created_by,
        )
        self.db.add(api_key)
        await self.db.flush()
        await self.db.refresh(api_key)
        return api_key, raw_key

    async def revoke(self, key_id: uuid.UUID):
        await self.db.execute(
            update(ApiKey).where(ApiKey.id == key_id).values(is_active=False)
        )


class DataConnectionDAO:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_by_customer(self, customer_id: uuid.UUID) -> list[DataConnection]:
        result = await self.db.execute(
            select(DataConnection).where(DataConnection.customer_id == customer_id)
        )
        return list(result.scalars().all())

    async def create(self, conn: DataConnection) -> DataConnection:
        self.db.add(conn)
        await self.db.flush()
        await self.db.refresh(conn)
        return conn

    async def update(self, conn_id: uuid.UUID, **kwargs):
        kwargs["updated_at"] = datetime.utcnow()
        await self.db.execute(
            update(DataConnection).where(DataConnection.id == conn_id).values(**kwargs)
        )


class SettingDAO:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_by_customer(self, customer_id: uuid.UUID,
                                org_id: uuid.UUID | None = None) -> list[PlatformSetting]:
        q = select(PlatformSetting).where(PlatformSetting.customer_id == customer_id)
        if org_id:
            q = q.where(
                (PlatformSetting.organization_id == org_id) |
                (PlatformSetting.organization_id == None)
            )
        result = await self.db.execute(q.order_by(PlatformSetting.key))
        return list(result.scalars().all())

    async def upsert(self, customer_id: uuid.UUID, key: str, value: str,
                     category: str, org_id: uuid.UUID | None = None,
                     updated_by: uuid.UUID | None = None) -> PlatformSetting:
        q = select(PlatformSetting).where(
            PlatformSetting.customer_id == customer_id,
            PlatformSetting.key == key
        )
        if org_id:
            q = q.where(PlatformSetting.organization_id == org_id)
        else:
            q = q.where(PlatformSetting.organization_id == None)

        result = await self.db.execute(q)
        existing = result.scalar_one_or_none()

        if existing:
            existing.value = value
            existing.category = category
            existing.updated_by = updated_by
            existing.updated_at = datetime.utcnow()
            await self.db.flush()
            return existing
        else:
            setting = PlatformSetting(
                customer_id=customer_id,
                organization_id=org_id,
                key=key,
                value=value,
                category=category,
                updated_by=updated_by,
            )
            self.db.add(setting)
            await self.db.flush()
            await self.db.refresh(setting)
            return setting


class AuditLogDAO:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_by_customer(self, customer_id: uuid.UUID, limit: int = 100) -> list[AuditLog]:
        result = await self.db.execute(
            select(AuditLog).where(AuditLog.customer_id == customer_id)
            .order_by(AuditLog.created_at.desc()).limit(limit)
        )
        return list(result.scalars().all())

    async def create(self, log: AuditLog) -> AuditLog:
        self.db.add(log)
        await self.db.flush()
        return log
