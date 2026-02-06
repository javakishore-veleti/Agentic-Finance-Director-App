"""
Create all PostgreSQL tables directly from models.
Run: cd Services/afda-crud-api && python -m scripts.create_tables
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


async def create():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ All PostgreSQL tables created")
    await engine.dispose()

asyncio.run(create())
