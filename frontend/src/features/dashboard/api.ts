import { api } from "@/lib/api";
import type { DashboardSummary, RecentCampaignsResponse } from "@/types/dashboard";

export async function getDashboardSummary() {
  const { data } = await api.get<DashboardSummary>("/dashboard/summary");
  return data;
}

export async function getRecentCampaigns(limit = 5) {
  const { data } = await api.get<RecentCampaignsResponse>("/dashboard/recent-campaigns", {
    params: { limit },
  });
  return data.items;
}
