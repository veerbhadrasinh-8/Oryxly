from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status as http_status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database.session import get_db
from app.models.campaign import RecipientStatus
from app.models.user import User
from app.repositories import campaigns as campaigns_repo, logs as logs_repo
from app.schemas.logs import CampaignLogsResponse, LogEntry, LogsResponse

router = APIRouter(tags=["logs"])


def _parse_status(raw: str | None) -> RecipientStatus | None:
    if raw is None:
        return None
    try:
        return RecipientStatus(raw)
    except ValueError:
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail=f"invalid status '{raw}' — allowed: {', '.join(s.value for s in RecipientStatus)}",
        )


@router.get("/logs", response_model=LogsResponse)
def list_logs(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=50, ge=1, le=200),
    status: str | None = Query(default=None),
    campaign_id: UUID | None = Query(default=None),
    search: str | None = Query(default=None, max_length=255),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> LogsResponse:
    parsed_status = _parse_status(status)
    rows, total = logs_repo.query_logs(
        db,
        user_id=user.id,
        status=parsed_status,
        campaign_id=campaign_id,
        search=search.strip() if search else None,
        page=page,
        limit=limit,
    )
    return LogsResponse(
        items=[LogEntry(**_serialize(r)) for r in rows],
        page=page,
        limit=limit,
        total=total,
    )


@router.get("/campaigns/{campaign_id}/logs", response_model=CampaignLogsResponse)
def campaign_logs(
    campaign_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CampaignLogsResponse:
    # Ownership check on the campaign itself
    c = campaigns_repo.get_owned(db, user_id=user.id, campaign_id=campaign_id)
    if c is None:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="campaign not found")
    rows = logs_repo.query_campaign_logs(db, user_id=user.id, campaign_id=campaign_id)
    return CampaignLogsResponse(logs=[LogEntry(**_serialize(r)) for r in rows])


def _serialize(row: dict) -> dict:
    # Enum → string for response
    out = dict(row)
    if hasattr(out["status"], "value"):
        out["status"] = out["status"].value
    return out
