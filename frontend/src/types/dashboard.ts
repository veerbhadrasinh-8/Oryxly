import type { CampaignSummary } from "./campaigns";

export type DashboardSummary = {
  campaigns: {
    total: number;
    draft: number;
    queued: number;
    running: number;
    completed: number;
    failed: number;
    cancelled: number;
  };
  emails: { sent: number; failed: number; pending: number };
  smtp: { total: number; active: number };
  contact_lists: number;
  templates: number;
  monthly: { sent_this_month: number; monthly_cap: number };
};

export type RecentCampaignsResponse = { items: CampaignSummary[] };
