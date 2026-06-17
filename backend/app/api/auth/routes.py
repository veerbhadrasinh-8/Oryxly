from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import get_settings
from app.core.ratelimit import rate_limit_ip
from app.services.audit import record as audit
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.database.session import get_db
from app.models.user import User
from app.repositories import invitations as inv_repo, users as users_repo
from app.schemas.auth import (
    LoginData,
    LoginRequest,
    LoginResponse,
    LogoutResponse,
    MeResponse,
    RefreshRequest,
    RefreshResponse,
    RegisterRequest,
    RegisterResponse,
    UserPublic,
)

ADMIN_EMAIL = "oryxusofficial@gmail.com"

router = APIRouter(prefix="/auth", tags=["auth"])


def _user_public(user: User) -> UserPublic:
    return UserPublic(id=user.id, email=user.email, full_name=user.full_name, plan=user.plan.value, is_admin=user.is_admin)


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
def register(
    payload: RegisterRequest,
    request: Request,
    db: Session = Depends(get_db),
) -> RegisterResponse:
    rate_limit_ip(request, scope="register", limit=5, per_seconds=60)
    email = payload.email.lower()

    # Reject already-registered emails first so the error is unambiguous
    # regardless of invitation state.
    if users_repo.get_by_email(db, email):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="email already registered")

    # Admin email bypasses invitation check; everyone else needs an unused invitation.
    invitation = None
    if email != ADMIN_EMAIL:
        invitation = inv_repo.get_by_email(db, email)
        if invitation is None or invitation.is_used:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="registration is invitation-only",
            )

    is_admin = email == ADMIN_EMAIL
    user = users_repo.create(
        db,
        full_name=payload.full_name.strip(),
        email=email,
        password_hash=hash_password(payload.password),
    )
    if is_admin:
        users_repo.set_admin(db, user, is_admin=True)

    # Mark invitation as used after successful registration.
    if invitation is not None:
        inv_repo.mark_used(db, invitation)

    audit(db, action="user.register", user_id=user.id, request=request,
          metadata={"email": user.email})
    return RegisterResponse()


@router.post("/login", response_model=LoginResponse)
def login(
    payload: LoginRequest,
    request: Request,
    db: Session = Depends(get_db),
) -> LoginResponse:
    rate_limit_ip(request, scope="login", limit=10, per_seconds=60)
    user = users_repo.get_by_email(db, payload.email.lower())
    if user is None or not verify_password(payload.password, user.password_hash):
        audit(db, action="user.login_failed", request=request,
              metadata={"email": payload.email.lower()})
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="account disabled")
    # Bootstrap admin flag for the admin email if it somehow got cleared.
    if user.email == ADMIN_EMAIL and not user.is_admin:
        users_repo.set_admin(db, user, is_admin=True)
    audit(db, action="user.login", user_id=user.id, request=request)
    return LoginResponse(
        data=LoginData(
            access_token=create_access_token(str(user.id)),
            refresh_token=create_refresh_token(str(user.id)),
            user=_user_public(user),
        )
    )


@router.post("/refresh", response_model=RefreshResponse)
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)) -> RefreshResponse:
    try:
        user_id = decode_token(payload.refresh_token, expected_type="refresh")
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid refresh token")
    user = users_repo.get_by_id(db, UUID(user_id))
    if user is None or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="user not found")
    return RefreshResponse(access_token=create_access_token(str(user.id)))


@router.post("/logout", response_model=LogoutResponse)
def logout(_: User = Depends(get_current_user)) -> LogoutResponse:
    # MVP: client-side token discard. Stateful revocation lands with Phase 11.
    return LogoutResponse()


@router.get("/me", response_model=MeResponse)
def me(user: User = Depends(get_current_user)) -> MeResponse:
    return MeResponse(id=user.id, name=user.full_name, email=user.email, plan=user.plan.value, is_admin=user.is_admin)
