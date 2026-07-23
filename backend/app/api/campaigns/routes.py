from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.plans import CAMPAIGNS_PER_MONTH_LIMIT
from app.services.audit import record as audit
from app.database.session import get_db
from app.models.campaign import Campaign, CampaignStatus
from app.models.smtp_account import SmtpStatus
from app.models.user import User
from app.repositories import (
    campaigns as campaigns_repo,
    contacts as contacts_repo,
    smtp_accounts as smtp_repo,
)
from app.schemas.campaigns import (
    CampaignCreate,
    CampaignCreateResponse,
    CampaignDetail,
    CampaignListResponse,
    CampaignPreviewRequest,
    CampaignPreviewResponse,
    CampaignSummary,
    CancelResponse,
    DeleteResponse,
    LaunchResponse,
)
from app.services.templates import build_contact_render_data, extract_variables, render

router = APIRouter(prefix="/campaigns", tags=["campaigns"])


def _summary(c: Campaign) -> CampaignSummary:
    return CampaignSummary(
        id=c.id,
        name=c.name,
        status=c.status.value,
        total_recipients=c.total_recipients,
        sent_count=c.sent_count,
        failed_count=c.failed_count,
        created_at=c.created_at,
        started_at=c.started_at,
        completed_at=c.completed_at,
    )


@router.get("", response_model=CampaignListResponse)
def list_campaigns(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    status_filter: str | None = Query(default=None, alias="status"),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CampaignListResponse:
    parsed_status: CampaignStatus | None = None
    if status_filter:
        try:
            parsed_status = CampaignStatus(status_filter)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"invalid status: {status_filter}")
    items, total = campaigns_repo.list_for_user(
        db, user_id=user.id, status=parsed_status, page=page, limit=limit
    )
    return CampaignListResponse(
        items=[_summary(c) for c in items], page=page, limit=limit, total=total
    )


@router.post("/preview", response_model=CampaignPreviewResponse)
def preview_campaign(
    payload: CampaignPreviewRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CampaignPreviewResponse:
    cl = contacts_repo.get_owned(db, user_id=user.id, list_id=payload.contact_list_id)
    if cl is None:
        raise HTTPException(status_code=404, detail="contact list not found")
    contact = contacts_repo.get_sample_contact(db, list_id=cl.id)
    if contact is None:
        raise HTTPException(status_code=400, detail="contact list has no contacts")
    data = build_contact_render_data(contact)
    to_email = data.get(payload.to_variable) or contact.email
    return CampaignPreviewResponse(
        to=to_email,
        subject=render(payload.subject, data),
        html_body=render(payload.html_body, data),
    )


@router.post("", response_model=CampaignCreateResponse, status_code=status.HTTP_201_CREATED)
def create_campaign(
    payload: CampaignCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CampaignCreateResponse:
    smtp = smtp_repo.get_owned(db, user_id=user.id, smtp_id=payload.smtp_account_id)
    if smtp is None:
        raise HTTPException(status_code=404, detail="SMTP account not found")
    if smtp.status != SmtpStatus.ACTIVE:
        raise HTTPException(status_code=400, detail="SMTP account is not active - verify it first")

    cl = contacts_repo.get_owned(db, user_id=user.id, list_id=payload.contact_list_id)
    if cl is None:
        raise HTTPException(status_code=404, detail="contact list not found")
    if cl.valid_contacts == 0:
        raise HTTPException(status_code=400, detail="contact list has no valid recipients")

    # Validate all variables used in subject/body are in selected_columns
    selected_set = set(payload.selected_columns)
    used_vars = extract_variables(payload.subject, payload.html_body)
    unknown = [v for v in used_vars if v not in selected_set]
    if unknown:
        raise HTTPException(
            status_code=422,
            detail=f"unknown variables: {', '.join('{{' + v + '}}' for v in unknown)}. "
                   f"Only selected columns can be used as variables.",
        )
    # Validate to_variable is in selected_columns so the recipient address resolves
    if payload.to_variable not in selected_set:
        raise HTTPException(
            status_code=422,
            detail=f"to_variable '{{{{ {payload.to_variable} }}}}' is not in selected_columns.",
        )

    contact_ids = campaigns_repo.list_contact_ids_for_list(db, cl.id)
    if not contact_ids:
        raise HTTPException(status_code=400, detail="contact list has no contacts")

    c = campaigns_repo.create_with_recipients(
        db,
        user_id=user.id,
        name=payload.name.strip()[:255],
        smtp_account_id=smtp.id,
        list_id=cl.id,
        contact_ids=contact_ids,
        subject=payload.subject,
        html_body=payload.html_body,
        to_variable=payload.to_variable,
        selected_columns=payload.selected_columns,
    )
    return CampaignCreateResponse(campaign_id=c.id)


@router.get("/{campaign_id}", response_model=CampaignDetail)
def get_campaign(
    campaign_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CampaignDetail:
    c = campaigns_repo.get_owned(db, user_id=user.id, campaign_id=campaign_id)
    if c is None:
        raise HTTPException(status_code=404, detail="campaign not found")
    campaigns_repo.reconcile_counters(db, c.id)
    db.refresh(c)

    smtp = smtp_repo.get_owned(db, user_id=user.id, smtp_id=c.smtp_account_id)
    cl = contacts_repo.get_owned(db, user_id=user.id, list_id=c.list_id)

    base = _summary(c).model_dump()
    return CampaignDetail(
        **base,
        subject=c.subject,
        html_body=c.html_body,
        to_variable=c.to_variable,
        selected_columns=c.selected_columns,
        smtp_account_id=c.smtp_account_id,
        smtp_email=smtp.email if smtp else "(deleted)",
        list_id=c.list_id,
        list_name=cl.name if cl else "(deleted)",
        pending_count=campaigns_repo.pending_count(db, c.id),
    )


@router.post("/{campaign_id}/launch", response_model=LaunchResponse)
def launch_campaign(
    campaign_id: UUID,
    request: Request,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> LaunchResponse:
    c = campaigns_repo.get_owned(db, user_id=user.id, campaign_id=campaign_id)
    if c is None:
        raise HTTPException(status_code=404, detail="campaign not found")
    if c.status not in (CampaignStatus.DRAFT, CampaignStatus.QUEUED):
        raise HTTPException(
            status_code=400,
            detail=f"only draft or queued campaigns can be launched (current: {c.status.value})",
        )

    limit = CAMPAIGNS_PER_MONTH_LIMIT.get(user.plan)
    if limit is not None:
        used = campaigns_repo.count_started_this_month(db, user.id)
        if c.status == CampaignStatus.DRAFT and used >= limit:
            raise HTTPException(
                status_code=403,
                detail=f"plan '{user.plan.value}' allows {limit} launched campaigns per month (used {used})",
            )

    smtp = smtp_repo.get_owned(db, user_id=user.id, smtp_id=c.smtp_account_id)
    if smtp is None or smtp.status != SmtpStatus.ACTIVE:
        raise HTTPException(status_code=400, detail="SMTP account is no longer active - re-verify it")

    from app.services.github_trigger import trigger_worker_now
    from app.workers.tasks import start_campaign

    start_campaign.delay(str(c.id))
    trigger_worker_now()
    if c.status == CampaignStatus.DRAFT:
        campaigns_repo.transition_to_queued_if_draft(db, c.id)
        db.refresh(c)
    audit(db, action="campaign.launch", user_id=user.id, request=request,
          target_type="campaign", target_id=c.id,
          metadata={"recipients": c.total_recipients})
    return LaunchResponse(status=c.status.value)


@router.post("/{campaign_id}/cancel", response_model=CancelResponse)
def cancel_campaign(
    campaign_id: UUID,
    request: Request,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CancelResponse:
    c = campaigns_repo.get_owned(db, user_id=user.id, campaign_id=campaign_id)
    if c is None:
        raise HTTPException(status_code=404, detail="campaign not found")
    if c.status not in (CampaignStatus.DRAFT, CampaignStatus.QUEUED, CampaignStatus.RUNNING):
        raise HTTPException(status_code=400, detail=f"can't cancel from status {c.status.value}")
    campaigns_repo.cancel_remaining_recipients(db, c.id)
    campaigns_repo.set_status(db, c, CampaignStatus.CANCELLED, completed=True)
    audit(db, action="campaign.cancel", user_id=user.id, request=request,
          target_type="campaign", target_id=c.id)
    return CancelResponse(status=c.status.value)


@router.delete("/{campaign_id}", response_model=DeleteResponse)
def delete_campaign(
    campaign_id: UUID,
    request: Request,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DeleteResponse:
    c = campaigns_repo.get_owned(db, user_id=user.id, campaign_id=campaign_id)
    if c is None:
        raise HTTPException(status_code=404, detail="campaign not found")
    if c.status == CampaignStatus.RUNNING:
        raise HTTPException(status_code=400, detail="cancel a running campaign before deleting")
    campaigns_repo.delete(db, c)
    audit(db, action="campaign.delete", user_id=user.id, request=request,
          target_type="campaign", target_id=campaign_id)
    return DeleteResponse()
