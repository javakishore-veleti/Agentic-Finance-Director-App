"""
Drop all PostgreSQL tables. USE WITH CAUTION.
Run: cd Services/afda-crud-api && python -m scripts.drop_tables
"""
import asyncio
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine, Base
from app.modules.command_center.models import *
from app.modules.fpa.models import *
from app.modules.treasury.models import *
from app.modules.accounting.models import *
from app.modules.risk.models import *
from app.modules.monitoring.models import *
from app.modules.admin.models import *


async def drop():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    print("⚠️  All PostgreSQL tables dropped")
    await engine.dispose()

asyncio.run(drop())
