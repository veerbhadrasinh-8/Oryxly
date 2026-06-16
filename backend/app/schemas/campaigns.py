from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class CampaignCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    template_id: UUID
    smtp_account_id: UUID
    contact_list_id: UUID


class CampaignSummary(BaseModel):
    id: UUID
    name: str
    status: str
    total_recipients: int
    sent_count: int
    failed_count: int
    created_at: datetime
    started_at: datetime | None
    completed_at: datetime | None


class CampaignDetail(CampaignSummary):
    template_id: UUID
    template_name: str
    smtp_account_id: UUID
    smtp_email: str
    list_id: UUID
    list_name: str
    pending_count: int


class CampaignCreateResponse(BaseModel):
    success: bool = True
    campaign_id: UUID


class CampaignListResponse(BaseModel):
    items: list[CampaignSummary]
    page: int
    limit: int
    total: int


class LaunchResponse(BaseModel):
    success: bool = True
    status: str


class CancelResponse(BaseModel):
    success: bool = True
    status: str


class DeleteResponse(BaseModel):
    success: bool = True
