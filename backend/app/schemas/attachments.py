from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class AttachmentRead(BaseModel):
    id: UUID
    original_name: str
    file_size: int
    mime_type: str
    uploaded_at: datetime


class AttachmentCreateResponse(BaseModel):
    success: bool = True
    attachment_id: UUID


class AttachToCampaignRequest(BaseModel):
    attachment_ids: list[UUID]


class AttachToCampaignResponse(BaseModel):
    success: bool = True
    attached: list[UUID]


class DeleteResponse(BaseModel):
    success: bool = True
