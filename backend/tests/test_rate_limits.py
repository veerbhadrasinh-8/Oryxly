"""Monthly send-quota reservation logic.

Proves the cap is exact: reservations succeed up to the limit, fail beyond
it, and releasing a slot frees capacity again (no overshoot, no leak).
"""

import uuid

from app.core.rate_limits import (
    get_sent_this_month,
    release_send_slot,
    reserve_send_slot,
)


def _fresh_user() -> str:
    return f"ratelimit-test-{uuid.uuid4().hex}"


def test_reserves_up_to_limit_then_blocks():
    user = _fresh_user()
    limit = 3
    assert reserve_send_slot(user, limit) is True
    assert reserve_send_slot(user, limit) is True
    assert reserve_send_slot(user, limit) is True
    # Fourth reservation exceeds the cap and must be refused.
    assert reserve_send_slot(user, limit) is False
    assert get_sent_this_month(user) == limit


def test_failed_reservation_does_not_consume():
    user = _fresh_user()
    limit = 1
    assert reserve_send_slot(user, limit) is True
    assert reserve_send_slot(user, limit) is False
    # The refused attempt rolled itself back — counter stays at the limit.
    assert get_sent_this_month(user) == 1


def test_release_frees_a_slot():
    user = _fresh_user()
    limit = 1
    assert reserve_send_slot(user, limit) is True
    assert reserve_send_slot(user, limit) is False
    release_send_slot(user)
    assert get_sent_this_month(user) == 0
    # Capacity is available again after release.
    assert reserve_send_slot(user, limit) is True


def test_release_never_goes_negative():
    user = _fresh_user()
    release_send_slot(user)
    assert get_sent_this_month(user) == 0
