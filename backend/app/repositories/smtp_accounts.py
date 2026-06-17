from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.smtp_account import SmtpAccount, SmtpStatus


def list_for_user(db: Session, user_id: UUID) -> list[SmtpAccount]:
    stmt = select(SmtpAccount).where(SmtpAccount.user_id == user_id).order_by(SmtpAccount.created_at.desc())
    return list(db.execute(stmt).scalars().all())


def count_for_user(db: Session, user_id: UUID) -> int:
    return int(
        db.execute(
            select(func.count()).select_from(SmtpAccount).where(SmtpAccount.user_id == user_id)
        ).scalar_one()
    )


def get_owned(db: Session, *, user_id: UUID, smtp_id: UUID) -> SmtpAccount | None:
    return db.execute(
        select(SmtpAccount).where(SmtpAccount.id == smtp_id, SmtpAccount.user_id == user_id)
    ).scalar_one_or_none()


def create(
    db: Session,
    *,
    user_id: UUID,
    email: str,
    smtp_host: str,
    smtp_port: int,
    smtp_username: str,
    encrypted_password: str,
) -> SmtpAccount:
    account = SmtpAccount(
        user_id=user_id,
        email=email,
        smtp_host=smtp_host,
        smtp_port=smtp_port,
        smtp_username=smtp_username,
        encrypted_password=encrypted_password,
    )
    db.add(account)
    db.commit()
    db.refresh(account)
    return account


def mark_verified(db: Session, account: SmtpAccount) -> SmtpAccount:
    account.status = SmtpStatus.ACTIVE
    account.last_verified_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(account)
    return account


def mark_failed(db: Session, account: SmtpAccount) -> SmtpAccount:
    account.status = SmtpStatus.FAILED
    db.commit()
    db.refresh(account)
    return account


def delete(db: Session, account: SmtpAccount) -> None:
    db.delete(account)
    db.commit()


def lock(db: Session, account: SmtpAccount) -> SmtpAccount:
    account.is_locked = True
    db.commit()
    db.refresh(account)
    return account
