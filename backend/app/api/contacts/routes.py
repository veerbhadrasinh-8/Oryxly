from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.plans import CONTACT_LIMIT
from app.database.session import get_db
from app.models.contact import Contact
from app.models.user import User
from app.repositories import contacts as contacts_repo, usage as usage_repo
from app.schemas.contacts import (
    ContactListColumnsResponse,
    ContactListCreate,
    ContactListDetail,
    ContactListSummary,
    ContactRead,
    DeleteResponse,
    UploadInvalidRow,
    UploadResponse,
    UploadResponseData,
    UploadStats,
)
from app.services.contacts_parser import ParseError, parse_upload

router = APIRouter(tags=["contacts"])

MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10 MB per business rules
ALLOWED_EXTS = {".csv", ".xlsx", ".xls"}
INVALID_PREVIEW_LIMIT = 25


# ---------- contact-lists CRUD ----------------------------------------------


@router.get("/contact-lists", response_model=list[ContactListSummary])
def list_contact_lists(
    user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> list[ContactListSummary]:
    return [_summary(cl) for cl in contacts_repo.list_for_user(db, user.id)]


@router.post("/contact-lists", response_model=ContactListSummary, status_code=status.HTTP_201_CREATED)
def create_contact_list(
    payload: ContactListCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ContactListSummary:
    cl = contacts_repo.create_list(db, user_id=user.id, name=payload.name.strip())
    return _summary(cl)


@router.get("/contact-lists/{list_id}", response_model=ContactListDetail)
def get_contact_list(
    list_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ContactListDetail:
    cl = contacts_repo.get_owned(db, user_id=user.id, list_id=list_id, with_contacts=True)
    if cl is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="contact list not found")
    return ContactListDetail(
        **_summary(cl).model_dump(),
        contacts=[
            ContactRead(
                id=c.id,
                name=c.name,
                company=c.company,
                email=c.email,
                phone=c.phone,
                custom_data=c.custom_data,
                created_at=c.created_at,
            )
            for c in cl.contacts
        ],
    )


@router.delete("/contact-lists/{list_id}", response_model=DeleteResponse)
def delete_contact_list(
    list_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DeleteResponse:
    cl = contacts_repo.get_owned(db, user_id=user.id, list_id=list_id)
    if cl is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="contact list not found")
    in_use = usage_repo.campaigns_using_list(db, cl.id)
    if in_use:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"in use by {len(in_use)} campaign(s): {', '.join(in_use[:3])}",
        )
    contacts_repo.delete_list(db, cl)
    return DeleteResponse()


# ---------- upload -----------------------------------------------------------


@router.post("/contacts/upload", response_model=UploadResponse)
async def upload_contacts(
    file: UploadFile = File(...),
    name: str | None = Form(default=None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UploadResponse:
    suffix = "." + (file.filename or "").rsplit(".", 1)[-1].lower() if "." in (file.filename or "") else ""
    if suffix not in ALLOWED_EXTS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"unsupported file type - allowed: {', '.join(sorted(ALLOWED_EXTS))}",
        )

    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="empty file")
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"file exceeds {MAX_UPLOAD_BYTES // (1024 * 1024)} MB cap",
        )

    try:
        result = parse_upload(file.filename or "upload", content)
    except ParseError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    # Plan-level contact cap (sum of valid contacts across all the user's lists).
    cap = CONTACT_LIMIT.get(user.plan)
    if cap is not None:
        existing = contacts_repo.total_valid_contacts(db, user.id)
        if existing + len(result.valid) > cap:
            headroom = max(0, cap - existing)
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    f"plan '{user.plan.value}' allows {cap} contacts. "
                    f"You have {existing}; this upload of {len(result.valid)} valid rows would exceed "
                    f"by {existing + len(result.valid) - cap}. "
                    f"Room for {headroom} more on this plan."
                ),
            )

    raw_name = (name or "").strip() or (file.filename or "Imported list")
    list_name = raw_name[:255]  # column cap

    contact_rows = [
        Contact(
            user_id=user.id,
            name=row.name,
            company=row.company,
            email=row.email,
            phone=row.phone,
            custom_data=row.custom or None,
        )
        for row in result.valid
    ]
    cl = contacts_repo.create_list_with_contacts(
        db,
        user_id=user.id,
        name=list_name,
        contacts=contact_rows,
        total=len(result.valid) + len(result.invalid),
        valid=len(result.valid),
        invalid=len(result.invalid),
    )

    return UploadResponse(
        data=UploadResponseData(
            list_id=cl.id,
            name=cl.name,
            stats=UploadStats(
                total=result.total,
                valid=len(result.valid),
                invalid=len(result.invalid),
                duplicates=result.duplicates_in_file,
            ),
            invalid_preview=[
                UploadInvalidRow(row_number=r.row_number, reason=r.reason, raw=r.raw)
                for r in result.invalid[:INVALID_PREVIEW_LIMIT]
            ],
        )
    )


@router.get("/contact-lists/{list_id}/columns", response_model=ContactListColumnsResponse)
def get_contact_list_columns(
    list_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ContactListColumnsResponse:
    cl = contacts_repo.get_owned(db, user_id=user.id, list_id=list_id)
    if cl is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="contact list not found")
    custom = contacts_repo.get_custom_columns(db, list_id=list_id)
    return ContactListColumnsResponse(custom=custom)


def _summary(cl) -> ContactListSummary:  # type: ignore[no-untyped-def]
    return ContactListSummary(
        id=cl.id,
        name=cl.name,
        total_contacts=cl.total_contacts,
        valid_contacts=cl.valid_contacts,
        invalid_contacts=cl.invalid_contacts,
        created_at=cl.created_at,
    )
