from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.invitation import Invitation


def get_by_email(db: Session, email: str) -> Invitation | None:
    return db.execute(select(Invitation).where(Invitation.email == email)).scalar_one_or_none()


def list_all(db: Session) -> list[Invitation]:
    return list(db.execute(select(Invitation).order_by(Invitation.created_at.desc())).scalars().all())


def create(db: Session, *, email: str, invited_by: UUID | None) -> Invitation:
    inv = Invitation(email=email.lower(), invited_by=invited_by)
    db.add(inv)
    db.commit()
    db.refresh(inv)
    return inv


def mark_used(db: Session, invitation: Invitation) -> None:
    invitation.is_used = True
    db.commit()


def delete(db: Session, invitation: Invitation) -> None:
    db.delete(invitation)
    db.commit()
