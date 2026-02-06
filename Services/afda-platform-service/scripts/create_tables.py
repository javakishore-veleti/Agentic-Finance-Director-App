"""
Create all platform tables.
Run: cd Services/afda-platform-service && python -m scripts.create_tables
"""
import asyncio
from app.database import engine, Base

# Import all models
from app.modules.identity.models import *   # noqa
from app.modules.access.models import *     # noqa
from app.modules.config.models import *     # noqa


async def create():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ All platform tables created:")
    for table in Base.metadata.sorted_tables:
        print(f"   → {table.name}")
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(create())
