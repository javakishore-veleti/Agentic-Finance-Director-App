from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from motor.motor_asyncio import AsyncIOMotorClient
from redis.asyncio import Redis
from app.config import get_settings

settings = get_settings()

# ── PostgreSQL ──
engine = create_async_engine(settings.DATABASE_URL, echo=settings.DEBUG, pool_size=20)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


# ── MongoDB ──
mongo_client: AsyncIOMotorClient = None
mongo_db = None


def get_mongo():
    return mongo_db


# ── Redis ──
redis_client: Redis = None


def get_redis():
    return redis_client


# ── Lifecycle ──
async def connect_all():
    global mongo_client, mongo_db, redis_client
    mongo_client = AsyncIOMotorClient(settings.MONGO_URL)
    mongo_db = mongo_client[settings.MONGO_DB]
    redis_client = Redis.from_url(settings.REDIS_URL, decode_responses=True)
    # Ensure indexes (graceful — don't block startup if DB is unavailable)
    try:
        await mongo_db.agent_conversations.create_index("session_id")
        await mongo_db.agent_executions.create_index([("created_at", -1)])
        await mongo_db.workflow_definitions.create_index("name")
    except Exception as e:
        import logging
        logging.getLogger("afda-gateway").warning(f"MongoDB index creation skipped: {e}")

async def disconnect_all():
    global mongo_client, redis_client
    if mongo_client:
        mongo_client.close()
    if redis_client:
        await redis_client.close()
