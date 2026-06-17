from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.plans import effective_monthly_email_limit
from app.core.rate_limits import get_sent_this_month
from app.database.session import get_db
from app.models.campaign import (
    Campaign,
    CampaignRecipient,
    CampaignStatus,
    RecipientStatus,
)
from app.models.contact import ContactList
from app.models.smtp_account import SmtpAccount, SmtpStatus
from app.models.template import Template
from app.models.user import User
from app.repositories import campaigns as campaigns_repo
from app.schemas.campaigns import CampaignSummary
from app.schemas.dashboard import (
    CampaignCounts,
    DashboardSummary,
    EmailCounts,
    MonthlyUsage,
    RecentCampaignsResponse,
    SmtpCounts,
)

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


def _count_by_status(db: Session, user_id: UUID) -> dict[CampaignStatus, int]:
    """One query that buckets the user's campaigns by status."""
    rows = db.execute(
        select(Campaign.status, func.count())
        .where(Campaign.user_id == user_id)
        .group_by(Campaign.status)
    ).all()
    return {status: int(count) for status, count in rows}


def _recipient_totals(db: Session, user_id: UUID) -> dict[RecipientStatus, int]:
    """Sum of recipient statuses across all the user's campaigns."""
    rows = db.execute(
        select(CampaignRecipient.status, func.count())
        .select_from(CampaignRecipient)
        .join(Campaign, Campaign.id == CampaignRecipient.campaign_id)
        .where(Campaign.user_id == user_id)
        .group_by(CampaignRecipient.status)
    ).all()
    return {status: int(count) for status, count in rows}


@router.get("/summary", response_model=DashboardSummary)
def summary(
    user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> DashboardSummary:
    by_status = _count_by_status(db, user.id)
    total_campaigns = sum(by_status.values())

    recip = _recipient_totals(db, user.id)

    smtp_total = int(
        db.execute(
            select(func.count()).select_from(SmtpAccount).where(SmtpAccount.user_id == user.id)
        ).scalar_one()
    )
    smtp_active = int(
        db.execute(
            select(func.count())
            .select_from(SmtpAccount)
            .where(SmtpAccount.user_id == user.id, SmtpAccount.status == SmtpStatus.ACTIVE)
        ).scalar_one()
    )

    list_count = int(
        db.execute(
            select(func.count()).select_from(ContactList).where(ContactList.user_id == user.id)
        ).scalar_one()
    )
    tpl_count = int(
        db.execute(
            select(func.count()).select_from(Template).where(Template.user_id == user.id)
        ).scalar_one()
    )

    return DashboardSummary(
        campaigns=CampaignCounts(
            total=total_campaigns,
            draft=by_status.get(CampaignStatus.DRAFT, 0),
            queued=by_status.get(CampaignStatus.QUEUED, 0),
            running=by_status.get(CampaignStatus.RUNNING, 0),
            completed=by_status.get(CampaignStatus.COMPLETED, 0),
            failed=by_status.get(CampaignStatus.FAILED, 0),
            cancelled=by_status.get(CampaignStatus.CANCELLED, 0),
        ),
        emails=EmailCounts(
            sent=recip.get(RecipientStatus.SENT, 0),
            failed=recip.get(RecipientStatus.FAILED, 0),
            pending=recip.get(RecipientStatus.PENDING, 0),
        ),
        smtp=SmtpCounts(total=smtp_total, active=smtp_active),
        contact_lists=list_count,
        templates=tpl_count,
        monthly=MonthlyUsage(
            sent_this_month=get_sent_this_month(str(user.id)),
            monthly_cap=effective_monthly_email_limit(user),
        ),
    )


@router.get("/recent-campaigns", response_model=RecentCampaignsResponse)
def recent_campaigns(
    limit: int = Query(default=5, ge=1, le=20),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> RecentCampaignsResponse:
    items, _ = campaigns_repo.list_for_user(db, user_id=user.id, page=1, limit=limit)
    return RecentCampaignsResponse(
        items=[
            CampaignSummary(
                id=c.id,
                name=c.name,
                status=c.status.value,
                total_recipients=c.total_recipients,
                sent_count=c.sent_count,
                failed_count=c.failed_count,
                created_at=c.created_at,
                started_at=c.started_at,
                completed_at=c.completed_at,
            )
            for c in items
        ]
    )
