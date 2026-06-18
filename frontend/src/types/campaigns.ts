export type CampaignStatus =
  | "draft"
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export type CampaignSummary = {
  id: string;
  name: string;
  status: CampaignStatus;
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
};

export type CampaignDetail = CampaignSummary & {
  subject: string | null;
  html_body: string | null;
  to_variable: string | null;
  selected_columns: string[] | null;
  smtp_account_id: string;
  smtp_email: string;
  list_id: string;
  list_name: string;
  pending_count: number;
};

export type CampaignListResponse = {
  items: CampaignSummary[];
  page: number;
  limit: number;
  total: number;
};

export type CampaignCreatePayload = {
  name: string;
  smtp_account_id: string;
  contact_list_id: string;
  subject: string;
  html_body: string;
  to_variable: string;
  selected_columns: string[];
};

export type CampaignPreviewPayload = {
  contact_list_id: string;
  subject: string;
  html_body: string;
  to_variable: string;
};

export type CampaignPreviewResult = {
  to: string;
  subject: string;
  html_body: string;
};
