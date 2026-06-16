import { api } from "@/lib/api";
import type { LogEntry, LogsFilters, LogsResponse } from "@/types/logs";

export async function listLogs(filters: LogsFilters = {}) {
  const { data } = await api.get<LogsResponse>("/logs", { params: filters });
  return data;
}

export async function listCampaignLogs(campaignId: string) {
  const { data } = await api.get<{ logs: LogEntry[] }>(
    `/campaigns/${campaignId}/logs`,
  );
  return data.logs;
}
