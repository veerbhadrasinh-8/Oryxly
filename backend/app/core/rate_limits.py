"""Per-user monthly send counters in Redis.

The counter reflects **successful** sends in the current calendar month
(UTC). To avoid a check-then-increment race across concurrent workers, a
slot is *reserved* atomically before the SMTP send; the reservation is kept
on success and released on failure/retry. This makes the cap exact even
under worker concurrency > 1.
"""

from datetime import datetime, timezone

from app.core.redis_client import redis_client

# Keep the key well past a month boundary so a slow month-end send still
# counts against the right bucket; the month is encoded in the key itself.
_KEY_TTL_SECONDS = 40 * 24 * 60 * 60


def _month_key(user_id: str) -> str:
    month = datetime.now(timezone.utc).strftime("%Y-%m")
    return f"mailflow:monthsend:{user_id}:{month}"


def get_sent_this_month(user_id: str) -> int:
    """Return how many sends the user has used in the current month."""
    try:
        raw = redis_client.get(_month_key(user_id))
        return int(raw) if raw else 0
    except Exception:
        return 0


def reserve_send_slot(user_id: str, limit: int, *, want: int = 1) -> bool:
    """Atomically reserve `want` send slots if within `limit`.

    Increments the counter first (atomic), then rolls back if the new total
    would exceed the limit. Returns True if the reservation succeeded.
    On Redis failure, allows the send to proceed (fail-open) rather than
    blocking all sends when Redis is temporarily unavailable.
    """
    try:
        key = _month_key(user_id)
        new_total = redis_client.incrby(key, want)
        if new_total == want:
            # First write this month - set expiry.
            redis_client.expire(key, _KEY_TTL_SECONDS)
        if new_total > limit:
            redis_client.decrby(key, want)
            return False
        return True
    except Exception:
        return True


def release_send_slot(user_id: str, *, want: int = 1) -> None:
    """Release a previously reserved slot (on send failure or retry)."""
    try:
        key = _month_key(user_id)
        current = redis_client.get(key)
        if current and int(current) >= want:
            redis_client.decrby(key, want)
    except Exception:
        pass
