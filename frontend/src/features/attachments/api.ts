import { api } from "@/lib/api";
import type { Attachment } from "@/types/attachments";

export async function listAttachments() {
  const { data } = await api.get<Attachment[]>("/attachments");
  return data;
}

export async function uploadAttachment(file: File) {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<{ success: true; attachment_id: string }>(
    "/attachments",
    form,
  );
  return data;
}

export async function deleteAttachment(id: string) {
  await api.delete(`/attachments/${id}`);
}

export async function listCampaignAttachments(campaignId: string) {
  const { data } = await api.get<Attachment[]>(
    `/campaigns/${campaignId}/attachments`,
  );
  return data;
}

export async function attachToCampaign(
  campaignId: string,
  attachment_ids: string[],
) {
  const { data } = await api.post<{ success: true; attached: string[] }>(
    `/campaigns/${campaignId}/attachments`,
    { attachment_ids },
  );
  return data;
}

export async function detachFromCampaign(campaignId: string, attachmentId: string) {
  await api.delete(`/campaigns/${campaignId}/attachments/${attachmentId}`);
}

export function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
