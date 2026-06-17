import { api } from "@/lib/api";

export type AdminUser = {
  id: string;
  full_name: string;
  email: string;
  plan: string;
  monthly_email_limit: number | null;
  effective_monthly_limit: number;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
};

export type UserUpdatePayload = {
  plan?: string;
  is_active?: boolean;
  monthly_email_limit?: number;
  clear_monthly_email_limit?: boolean;
};

export type Invitation = {
  id: string;
  email: string;
  is_used: boolean;
  created_at: string;
};

export async function listUsers(): Promise<AdminUser[]> {
  const { data } = await api.get<{ users: AdminUser[] }>("/admin/users");
  return data.users;
}

export async function updateUser(userId: string, payload: UserUpdatePayload) {
  const { data } = await api.patch<AdminUser>(`/admin/users/${userId}`, payload);
  return data;
}

export async function listInvitations(): Promise<Invitation[]> {
  const { data } = await api.get<{ invitations: Invitation[] }>("/admin/invitations");
  return data.invitations;
}

export async function createInvitation(email: string): Promise<Invitation> {
  const { data } = await api.post<{ success: true; invitation: Invitation }>("/admin/invitations", { email });
  return data.invitation;
}

export async function deleteInvitation(invId: string) {
  await api.delete(`/admin/invitations/${invId}`);
}
