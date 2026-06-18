from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import desc, func, select, text
from sqlalchemy.orm import Session, selectinload

from app.models.contact import Contact, ContactList


def list_for_user(db: Session, user_id: UUID) -> list[ContactList]:
    return list(
        db.execute(
            select(ContactList)
            .where(ContactList.user_id == user_id)
            .order_by(desc(ContactList.created_at))
        )
        .scalars()
        .all()
    )


def total_valid_contacts(db: Session, user_id: UUID) -> int:
    """Sum of valid contacts across all of the user's lists. Used to enforce
    the plan-level contact cap before adding more."""
    return int(
        db.execute(
            select(func.coalesce(func.sum(ContactList.valid_contacts), 0))
            .where(ContactList.user_id == user_id)
        ).scalar_one()
    )


def get_owned(db: Session, *, user_id: UUID, list_id: UUID, with_contacts: bool = False) -> ContactList | None:
    stmt = select(ContactList).where(
        ContactList.id == list_id, ContactList.user_id == user_id
    )
    if with_contacts:
        stmt = stmt.options(selectinload(ContactList.contacts))
    return db.execute(stmt).scalar_one_or_none()


def create_list(db: Session, *, user_id: UUID, name: str) -> ContactList:
    cl = ContactList(user_id=user_id, name=name)
    db.add(cl)
    db.commit()
    db.refresh(cl)
    return cl


def create_list_with_contacts(
    db: Session,
    *,
    user_id: UUID,
    name: str,
    contacts: list[Contact],
    total: int,
    valid: int,
    invalid: int,
) -> ContactList:
    """Atomic: list + contacts + counts in one transaction. If any row fails to
    INSERT, the whole upload is rolled back — no orphan empty lists."""
    cl = ContactList(
        user_id=user_id,
        name=name,
        total_contacts=total,
        valid_contacts=valid,
        invalid_contacts=invalid,
    )
    db.add(cl)
    db.flush()  # get cl.id assigned without committing
    for c in contacts:
        c.list_id = cl.id
    if contacts:
        db.add_all(contacts)
    db.commit()
    db.refresh(cl)
    return cl


def add_contacts(db: Session, contacts: list[Contact]) -> None:
    if not contacts:
        return
    db.add_all(contacts)
    db.commit()


def update_counts(
    db: Session,
    cl: ContactList,
    *,
    total: int,
    valid: int,
    invalid: int,
) -> ContactList:
    cl.total_contacts = total
    cl.valid_contacts = valid
    cl.invalid_contacts = invalid
    db.commit()
    db.refresh(cl)
    return cl


def delete_list(db: Session, cl: ContactList) -> None:
    db.delete(cl)
    db.commit()


def get_sample_contact(db: Session, *, list_id: UUID) -> "Contact | None":
    """Return the first valid contact in a list, used for preview rendering."""
    return db.execute(
        select(Contact).where(Contact.list_id == list_id).limit(1)
    ).scalar_one_or_none()


def get_custom_columns(db: Session, *, list_id: UUID) -> list[str]:
    """Return sorted unique keys across all custom_data JSONB objects for a list."""
    rows = db.execute(
        text(
            "SELECT DISTINCT jsonb_object_keys(custom_data) AS k "
            "FROM contacts "
            "WHERE list_id = :list_id AND custom_data IS NOT NULL "
            "ORDER BY k"
        ),
        {"list_id": str(list_id)},
    ).fetchall()
    return [row[0] for row in rows]
