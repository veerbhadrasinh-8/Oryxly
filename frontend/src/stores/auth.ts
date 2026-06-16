import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/types/auth";

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  setSession: (s: { accessToken: string; refreshToken: string; user: User }) => void;
  setAccessToken: (token: string) => void;
  setUser: (user: User) => void;
  clear: () => void;
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setSession: ({ accessToken, refreshToken, user }) =>
        set({ accessToken, refreshToken, user }),
      setAccessToken: (token) => set({ accessToken: token }),
      setUser: (user) => set({ user }),
      clear: () => set({ accessToken: null, refreshToken: null, user: null }),
    }),
    {
      name: "mailflow-auth",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
