from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    APP_NAME: str = "MailFlow API"
    ENV: str = Field(default="development")
    DEBUG: bool = True

    DATABASE_URL: str = "postgresql+psycopg://mailflow:mailflow@localhost:5432/mailflow"
    REDIS_URL: str = "redis://localhost:6379/0"

    SECRET_KEY: str = "change-me-in-prod"
    FERNET_KEY: str = "change-me-32-url-safe-base64-bytes="
    ACCESS_TOKEN_TTL_MIN: int = 30
    REFRESH_TOKEN_TTL_DAYS: int = 14

    CORS_ORIGINS: list[str] = ["http://localhost:3000"]


@lru_cache
def get_settings() -> Settings:
    return Settings()
