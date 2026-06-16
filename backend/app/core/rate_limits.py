"""Per-user-per-day send counters in Redis."""

from datetime import datetime, timezone

from app.core.redis_client import redis_client
from app.core.plans import DAILY_EMAIL_LIMIT
from app.models.user import UserPlan


def _today_key(user_id: str) -> str:
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    return f"mailflow:dailysend:{user_id}:{today}"


def get_sent_today(user_id: str) -> int:
    """Return how many sends the user has already used today."""
    raw = redis_client.get(_today_key(user_id))
    return int(raw) if raw else 0


def can_send_more(user_id: str, plan: UserPlan, *, want: int = 1) -> bool:
    used = get_sent_today(user_id)
    limit = DAILY_EMAIL_LIMIT[plan]
    return used + want <= limit


def increment_sent(user_id: str) -> int:
    """Increment the counter and return the new total. The key expires
    36 h after first use, which is comfortably past any UTC day rollover."""
    key = _today_key(user_id)
    new_val = redis_client.incr(key)
    if new_val == 1:
        redis_client.expire(key, 36 * 60 * 60)
    return int(new_val)
