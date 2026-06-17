import { api } from "@/lib/api";
import type { SmtpAccount, SmtpCreatePayload } from "@/types/smtp";

export async function listSmtp() {
  const { data } = await api.get<SmtpAccount[]>("/smtp");
  return data;
}

export async function addSmtp(payload: SmtpCreatePayload) {
  const { data } = await api.post<{ success: true; smtp_id: string }>("/smtp", payload);
  return data;
}

export async function testSmtp(smtpId: string, to_email?: string) {
  const { data } = await api.post<{ success: boolean; message: string }>(
    `/smtp/${smtpId}/test`,
    to_email ? { to_email } : {},
  );
  return data;
}

export async function deleteSmtp(smtpId: string) {
  await api.delete(`/smtp/${smtpId}`);
}

export async function lockSmtp(smtpId: string) {
  const { data } = await api.post<{ success: true; message: string }>(`/smtp/${smtpId}/lock`);
  return data;
}
