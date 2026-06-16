from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class TemplateCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    subject: str = Field(min_length=1, max_length=998)  # RFC 5322 line-length cap
    html_body: str = Field(min_length=1)


class TemplateUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    subject: str | None = Field(default=None, min_length=1, max_length=998)
    html_body: str | None = Field(default=None, min_length=1)


class TemplateRead(BaseModel):
    id: UUID
    name: str
    subject: str
    html_body: str
    variables: list[str]
    unknown_variables: list[str]
    created_at: datetime
    updated_at: datetime


class TemplateSummary(BaseModel):
    id: UUID
    name: str
    subject: str
    variables: list[str]
    created_at: datetime
    updated_at: datetime


class TemplateCreateResponse(BaseModel):
    success: bool = True
    template_id: UUID


class PreviewRequest(BaseModel):
    name: str | None = None
    company: str | None = None
    email: str | None = None


class PreviewResponse(BaseModel):
    subject: str
    html_body: str


class DeleteResponse(BaseModel):
    success: bool = True
