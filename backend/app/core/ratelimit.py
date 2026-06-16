"""Sliding-window-ish rate limiter backed by Redis INCR + TTL.

We use simple fixed-window counters: one Redis key per (scope, identity, minute).
Cheap, accurate enough for abuse prevention, and survives restarts because
the state lives in Redis (not in-process).

Usage in a FastAPI route:

    @router.post("/login")
    def login(request: Request, ...):
        rate_limit_ip(request, scope="login", limit=10, per_seconds=60)
        ...

The dependency raises 429 with a Retry-After header on breach.
"""

from __future__ import annotations

import os
import time

from fastapi import HTTPException, Request, status

from app.core.redis_client import redis_client


def _disabled() -> bool:
    """When tests are running we don't want a per-IP limit to interfere.
    Set ENV=test (or RATE_LIMIT_DISABLED=1) to bypass."""
    return os.environ.get("ENV", "").lower() == "test" or os.environ.get(
        "RATE_LIMIT_DISABLED", ""
    ).lower() in {"1", "true", "yes"}


def _ip_of(request: Request) -> str:
    # Trust X-Forwarded-For only if explicitly configured; for MVP we use
    # the direct peer. In production behind a proxy, set the proxy to inject
    # a trusted header and read it here.
    if request.client:
        return request.client.host
    return "unknown"


def _check(key: str, limit: int, per_seconds: int) -> tuple[bool, int]:
    """Returns (allowed, retry_after_seconds_if_blocked)."""
    pipe = redis_client.pipeline()
    pipe.incr(key)
    pipe.ttl(key)
    count, ttl = pipe.execute()
    count = int(count)
    if count == 1:
        # Fresh window — set TTL
        redis_client.expire(key, per_seconds)
        ttl = per_seconds
    if count > limit:
        # If TTL is somehow -1 (no expire set), default to per_seconds
        retry_after = int(ttl) if ttl and ttl > 0 else per_seconds
        return False, retry_after
    return True, 0


def rate_limit_ip(
    request: Request, *, scope: str, limit: int, per_seconds: int = 60
) -> None:
    """Per-IP fixed-window limit. Raises 429 if exceeded."""
    if _disabled():
        return
    ip = _ip_of(request)
    window = int(time.time()) // per_seconds
    key = f"rl:{scope}:ip:{ip}:{window}"
    allowed, retry_after = _check(key, limit, per_seconds)
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"too many requests — retry in {retry_after}s",
            headers={"Retry-After": str(retry_after)},
        )


def rate_limit_user(
    user_id: str, *, scope: str, limit: int, per_seconds: int = 60
) -> None:
    """Per-user fixed-window limit. Raises 429 if exceeded."""
    if _disabled():
        return
    window = int(time.time()) // per_seconds
    key = f"rl:{scope}:user:{user_id}:{window}"
    allowed, retry_after = _check(key, limit, per_seconds)
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"too many requests — retry in {retry_after}s",
            headers={"Retry-After": str(retry_after)},
        )
