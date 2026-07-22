from urllib.parse import urlparse, urlencode, parse_qs, urlunparse

from redis import Redis

from app.core.config import get_settings

settings = get_settings()


def _clean_redis_url(url: str) -> str:
    """Strip ssl_cert_reqs param — passed as kwarg instead so redis-py accepts it."""
    parsed = urlparse(url)
    params = parse_qs(parsed.query, keep_blank_values=True)
    params.pop("ssl_cert_reqs", None)
    clean_query = urlencode({k: v[0] for k, v in params.items()})
    return urlunparse(parsed._replace(query=clean_query))


_is_ssl = urlparse(settings.REDIS_URL).scheme == "rediss"

redis_client: Redis = Redis.from_url(
    _clean_redis_url(settings.REDIS_URL),
    decode_responses=True,
    **({"ssl_cert_reqs": None} if _is_ssl else {}),
)
