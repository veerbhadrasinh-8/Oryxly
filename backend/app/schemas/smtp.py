from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class SmtpCreate(BaseModel):
    email: EmailStr
    smtp_host: str = Field(min_length=1, max_length=255)
    smtp_port: int = Field(ge=1, le=65535)
    smtp_username: str = Field(min_length=1, max_length=255)
    smtp_password: str = Field(min_length=1, max_length=512)


class SmtpRead(BaseModel):
    id: UUID
    email: EmailStr
    smtp_host: str
    smtp_port: int
    smtp_username: str
    status: str
    is_locked: bool = False
    last_verified_at: datetime | None
    created_at: datetime


class SmtpCreateResponse(BaseModel):
    success: bool = True
    smtp_id: UUID


class SmtpTestResponse(BaseModel):
    success: bool
    message: str


class SmtpDeleteResponse(BaseModel):
    success: bool = True


class SmtpLockResponse(BaseModel):
    success: bool = True
    message: str = "SMTP account locked permanently"


class SmtpSendTestRequest(BaseModel):
    to_email: EmailStr | None = None
