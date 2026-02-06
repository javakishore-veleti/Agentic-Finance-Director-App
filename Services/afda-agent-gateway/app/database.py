from motor.motor_asyncio import AsyncIOMotorClient
from redis.asyncio import Redis
from app.config import get_settings

settings = get_settings()

mongo_client: AsyncIOMotorClient = None
mongo_db = None
redis_client: Redis = None


def get_mongo():
    return mongo_db


def get_redis():
    return redis_client


async def connect_all():
    global mongo_client, mongo_db, redis_client
    mongo_client = AsyncIOMotorClient(settings.MONGO_URL)
    mongo_db = mongo_client[settings.MONGO_DB]
    redis_client = Redis.from_url(settings.REDIS_URL, decode_responses=True)
    # Ensure indexes
    await mongo_db.agent_conversations.create_index("session_id")
    await mongo_db.agent_executions.create_index([("created_at", -1)])
    await mongo_db.workflow_definitions.create_index("name")


async def disconnect_all():
    global mongo_client, redis_client
    if mongo_client:
        mongo_client.close()
    if redis_client:
        await redis_client.close()
