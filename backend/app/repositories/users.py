from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User


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
