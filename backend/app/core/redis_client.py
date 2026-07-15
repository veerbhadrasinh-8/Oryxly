import ssl

from redis import Redis

from app.core.config import get_settings

settings = get_settings()

_ssl_ctx = ssl.create_default_context()
_ssl_ctx.check_hostname = False
_ssl_ctx.verify_mode = ssl.CERT_NONE

redis_client: Redis = Redis.from_url(
    settings.REDIS_URL, decode_responses=True, ssl_context=_ssl_ctx
)
