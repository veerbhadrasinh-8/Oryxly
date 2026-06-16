from uuid import UUID

from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.models.attachment import Attachment, campaign_attachments_table
from app.models.campaign import Campaign


def list_for_user(db: Session, user_id: UUID) -> list[Attachment]:
    return list(
        db.execute(
            select(Attachment)
            .where(Attachment.user_id == user_id)
            .order_by(desc(Attachment.uploaded_at))
        )
        .scalars()
        .all()
    )


def get_owned(db: Session, *, user_id: UUID, attachment_id: UUID) -> Attachment | None:
    return db.execute(
        select(Attachment).where(
            Attachment.id == attachment_id, Attachment.user_id == user_id
        )
    ).scalar_one_or_none()


def get_many_owned(
    db: Session, *, user_id: UUID, ids: list[UUID]
) -> list[Attachment]:
    if not ids:
        return []
    return list(
        db.execute(
            select(Attachment).where(
                Attachment.user_id == user_id, Attachment.id.in_(ids)
            )
        )
        .scalars()
        .all()
    )


def create(
    db: Session,
    *,
    user_id: UUID,
    filename: str,
    original_name: str,
    file_size: int,
    mime_type: str,
    storage_key: str,
) -> Attachment:
    a = Attachment(
        user_id=user_id,
        filename=filename,
        original_name=original_name,
        file_size=file_size,
        mime_type=mime_type,
        storage_key=storage_key,
    )
    db.add(a)
    db.commit()
    db.refresh(a)
    return a


def delete(db: Session, attachment: Attachment) -> None:
    db.delete(attachment)
    db.commit()


def attach_to_campaign(
    db: Session, *, campaign_id: UUID, attachment_ids: list[UUID]
) -> list[UUID]:
    """Insert (campaign_id, attachment_id) rows, ignoring duplicates."""
    if not attachment_ids:
        return []
    existing = set(
        db.execute(
            select(campaign_attachments_table.c.attachment_id).where(
                campaign_attachments_table.c.campaign_id == campaign_id
            )
        ).scalars().all()
    )
    to_add = [aid for aid in attachment_ids if aid not in existing]
    if to_add:
        db.execute(
            campaign_attachments_table.insert(),
            [{"campaign_id": campaign_id, "attachment_id": aid} for aid in to_add],
        )
        db.commit()
    return to_add + list(existing)


def detach_from_campaign(
    db: Session, *, campaign_id: UUID, attachment_id: UUID
) -> bool:
    result = db.execute(
        campaign_attachments_table.delete().where(
            (campaign_attachments_table.c.campaign_id == campaign_id)
            & (campaign_attachments_table.c.attachment_id == attachment_id)
        )
    )
    db.commit()
    return bool(result.rowcount)


def list_for_campaign(db: Session, campaign_id: UUID) -> list[Attachment]:
    return list(
        db.execute(
            select(Attachment)
            .join(
                campaign_attachments_table,
                campaign_attachments_table.c.attachment_id == Attachment.id,
            )
            .where(campaign_attachments_table.c.campaign_id == campaign_id)
            .order_by(Attachment.uploaded_at)
        )
        .scalars()
        .all()
    )


def campaigns_using(db: Session, attachment_id: UUID) -> list[str]:
    return list(
        db.execute(
            select(Campaign.name)
            .join(
                campaign_attachments_table,
                campaign_attachments_table.c.campaign_id == Campaign.id,
            )
            .where(campaign_attachments_table.c.attachment_id == attachment_id)
        )
        .scalars()
        .all()
    )
