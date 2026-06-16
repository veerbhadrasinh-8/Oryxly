from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr


class LogEntry(BaseModel):
    """One row per (campaign, recipient). Currently derived from
    campaign_recipients joined with contacts and campaigns; if the spec
    ever requires per-attempt history we'd back this with a separate
    email_logs table without changing the response shape."""

    recipient_id: UUID
    campaign_id: UUID
    campaign_name: str
    email: EmailStr
    contact_name: str | None
    company: str | None
    status: str  # pending|sent|failed|bounced
    attempt_count: int
    sent_at: datetime | None
    last_attempt_at: datetime | None
    error_message: str | None
    created_at: datetime


class LogsResponse(BaseModel):
    items: list[LogEntry]
    page: int
    limit: int
    total: int


class CampaignLogsResponse(BaseModel):
    logs: list[LogEntry]
