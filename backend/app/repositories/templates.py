from uuid import UUID

from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.models.template import Template


def list_for_user(db: Session, user_id: UUID) -> list[Template]:
    return list(
        db.execute(
            select(Template)
            .where(Template.user_id == user_id)
            .order_by(desc(Template.updated_at))
        )
        .scalars()
        .all()
    )


def get_owned(db: Session, *, user_id: UUID, template_id: UUID) -> Template | None:
    return db.execute(
        select(Template).where(Template.id == template_id, Template.user_id == user_id)
    ).scalar_one_or_none()


def create(
    db: Session,
    *,
    user_id: UUID,
    name: str,
    subject: str,
    html_body: str,
    variables: list[str],
) -> Template:
    t = Template(
        user_id=user_id,
        name=name,
        subject=subject,
        html_body=html_body,
        variables=variables,
    )
    db.add(t)
    db.commit()
    db.refresh(t)
    return t


def update(db: Session, t: Template) -> Template:
    db.commit()
    db.refresh(t)
    return t


def delete(db: Session, t: Template) -> None:
    db.delete(t)
    db.commit()
