import { api } from "@/lib/api";
import type {
  ContactListDetail,
  ContactListSummary,
  UploadResponse,
} from "@/types/contacts";

export async function listContactLists() {
  const { data } = await api.get<ContactListSummary[]>("/contact-lists");
  return data;
}

export async function getContactList(id: string) {
  const { data } = await api.get<ContactListDetail>(`/contact-lists/${id}`);
  return data;
}

export async function deleteContactList(id: string) {
  await api.delete(`/contact-lists/${id}`);
}

export async function uploadContacts(file: File, name?: string) {
  const form = new FormData();
  form.append("file", file);
  if (name) form.append("name", name);
  const { data } = await api.post<UploadResponse>("/contacts/upload", form);
  return data.data;
}
