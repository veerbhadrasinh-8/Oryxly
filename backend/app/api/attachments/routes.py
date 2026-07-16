from uuid import UUID

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database.session import get_db
from app.models.attachment import Attachment
from app.models.user import User, UserPlan
from app.repositories import (
    attachments as att_repo,
    campaigns as campaigns_repo,
)
from app.schemas.attachments import (
    AttachmentCreateResponse,
    AttachmentRead,
    AttachToCampaignRequest,
    AttachToCampaignResponse,
    DeleteResponse,
)
from app.services.storage import get_storage

router = APIRouter(tags=["attachments"])

MAX_BYTES = 10 * 1024 * 1024  # 10 MB per PRD

# (extension, MIME) - both must match. Defensive against renames.
ALLOWED: dict[str, set[str]] = {
    ".pdf": {"application/pdf"},
    ".docx": {
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    },
    ".png": {"image/png"},
    ".jpg": {"image/jpeg"},
    ".jpeg": {"image/jpeg"},
}

def _to_read(a: Attachment) -> AttachmentRead:
    return AttachmentRead(
        id=a.id,
        original_name=a.original_name,
        file_size=a.file_size,
        mime_type=a.mime_type,
        uploaded_at=a.uploaded_at,
    )


def _enforce_plan(user: User) -> None:
    pass


# ----- /attachments CRUD ----------------------------------------------------


@router.get("/attachments", response_model=list[AttachmentRead])
def list_attachments(
    user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> list[AttachmentRead]:
    return [_to_read(a) for a in att_repo.list_for_user(db, user.id)]


@router.post("/attachments", response_model=AttachmentCreateResponse, status_code=status.HTTP_201_CREATED)
async def upload_attachment(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AttachmentCreateResponse:
    _enforce_plan(user)

    filename = file.filename or "upload"
    suffix = ("." + filename.rsplit(".", 1)[-1].lower()) if "." in filename else ""
    if suffix not in ALLOWED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"unsupported type - allowed: {', '.join(sorted(ALLOWED.keys()))}",
        )

    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="empty file")
    if len(content) > MAX_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"file exceeds {MAX_BYTES // (1024 * 1024)} MB cap",
        )

    mime = (file.content_type or "").split(";")[0].strip().lower() or "application/octet-stream"
    if mime not in ALLOWED[suffix]:
        raise HTTPException(
            status_code=400,
            detail=f"file extension {suffix} doesn't match declared MIME {mime}",
        )

    storage = get_storage()
    key = storage.put(user_id=user.id, original_name=filename, content=content)

    a = att_repo.create(
        db,
        user_id=user.id,
        filename=filename[:255],
        original_name=filename[:255],
        file_size=len(content),
        mime_type=mime,
        storage_key=key,
    )
    return AttachmentCreateResponse(attachment_id=a.id)


@router.delete("/attachments/{attachment_id}", response_model=DeleteResponse)
def delete_attachment(
    attachment_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DeleteResponse:
    a = att_repo.get_owned(db, user_id=user.id, attachment_id=attachment_id)
    if a is None:
        raise HTTPException(status_code=404, detail="attachment not found")
    in_use = att_repo.campaigns_using(db, a.id)
    if in_use:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"in use by {len(in_use)} campaign(s): {', '.join(in_use[:3])}",
        )
    get_storage().delete(a.storage_key)
    att_repo.delete(db, a)
    return DeleteResponse()


# ----- campaign attach/detach ----------------------------------------------


@router.get("/campaigns/{campaign_id}/attachments", response_model=list[AttachmentRead])
def list_campaign_attachments(
    campaign_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[AttachmentRead]:
    c = campaigns_repo.get_owned(db, user_id=user.id, campaign_id=campaign_id)
    if c is None:
        raise HTTPException(status_code=404, detail="campaign not found")
    return [_to_read(a) for a in att_repo.list_for_campaign(db, campaign_id)]


@router.post(
    "/campaigns/{campaign_id}/attachments",
    response_model=AttachToCampaignResponse,
)
def attach_to_campaign(
    campaign_id: UUID,
    payload: AttachToCampaignRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AttachToCampaignResponse:
    _enforce_plan(user)
    c = campaigns_repo.get_owned(db, user_id=user.id, campaign_id=campaign_id)
    if c is None:
        raise HTTPException(status_code=404, detail="campaign not found")
    if c.status.value not in ("draft",):
        raise HTTPException(
            status_code=400,
            detail=f"can only attach to draft campaigns (current: {c.status.value})",
        )
    # Validate ownership of every attachment in the payload
    owned = att_repo.get_many_owned(db, user_id=user.id, ids=payload.attachment_ids)
    if len(owned) != len(payload.attachment_ids):
        raise HTTPException(status_code=404, detail="one or more attachments not found")
    final = att_repo.attach_to_campaign(
        db, campaign_id=campaign_id, attachment_ids=[a.id for a in owned]
    )
    return AttachToCampaignResponse(attached=final)


@router.delete(
    "/campaigns/{campaign_id}/attachments/{attachment_id}", response_model=DeleteResponse
)
def detach_from_campaign(
    campaign_id: UUID,
    attachment_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DeleteResponse:
    c = campaigns_repo.get_owned(db, user_id=user.id, campaign_id=campaign_id)
    if c is None:
        raise HTTPException(status_code=404, detail="campaign not found")
    if c.status.value not in ("draft",):
        raise HTTPException(
            status_code=400,
            detail=f"can only modify attachments on draft campaigns (current: {c.status.value})",
        )
    removed = att_repo.detach_from_campaign(
        db, campaign_id=campaign_id, attachment_id=attachment_id
    )
    if not removed:
        raise HTTPException(status_code=404, detail="attachment not linked to this campaign")
    return DeleteResponse()
