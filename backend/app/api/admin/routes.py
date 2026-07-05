from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.core.plans import effective_monthly_email_limit, effective_smtp_limit
from app.database.session import get_db
from app.models.invitation import Invitation
from app.models.user import User, UserPlan
from app.repositories import invitations as inv_repo, users as users_repo
from app.schemas.admin import (
    AdminUserListResponse,
    AdminUserRead,
    AdminUserUpdate,
    InviteListResponse,
    InviteRead,
    InviteRequest,
    InviteResponse,
)

router = APIRouter(prefix="/admin", tags=["admin"])


def _user_read(user: User) -> AdminUserRead:
    return AdminUserRead(
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        plan=user.plan.value,
        monthly_email_limit=user.monthly_email_limit,
        effective_monthly_limit=effective_monthly_email_limit(user),
        smtp_account_limit=user.smtp_account_limit,
        effective_smtp_limit=effective_smtp_limit(user),
        is_active=user.is_active,
        is_admin=user.is_admin,
        created_at=user.created_at,
    )


def _invite_read(inv) -> InviteRead:
    return InviteRead(id=inv.id, email=inv.email, is_used=inv.is_used, created_at=inv.created_at)


@router.get("/users", response_model=AdminUserListResponse)
def list_users(
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> AdminUserListResponse:
    return AdminUserListResponse(users=[_user_read(u) for u in users_repo.list_all(db)])


@router.patch("/users/{user_id}", response_model=AdminUserRead)
def update_user(
    user_id: UUID,
    payload: AdminUserUpdate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> AdminUserRead:
    user = users_repo.get_by_id(db, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="user not found")
    if user.id == admin.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="cannot modify own account via admin")
    if payload.plan is not None:
        try:
            plan = UserPlan(payload.plan)
        except ValueError:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"invalid plan: {payload.plan}")
        users_repo.set_plan(db, user, plan=plan)
    if payload.is_active is not None:
        users_repo.set_active(db, user, is_active=payload.is_active)
    if payload.clear_monthly_email_limit:
        users_repo.set_monthly_email_limit(db, user, limit=None)
    elif payload.monthly_email_limit is not None:
        users_repo.set_monthly_email_limit(db, user, limit=payload.monthly_email_limit)
    if payload.clear_smtp_account_limit:
        users_repo.set_smtp_account_limit(db, user, limit=None)
    elif payload.smtp_account_limit is not None:
        users_repo.set_smtp_account_limit(db, user, limit=payload.smtp_account_limit)
    db.refresh(user)
    return _user_read(user)


@router.get("/invitations", response_model=InviteListResponse)
def list_invitations(
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> InviteListResponse:
    return InviteListResponse(invitations=[_invite_read(i) for i in inv_repo.list_all(db)])


@router.post("/invitations", response_model=InviteResponse, status_code=status.HTTP_201_CREATED)
def create_invitation(
    payload: InviteRequest,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> InviteResponse:
    email = payload.email.lower()
    existing = inv_repo.get_by_email(db, email)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="invitation already exists for this email")
    if users_repo.get_by_email(db, email):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="user already registered")
    inv = inv_repo.create(db, email=email, invited_by=admin.id)
    return InviteResponse(invitation=_invite_read(inv))


@router.delete("/invitations/{invitation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_invitation(
    invitation_id: UUID,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> None:
    inv = db.get(Invitation, invitation_id)
    if inv is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="invitation not found")
    inv_repo.delete(db, inv)
