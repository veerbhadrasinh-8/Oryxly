from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class ContactListCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)


class ContactListSummary(BaseModel):
    id: UUID
    name: str
    total_contacts: int
    valid_contacts: int
    invalid_contacts: int
    created_at: datetime


class ContactRead(BaseModel):
    id: UUID
    name: str | None
    company: str | None
    email: EmailStr
    phone: str | None
    custom_data: dict | None
    created_at: datetime


class ContactListDetail(ContactListSummary):
    contacts: list[ContactRead]


class UploadInvalidRow(BaseModel):
    row_number: int
    reason: str
    raw: dict[str, str]


class UploadStats(BaseModel):
    total: int
    valid: int
    invalid: int
    duplicates: int


class UploadResponseData(BaseModel):
    list_id: UUID
    name: str
    stats: UploadStats
    invalid_preview: list[UploadInvalidRow]


class UploadResponse(BaseModel):
    success: bool = True
    data: UploadResponseData


class DeleteResponse(BaseModel):
    success: bool = True


class ContactListColumnsResponse(BaseModel):
    """All unique column names available in a contact list.

    `builtin` are always present (name, company, email, phone).
    `custom` are extra columns harvested from uploaded CSV/XLS files.
    Together they form the full set of `{{variable}}` names usable in templates.
    """

    builtin: list[str] = ["name", "company", "email", "phone"]
    custom: list[str]
