from pydantic import BaseModel

from app.schemas.campaigns import CampaignSummary


class CampaignCounts(BaseModel):
    total: int
    draft: int
    queued: int
    running: int
    completed: int
    failed: int
    cancelled: int


class EmailCounts(BaseModel):
    sent: int
    failed: int
    pending: int


class SmtpCounts(BaseModel):
    total: int
    active: int


class MonthlyUsage(BaseModel):
    sent_this_month: int
    monthly_cap: int


class DashboardSummary(BaseModel):
    campaigns: CampaignCounts
    emails: EmailCounts
    smtp: SmtpCounts
    contact_lists: int
    templates: int
    monthly: MonthlyUsage


class RecentCampaignsResponse(BaseModel):
    items: list[CampaignSummary]
