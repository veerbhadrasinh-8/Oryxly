from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database.session import get_db
from app.models.template import Template
from app.models.user import User
from app.repositories import templates as templates_repo, usage as usage_repo
from app.schemas.templates import (
    DeleteResponse,
    PreviewRequest,
    PreviewResponse,
    TemplateCreate,
    TemplateCreateResponse,
    TemplateRead,
    TemplateSummary,
    TemplateUpdate,
)
from app.services.templates import (
    extract_variables,
    render,
    sample_data,
    unknown_variables,
)

router = APIRouter(prefix="/templates", tags=["templates"])


def _read(t: Template) -> TemplateRead:
    return TemplateRead(
        id=t.id,
        name=t.name,
        subject=t.subject,
        html_body=t.html_body,
        variables=t.variables or [],
        unknown_variables=unknown_variables(t.variables or []),
        created_at=t.created_at,
        updated_at=t.updated_at,
    )


def _summary(t: Template) -> TemplateSummary:
    return TemplateSummary(
        id=t.id,
        name=t.name,
        subject=t.subject,
        variables=t.variables or [],
        created_at=t.created_at,
        updated_at=t.updated_at,
    )


@router.get("", response_model=list[TemplateSummary])
def list_templates(
    user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> list[TemplateSummary]:
    return [_summary(t) for t in templates_repo.list_for_user(db, user.id)]


@router.post("", response_model=TemplateCreateResponse, status_code=status.HTTP_201_CREATED)
def create_template(
    payload: TemplateCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> TemplateCreateResponse:
    variables = extract_variables(payload.subject, payload.html_body)
    t = templates_repo.create(
        db,
        user_id=user.id,
        name=payload.name.strip(),
        subject=payload.subject,
        html_body=payload.html_body,
        variables=variables,
    )
    return TemplateCreateResponse(template_id=t.id)


@router.get("/{template_id}", response_model=TemplateRead)
def get_template(
    template_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> TemplateRead:
    t = templates_repo.get_owned(db, user_id=user.id, template_id=template_id)
    if t is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="template not found")
    return _read(t)


@router.put("/{template_id}", response_model=TemplateRead)
def update_template(
    template_id: UUID,
    payload: TemplateUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> TemplateRead:
    t = templates_repo.get_owned(db, user_id=user.id, template_id=template_id)
    if t is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="template not found")
    if payload.name is not None:
        t.name = payload.name.strip()
    if payload.subject is not None:
        t.subject = payload.subject
    if payload.html_body is not None:
        t.html_body = payload.html_body
    if payload.subject is not None or payload.html_body is not None:
        t.variables = extract_variables(t.subject, t.html_body)
    templates_repo.update(db, t)
    return _read(t)


@router.delete("/{template_id}", response_model=DeleteResponse)
def delete_template(
    template_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DeleteResponse:
    t = templates_repo.get_owned(db, user_id=user.id, template_id=template_id)
    if t is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="template not found")
    in_use = usage_repo.campaigns_using_template(db, t.id)
    if in_use:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"in use by {len(in_use)} campaign(s): {', '.join(in_use[:3])}",
        )
    templates_repo.delete(db, t)
    return DeleteResponse()


@router.post("/{template_id}/preview", response_model=PreviewResponse)
def preview_template(
    template_id: UUID,
    payload: PreviewRequest | None = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PreviewResponse:
    t = templates_repo.get_owned(db, user_id=user.id, template_id=template_id)
    if t is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="template not found")
    data = sample_data()
    if payload:
        for k, v in payload.model_dump(exclude_none=True).items():
            data[k] = v
    return PreviewResponse(
        subject=render(t.subject, data),
        html_body=render(t.html_body, data),
    )
