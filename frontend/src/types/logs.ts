export type RecipientStatus = "pending" | "sent" | "failed" | "bounced";

export type LogEntry = {
  recipient_id: string;
  campaign_id: string;
  campaign_name: string;
  email: string;
  contact_name: string | null;
  company: string | null;
  status: RecipientStatus;
  attempt_count: number;
  sent_at: string | null;
  last_attempt_at: string | null;
  error_message: string | null;
  created_at: string;
};

export type LogsResponse = {
  items: LogEntry[];
  page: number;
  limit: number;
  total: number;
};

export type LogsFilters = {
  status?: RecipientStatus;
  campaign_id?: string;
  search?: string;
  page?: number;
  limit?: number;
};
