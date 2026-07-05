from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class AdminUserRead(BaseModel):
    id: UUID
    full_name: str
    email: EmailStr
    plan: str
    monthly_email_limit: int | None
    effective_monthly_limit: int
    smtp_account_limit: int | None
    effective_smtp_limit: int
    is_active: bool
    is_admin: bool
    created_at: datetime


class AdminUserUpdate(BaseModel):
    plan: str | None = None
    is_active: bool | None = None
    monthly_email_limit: int | None = Field(default=None, ge=0)
    clear_monthly_email_limit: bool = False
    smtp_account_limit: int | None = Field(default=None, ge=1)
    clear_smtp_account_limit: bool = False


class InviteRequest(BaseModel):
    email: EmailStr


class InviteRead(BaseModel):
    id: UUID
    email: EmailStr
    is_used: bool
    created_at: datetime


class InviteResponse(BaseModel):
    success: bool = True
    invitation: InviteRead


class InviteListResponse(BaseModel):
    invitations: list[InviteRead]


class AdminUserListResponse(BaseModel):
    users: list[AdminUserRead]
