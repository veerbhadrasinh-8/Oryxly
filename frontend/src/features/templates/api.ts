import { api } from "@/lib/api";
import type {
  Preview,
  Template,
  TemplateCreatePayload,
  TemplateSummary,
  TemplateUpdatePayload,
} from "@/types/templates";

export async function listTemplates() {
  const { data } = await api.get<TemplateSummary[]>("/templates");
  return data;
}

export async function getTemplate(id: string) {
  const { data } = await api.get<Template>(`/templates/${id}`);
  return data;
}

export async function createTemplate(payload: TemplateCreatePayload) {
  const { data } = await api.post<{ success: true; template_id: string }>(
    "/templates",
    payload,
  );
  return data;
}

export async function updateTemplate(id: string, payload: TemplateUpdatePayload) {
  const { data } = await api.put<Template>(`/templates/${id}`, payload);
  return data;
}

export async function deleteTemplate(id: string) {
  await api.delete(`/templates/${id}`);
}

export async function previewTemplate(
  id: string,
  sample?: { name?: string; company?: string; email?: string },
) {
  const { data } = await api.post<Preview>(`/templates/${id}/preview`, sample ?? {});
  return data;
}
