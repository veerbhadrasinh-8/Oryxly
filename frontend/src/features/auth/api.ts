import { api } from "@/lib/api";
import type { LoginResponse, RegisterResponse, User } from "@/types/auth";

export async function loginRequest(email: string, password: string) {
  const { data } = await api.post<LoginResponse>("/auth/login", { email, password });
  return data.data;
}

export async function registerRequest(full_name: string, email: string, password: string) {
  const { data } = await api.post<RegisterResponse>("/auth/register", {
    full_name,
    email,
    password,
  });
  return data;
}

export async function logoutRequest() {
  await api.post("/auth/logout");
}

type MeResponse = { id: string; name: string; email: string; plan: User["plan"]; is_admin: boolean };

export async function fetchMe(): Promise<User> {
  const { data } = await api.get<MeResponse>("/auth/me");
  return { id: data.id, full_name: data.name, email: data.email, plan: data.plan, is_admin: data.is_admin ?? false };
}
