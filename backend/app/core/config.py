from functools import lru_cache

from cryptography.fernet import Fernet
from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Insecure placeholder values shipped as local-dev defaults. Production must
# override these — the guardrail in Settings refuses to boot if it sees them.
_DEFAULT_SECRET_KEY = "change-me-in-prod"
_DEFAULT_FERNET_KEY = "change-me-32-url-safe-base64-bytes="
_MIN_SECRET_KEY_LEN = 32

# ENV values treated as non-production; anything else triggers strict checks.
_NON_PROD_ENVS = {"development", "dev", "local", "test", "testing", "ci"}


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    APP_NAME: str = "MailFlow API"
    ENV: str = Field(default="development")
    DEBUG: bool = True

    DATABASE_URL: str = "postgresql+psycopg://mailflow:mailflow@localhost:5432/mailflow"
    REDIS_URL: str = "redis://localhost:6379/0"

    SECRET_KEY: str = _DEFAULT_SECRET_KEY
    FERNET_KEY: str = _DEFAULT_FERNET_KEY
    ACCESS_TOKEN_TTL_MIN: int = 30
    REFRESH_TOKEN_TTL_DAYS: int = 14

    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    @property
    def is_production(self) -> bool:
        return self.ENV.strip().lower() not in _NON_PROD_ENVS

    @model_validator(mode="after")
    def _enforce_production_safety(self) -> "Settings":
        """Refuse to boot with insecure config in production.

        Catches the deploy mistakes that would otherwise ship silently:
        placeholder/weak secrets, debug mode, and localhost CORS. No-op in
        development/test so local workflow is unaffected.

        Raises:
            ValueError: If any production-unsafe setting is detected.
        """
        if not self.is_production:
            return self

        problems: list[str] = []

        if self.SECRET_KEY == _DEFAULT_SECRET_KEY:
            problems.append("SECRET_KEY is still the placeholder default")
        elif len(self.SECRET_KEY) < _MIN_SECRET_KEY_LEN:
            problems.append(f"SECRET_KEY is shorter than {_MIN_SECRET_KEY_LEN} chars")

        if self.FERNET_KEY == _DEFAULT_FERNET_KEY:
            problems.append("FERNET_KEY is still the placeholder default")
        else:
            try:
                Fernet(self.FERNET_KEY.encode())
            except (ValueError, TypeError):
                problems.append("FERNET_KEY is not a valid 32-byte url-safe base64 key")

        if self.DEBUG:
            problems.append("DEBUG must be false in production")

        localhost_origins = [o for o in self.CORS_ORIGINS if "localhost" in o or "127.0.0.1" in o]
        if localhost_origins:
            problems.append(f"CORS_ORIGINS contains localhost entries: {localhost_origins}")

        if problems:
            raise ValueError(
                f"Insecure production configuration (ENV={self.ENV!r}):\n  - "
                + "\n  - ".join(problems)
                + "\nSet these via environment variables before deploying. "
                "Generate a Fernet key with: "
                'python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"'
            )
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
