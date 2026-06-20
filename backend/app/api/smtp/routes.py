from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.services.audit import record as audit
from app.core.crypto import decrypt, encrypt
from app.core.plans import SMTP_LIMIT
from app.database.session import get_db
from app.models.smtp_account import SmtpAccount
from app.models.user import User
from app.repositories import smtp_accounts as smtp_repo, usage as usage_repo
from app.schemas.smtp import (
    SmtpCreate,
    SmtpCreateResponse,
    SmtpDeleteResponse,
    SmtpLockResponse,
    SmtpRead,
    SmtpSendTestRequest,
    SmtpTestResponse,
)
from app.services.smtp import (
    SmtpCreds,
    SmtpError,
    SmtpRecipientError,
    send_test_email,
    verify_credentials,
)

router = APIRouter(prefix="/smtp", tags=["smtp"])


def _to_read(account: SmtpAccount) -> SmtpRead:
    return SmtpRead(
        id=account.id,
        email=account.email,
        smtp_host=account.smtp_host,
        smtp_port=account.smtp_port,
        smtp_username=account.smtp_username,
        status=account.status.value,
        is_locked=account.is_locked,
        last_verified_at=account.last_verified_at,
        created_at=account.created_at,
    )


def _creds(account: SmtpAccount) -> SmtpCreds:
    return SmtpCreds(
        host=account.smtp_host,
        port=account.smtp_port,
        username=account.smtp_username,
        password=decrypt(account.encrypted_password),
        from_email=account.email,
    )


@router.get("", response_model=list[SmtpRead])
def list_smtp(
    user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> list[SmtpRead]:
    return [_to_read(a) for a in smtp_repo.list_for_user(db, user.id)]


@router.post("", response_model=SmtpCreateResponse, status_code=status.HTTP_201_CREATED)
def add_smtp(
    payload: SmtpCreate,
    request: Request,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SmtpCreateResponse:
    cap = SMTP_LIMIT[user.plan]
    if smtp_repo.count_for_user(db, user.id) >= cap:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"plan '{user.plan.value}' allows up to {cap} SMTP account(s)",
        )

    # Verify creds before persisting; if it fails we refuse the create.
    creds = SmtpCreds(
        host=payload.smtp_host,
        port=payload.smtp_port,
        username=payload.smtp_username,
        password=payload.smtp_password,
        from_email=payload.email,
    )
    try:
        verify_credentials(creds)
    except SmtpError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    account = smtp_repo.create(
        db,
        user_id=user.id,
        email=payload.email.lower(),
        smtp_host=payload.smtp_host,
        smtp_port=payload.smtp_port,
        smtp_username=payload.smtp_username,
        encrypted_password=encrypt(payload.smtp_password),
    )
    smtp_repo.mark_verified(db, account)
    audit(db, action="smtp.create", user_id=user.id, request=request,
          target_type="smtp", target_id=account.id,
          metadata={"host": account.smtp_host, "email": account.email})
    return SmtpCreateResponse(smtp_id=account.id)


@router.post("/{smtp_id}/test", response_model=SmtpTestResponse)
def test_smtp(
    smtp_id: UUID,
    payload: SmtpSendTestRequest | None = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SmtpTestResponse:
    account = smtp_repo.get_owned(db, user_id=user.id, smtp_id=smtp_id)
    if account is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="smtp account not found")
    creds = _creds(account)
    try:
        if payload and payload.to_email:
            send_test_email(creds, to_email=str(payload.to_email))
        else:
            verify_credentials(creds)
    except SmtpRecipientError as exc:
        # The sender SMTP works - just the test recipient was bad. Don't
        # taint the account's verified status; surface the recipient error
        # so the user can fix the test address.
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except SmtpError as exc:
        smtp_repo.mark_failed(db, account)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    smtp_repo.mark_verified(db, account)
    return SmtpTestResponse(success=True, message="SMTP verified")


@router.post("/{smtp_id}/lock", response_model=SmtpLockResponse)
def lock_smtp(
    smtp_id: UUID,
    request: Request,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SmtpLockResponse:
    account = smtp_repo.get_owned(db, user_id=user.id, smtp_id=smtp_id)
    if account is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="smtp account not found")
    if account.is_locked:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="smtp account already locked")
    if account.status.value != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="can only lock a verified (active) smtp account",
        )
    smtp_repo.lock(db, account)
    audit(db, action="smtp.lock", user_id=user.id, request=request,
          target_type="smtp", target_id=smtp_id)
    return SmtpLockResponse()


@router.delete("/{smtp_id}", response_model=SmtpDeleteResponse)
def delete_smtp(
    smtp_id: UUID,
    request: Request,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SmtpDeleteResponse:
    account = smtp_repo.get_owned(db, user_id=user.id, smtp_id=smtp_id)
    if account is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="smtp account not found")
    if account.is_locked:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="smtp account is locked and cannot be deleted",
        )
    in_use = usage_repo.campaigns_using_smtp(db, account.id)
    if in_use:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"in use by {len(in_use)} campaign(s): {', '.join(in_use[:3])}",
        )
    smtp_repo.delete(db, account)
    audit(db, action="smtp.delete", user_id=user.id, request=request,
          target_type="smtp", target_id=smtp_id)
    return SmtpDeleteResponse()
