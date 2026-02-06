from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    APP_NAME: str = "AFDA Agent Gateway"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # MongoDB (conversations, executions, workflows)
    MONGO_HOST: str = "localhost"
    MONGO_PORT: int = 27017
    MONGO_DB: str = "afda_docs"
    MONGO_USER: str = "afda_user"
    MONGO_PASSWORD: str = "afda_pass"

    @property
    def MONGO_URL(self) -> str:
        if self.MONGO_USER and self.MONGO_PASSWORD:
            return f"mongodb://{self.MONGO_USER}:{self.MONGO_PASSWORD}@{self.MONGO_HOST}:{self.MONGO_PORT}"
        return f"mongodb://{self.MONGO_HOST}:{self.MONGO_PORT}"

    # Redis (pub/sub, session state)
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 1

    @property
    def REDIS_URL(self) -> str:
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"

    # Engine defaults
    DEFAULT_ENGINE: str = "n8n"  # n8n | langgraph | bedrock
    N8N_BASE_URL: str = "http://localhost:5678"
    N8N_API_KEY: str = ""
    LANGGRAPH_ENDPOINT: str = ""
    BEDROCK_REGION: str = "us-east-1"
    BEDROCK_AGENT_ID: str = ""

    # JWT (shared secret with CRUD API)
    JWT_SECRET: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"

    # CRUD API (for data lookups)
    CRUD_API_URL: str = "http://localhost:8000/api/v1"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()
