import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import { useAuth } from "@/stores/auth";
import type { RefreshResponse } from "@/types/auth";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
});

api.interceptors.request.use((config) => {
  const token = useAuth.getState().accessToken;
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const { refreshToken, setAccessToken, clear } = useAuth.getState();
  if (!refreshToken) throw new Error("no refresh token");
  try {
    const { data } = await axios.post<RefreshResponse>(
      `${api.defaults.baseURL}/auth/refresh`,
      { refresh_token: refreshToken },
    );
    setAccessToken(data.access_token);
    return data.access_token;
  } catch (err) {
    clear();
    throw err;
  }
}

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined;
    const status = error.response?.status;
    const isAuthEndpoint = original?.url?.includes("/auth/login") ||
      original?.url?.includes("/auth/refresh") ||
      original?.url?.includes("/auth/register");

    if (status === 401 && original && !original._retry && !isAuthEndpoint) {
      original._retry = true;
      try {
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
        const newToken = await refreshPromise;
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  },
);
