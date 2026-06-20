"""Logs query - joins campaign_recipients with campaigns + contacts, scoped to
the requesting user. Filterable by status, campaign, and recipient email."""

from uuid import UUID

from sqlalchemy import desc, func, or_, select
from sqlalchemy.orm import Session

from app.models.campaign import Campaign, CampaignRecipient, RecipientStatus
from app.models.contact import Contact


def _base(user_id: UUID):
    """SELECT recipient row + campaign + contact, scoped to user."""
    return (
        select(
            CampaignRecipient.id.label("recipient_id"),
            Campaign.id.label("campaign_id"),
            Campaign.name.label("campaign_name"),
            Contact.email.label("email"),
            Contact.name.label("contact_name"),
            Contact.company.label("company"),
            CampaignRecipient.status.label("status"),
            CampaignRecipient.attempt_count.label("attempt_count"),
            CampaignRecipient.sent_at.label("sent_at"),
            CampaignRecipient.last_attempt_at.label("last_attempt_at"),
            CampaignRecipient.error_message.label("error_message"),
            CampaignRecipient.created_at.label("created_at"),
        )
        .select_from(CampaignRecipient)
        .join(Campaign, Campaign.id == CampaignRecipient.campaign_id)
        .join(Contact, Contact.id == CampaignRecipient.contact_id)
        .where(Campaign.user_id == user_id)
    )


def _apply_filters(
    stmt,
    *,
    status: RecipientStatus | None,
    campaign_id: UUID | None,
    search: str | None,
):
    if status is not None:
        stmt = stmt.where(CampaignRecipient.status == status)
    if campaign_id is not None:
        stmt = stmt.where(Campaign.id == campaign_id)
    if search:
        like = f"%{search.lower()}%"
        stmt = stmt.where(
            or_(
                func.lower(Contact.email).like(like),
                func.lower(Contact.name).like(like),
                func.lower(Contact.company).like(like),
            )
        )
    return stmt


def query_logs(
    db: Session,
    *,
    user_id: UUID,
    status: RecipientStatus | None = None,
    campaign_id: UUID | None = None,
    search: str | None = None,
    page: int = 1,
    limit: int = 50,
) -> tuple[list[dict], int]:
    base = _apply_filters(_base(user_id), status=status, campaign_id=campaign_id, search=search)

    # Count first (subquery so ORDER BY in the data query doesn't matter)
    total = db.execute(
        select(func.count()).select_from(base.order_by(None).subquery())
    ).scalar_one()

    rows = (
        db.execute(
            base.order_by(
                desc(CampaignRecipient.last_attempt_at).nulls_last(),
                desc(CampaignRecipient.created_at),
            )
            .offset((page - 1) * limit)
            .limit(limit)
        )
        .mappings()
        .all()
    )
    return [dict(r) for r in rows], int(total)


def query_campaign_logs(
    db: Session, *, user_id: UUID, campaign_id: UUID
) -> list[dict]:
    rows = (
        db.execute(
            _base(user_id)
            .where(Campaign.id == campaign_id)
            .order_by(
                desc(CampaignRecipient.last_attempt_at).nulls_last(),
                desc(CampaignRecipient.created_at),
            )
        )
        .mappings()
        .all()
    )
    return [dict(r) for r in rows]
