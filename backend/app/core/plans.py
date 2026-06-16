"""Plan limits from ai-context/01_prd.md §12-13."""

from app.models.user import UserPlan

SMTP_LIMIT: dict[UserPlan, int] = {
    UserPlan.STARTER: 1,
    UserPlan.GROWTH: 3,
    UserPlan.AGENCY: 10,
}

DAILY_EMAIL_LIMIT: dict[UserPlan, int] = {
    UserPlan.STARTER: 200,
    UserPlan.GROWTH: 1_000,
    UserPlan.AGENCY: 5_000,
}

CAMPAIGNS_PER_MONTH_LIMIT: dict[UserPlan, int | None] = {
    UserPlan.STARTER: 5,
    UserPlan.GROWTH: None,  # unlimited
    UserPlan.AGENCY: None,
}

CONTACT_LIMIT: dict[UserPlan, int | None] = {
    UserPlan.STARTER: 2_000,
    UserPlan.GROWTH: None,
    UserPlan.AGENCY: None,
}
