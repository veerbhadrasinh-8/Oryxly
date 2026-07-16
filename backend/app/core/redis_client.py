import ssl
from urllib.parse import urlparse, urlencode, parse_qs, urlunparse

from redis import Redis

from app.core.config import get_settings

settings = get_settings()

_ssl_ctx = ssl.create_default_context()
_ssl_ctx.check_hostname = False
_ssl_ctx.verify_mode = ssl.CERT_NONE


def _clean_redis_url(url: str) -> str:
    """Strip ssl_cert_reqs param — redis-py rejects it; ssl_context handles cert bypass."""
    parsed = urlparse(url)
    params = parse_qs(parsed.query, keep_blank_values=True)
    params.pop("ssl_cert_reqs", None)
    clean_query = urlencode({k: v[0] for k, v in params.items()})
    return urlunparse(parsed._replace(query=clean_query))


redis_client: Redis = Redis.from_url(
    _clean_redis_url(settings.REDIS_URL), decode_responses=True, ssl_context=_ssl_ctx
)
