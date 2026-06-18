import { api } from "@/lib/api";
import type {
  CampaignCreatePayload,
  CampaignDetail,
  CampaignListResponse,
  CampaignPreviewPayload,
  CampaignPreviewResult,
  CampaignStatus,
} from "@/types/campaigns";

export async function listCampaigns(opts?: {
  page?: number;
  limit?: number;
  status?: CampaignStatus;
}) {
  const { data } = await api.get<CampaignListResponse>("/campaigns", {
    params: {
      page: opts?.page,
      limit: opts?.limit,
      status: opts?.status,
    },
  });
  return data;
}

export async function getCampaign(id: string) {
  const { data } = await api.get<CampaignDetail>(`/campaigns/${id}`);
  return data;
}

export async function createCampaign(payload: CampaignCreatePayload) {
  const { data } = await api.post<{ success: true; campaign_id: string }>(
    "/campaigns",
    payload,
  );
  return data;
}

export async function previewCampaignContent(payload: CampaignPreviewPayload) {
  const { data } = await api.post<CampaignPreviewResult>(
    "/campaigns/preview",
    payload,
  );
  return data;
}

export async function launchCampaign(id: string) {
  const { data } = await api.post<{ success: true; status: string }>(
    `/campaigns/${id}/launch`,
  );
  return data;
}

export async function cancelCampaign(id: string) {
  const { data } = await api.post<{ success: true; status: string }>(
    `/campaigns/${id}/cancel`,
  );
  return data;
}

export async function deleteCampaign(id: string) {
  await api.delete(`/campaigns/${id}`);
}
