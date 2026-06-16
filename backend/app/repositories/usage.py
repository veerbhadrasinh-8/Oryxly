"""Reverse-lookups: which campaigns currently reference a given resource?

Used by the delete routes to fail fast with 409 instead of leaking a
Postgres IntegrityError as a 500."""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.campaign import Campaign


def campaigns_using_smtp(db: Session, smtp_id: UUID) -> list[str]:
    return list(
        db.execute(
            select(Campaign.name).where(Campaign.smtp_account_id == smtp_id)
        ).scalars().all()
    )


def campaigns_using_template(db: Session, template_id: UUID) -> list[str]:
    return list(
        db.execute(
            select(Campaign.name).where(Campaign.template_id == template_id)
        ).scalars().all()
    )


def campaigns_using_list(db: Session, list_id: UUID) -> list[str]:
    return list(
        db.execute(
            select(Campaign.name).where(Campaign.list_id == list_id)
        ).scalars().all()
    )
