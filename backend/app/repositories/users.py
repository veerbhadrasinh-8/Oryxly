from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User, UserPlan


def get_by_email(db: Session, email: str) -> User | None:
    return db.execute(select(User).where(User.email == email)).scalar_one_or_none()


def get_by_id(db: Session, user_id: UUID) -> User | None:
    return db.get(User, user_id)


def create(db: Session, *, full_name: str, email: str, password_hash: str) -> User:
    user = User(full_name=full_name, email=email, password_hash=password_hash)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def list_all(db: Session) -> list[User]:
    return list(db.execute(select(User).order_by(User.created_at.desc())).scalars().all())


def set_admin(db: Session, user: User, *, is_admin: bool) -> None:
    user.is_admin = is_admin
    db.commit()


def set_active(db: Session, user: User, *, is_active: bool) -> None:
    user.is_active = is_active
    db.commit()


def set_plan(db: Session, user: User, *, plan: UserPlan) -> None:
    user.plan = plan
    db.commit()


def set_monthly_email_limit(db: Session, user: User, *, limit: int | None) -> None:
    """Set or clear a user's custom monthly email cap. ``None`` reverts the
    user to their plan's default limit."""
    user.monthly_email_limit = limit
    db.commit()


def set_smtp_account_limit(db: Session, user: User, *, limit: int | None) -> None:
    """Set or clear a user's custom SMTP account limit. ``None`` reverts to plan default."""
    user.smtp_account_limit = limit
    db.commit()
