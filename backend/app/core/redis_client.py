from redis import Redis

from app.core.config import get_settings

settings = get_settings()

redis_client: Redis = Redis.from_url(
    settings.REDIS_URL, decode_responses=True, ssl_cert_reqs="none"
)
