"""Add missing columns to platform DB. Safe to re-run."""
import asyncio
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from app.database import engine

ALTERATIONS = [
    "ALTER TABLE platform_user ADD COLUMN IF NOT EXISTS department VARCHAR(100)",
    "ALTER TABLE api_key ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMP",
    "ALTER TABLE data_connection ADD COLUMN IF NOT EXISTS last_error TEXT",
    "ALTER TABLE platform_setting ADD COLUMN IF NOT EXISTS description VARCHAR(500)",
    "ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS actor_email VARCHAR(300)",
]

async def migrate():
    async with engine.begin() as conn:
        for sql in ALTERATIONS:
            try:
                await conn.execute(text(sql))
                col = sql.split("ADD COLUMN IF NOT EXISTS ")[1].split(" ")[0]
                tbl = sql.split("ALTER TABLE ")[1].split(" ")[0]
                print(f"  + {tbl}.{col}")
            except Exception as e:
                print(f"  skip: {e}")
    print("  Done.")

if __name__ == "__main__":
    asyncio.run(migrate())
