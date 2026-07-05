"""Plan limits.

Email quota is enforced **per calendar month**. A user may carry a custom
per-user override (`users.monthly_email_limit`); when set it wins over the
plan default. Customers send through their own SMTP, so the email cap is a
product gate, not an infrastructure cost.
"""

from typing import TYPE_CHECKING

from app.models.user import UserPlan

if TYPE_CHECKING:
    from app.models.user import User

SMTP_LIMIT: dict[UserPlan, int] = {
    UserPlan.LITE: 1,
    UserPlan.STARTER: 1,
    UserPlan.GROWTH: 3,
    UserPlan.AGENCY: 10,
}

MONTHLY_EMAIL_LIMIT: dict[UserPlan, int] = {
    UserPlan.LITE: 900,
    UserPlan.STARTER: 5_000,
    UserPlan.GROWTH: 30_000,
    UserPlan.AGENCY: 150_000,
}

CAMPAIGNS_PER_MONTH_LIMIT: dict[UserPlan, int | None] = {
    UserPlan.LITE: 5,
    UserPlan.STARTER: 5,
    UserPlan.GROWTH: None,  # unlimited
    UserPlan.AGENCY: None,
}

CONTACT_LIMIT: dict[UserPlan, int | None] = {
    UserPlan.LITE: 1_000,
    UserPlan.STARTER: 5_000,
    UserPlan.GROWTH: 25_000,
    UserPlan.AGENCY: None,
}


def effective_smtp_limit(user: "User") -> int:
    """Resolve the user's SMTP account limit. Admin override wins over plan default."""
    if user.smtp_account_limit is not None:
        return user.smtp_account_limit
    return SMTP_LIMIT[user.plan]


def effective_monthly_email_limit(user: "User") -> int:
    """Resolve the user's monthly email cap.

    A per-user override (set by an admin) takes precedence over the plan
    default.

    Args:
        user: The user whose cap to resolve.

    Returns:
        The integer monthly email cap.
    """
    if user.monthly_email_limit is not None:
        return user.monthly_email_limit
    return MONTHLY_EMAIL_LIMIT[user.plan]
