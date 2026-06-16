from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from app.models.campaign import (
    Campaign,
    CampaignRecipient,
    CampaignStatus,
    RecipientStatus,
)
from app.models.contact import Contact


def list_for_user(
    db: Session,
    *,
    user_id: UUID,
    status: CampaignStatus | None = None,
    page: int = 1,
    limit: int = 20,
) -> tuple[list[Campaign], int]:
    base = select(Campaign).where(Campaign.user_id == user_id)
    if status is not None:
        base = base.where(Campaign.status == status)
    total = db.execute(
        select(func.count()).select_from(base.order_by(None).subquery())
    ).scalar_one()
    items = list(
        db.execute(
            base.order_by(desc(Campaign.created_at))
            .offset((page - 1) * limit)
            .limit(limit)
        )
        .scalars()
        .all()
    )
    return items, int(total)


def get_owned(db: Session, *, user_id: UUID, campaign_id: UUID) -> Campaign | None:
    return db.execute(
        select(Campaign).where(Campaign.id == campaign_id, Campaign.user_id == user_id)
    ).scalar_one_or_none()


def count_started_this_month(db: Session, user_id: UUID) -> int:
    """Count campaigns the user has launched (not draft/cancelled) this calendar month."""
    now = datetime.now(timezone.utc)
    month_start = datetime(now.year, now.month, 1, tzinfo=timezone.utc)
    return int(
        db.execute(
            select(func.count())
            .select_from(Campaign)
            .where(
                Campaign.user_id == user_id,
                Campaign.created_at >= month_start,
                Campaign.status.in_(
                    [
                        CampaignStatus.QUEUED,
                        CampaignStatus.RUNNING,
                        CampaignStatus.COMPLETED,
                    ]
                ),
            )
        ).scalar_one()
    )


def create_with_recipients(
    db: Session,
    *,
    user_id: UUID,
    name: str,
    template_id: UUID,
    smtp_account_id: UUID,
    list_id: UUID,
    contact_ids: list[UUID],
) -> Campaign:
    """One transaction: campaign + recipients + total count."""
    c = Campaign(
        user_id=user_id,
        template_id=template_id,
        smtp_account_id=smtp_account_id,
        list_id=list_id,
        name=name,
        total_recipients=len(contact_ids),
    )
    db.add(c)
    db.flush()
    if contact_ids:
        db.add_all(
            [CampaignRecipient(campaign_id=c.id, contact_id=cid) for cid in contact_ids]
        )
    db.commit()
    db.refresh(c)
    return c


def list_contact_ids_for_list(db: Session, list_id: UUID) -> list[UUID]:
    return list(
        db.execute(select(Contact.id).where(Contact.list_id == list_id)).scalars().all()
    )


def set_status(
    db: Session, c: Campaign, status: CampaignStatus, *, started: bool = False, completed: bool = False
) -> Campaign:
    c.status = status
    now = datetime.now(timezone.utc)
    if started and c.started_at is None:
        c.started_at = now
    if completed:
        c.completed_at = now
    db.commit()
    db.refresh(c)
    return c


def transition_to_queued_if_draft(db: Session, campaign_id: UUID) -> bool:
    """Atomic draft→queued transition. Avoids the race where the API tries
    to flip DRAFT→QUEUED *after* a fast worker has already moved it to
    RUNNING — without this, a stale ORM commit would silently regress
    status from RUNNING back to QUEUED.

    Returns True if a row was updated (i.e. we were the one to flip it)."""
    from sqlalchemy import update as sqla_update

    now = datetime.now(timezone.utc)
    result = db.execute(
        sqla_update(Campaign)
        .where(Campaign.id == campaign_id, Campaign.status == CampaignStatus.DRAFT)
        .values(status=CampaignStatus.QUEUED, started_at=now)
    )
    db.commit()
    return bool(result.rowcount)


def cancel_remaining_recipients(db: Session, campaign_id: UUID) -> int:
    """Mark every still-pending recipient as failed with reason 'campaign cancelled'.
    Returns the number of rows updated. Called when a campaign is cancelled so
    queued recipients don't sit in PENDING forever.

    Counters (sent_count/failed_count) are then *recomputed* from the actual
    recipient statuses rather than incremented by rowcount — this avoids
    double-counting when an in-flight send finishes between our UPDATE
    matching and committing.
    """
    from sqlalchemy import update as sqla_update

    result = db.execute(
        sqla_update(CampaignRecipient)
        .where(
            CampaignRecipient.campaign_id == campaign_id,
            CampaignRecipient.status == RecipientStatus.PENDING,
        )
        .values(
            status=RecipientStatus.FAILED,
            error_message="campaign cancelled",
        )
    )
    rows = int(result.rowcount or 0)

    sent_count = int(
        db.execute(
            select(func.count())
            .select_from(CampaignRecipient)
            .where(
                CampaignRecipient.campaign_id == campaign_id,
                CampaignRecipient.status == RecipientStatus.SENT,
            )
        ).scalar_one()
    )
    failed_count = int(
        db.execute(
            select(func.count())
            .select_from(CampaignRecipient)
            .where(
                CampaignRecipient.campaign_id == campaign_id,
                CampaignRecipient.status == RecipientStatus.FAILED,
            )
        ).scalar_one()
    )
    db.execute(
        sqla_update(Campaign)
        .where(Campaign.id == campaign_id)
        .values(sent_count=sent_count, failed_count=failed_count)
    )
    db.commit()
    return rows


def reconcile_counters(db: Session, campaign_id: UUID) -> tuple[int, int]:
    """Re-derive sent_count / failed_count from the actual recipient rows.

    The stored counters can drift slightly if cancel races a successful send
    (cancel commits failed=N from a snapshot, then the racing send sneaks in
    sent_count+1, leaving failed double-counted). This call always brings
    the campaign back to a state consistent with its recipients.

    Returns (sent, failed) — the true values, which the caller can also
    inspect to render in the response."""
    from sqlalchemy import update as sqla_update

    sent = int(
        db.execute(
            select(func.count())
            .select_from(CampaignRecipient)
            .where(
                CampaignRecipient.campaign_id == campaign_id,
                CampaignRecipient.status == RecipientStatus.SENT,
            )
        ).scalar_one()
    )
    failed = int(
        db.execute(
            select(func.count())
            .select_from(CampaignRecipient)
            .where(
                CampaignRecipient.campaign_id == campaign_id,
                CampaignRecipient.status == RecipientStatus.FAILED,
            )
        ).scalar_one()
    )
    db.execute(
        sqla_update(Campaign)
        .where(Campaign.id == campaign_id)
        .values(sent_count=sent, failed_count=failed)
    )
    db.commit()
    return sent, failed


def pending_count(db: Session, campaign_id: UUID) -> int:
    return int(
        db.execute(
            select(func.count())
            .select_from(CampaignRecipient)
            .where(
                CampaignRecipient.campaign_id == campaign_id,
                CampaignRecipient.status == RecipientStatus.PENDING,
            )
        ).scalar_one()
    )


def delete(db: Session, c: Campaign) -> None:
    db.delete(c)
    db.commit()
