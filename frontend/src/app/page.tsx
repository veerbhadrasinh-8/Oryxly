"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/stores/auth";

export default function Home() {
  const router = useRouter();
  const token = useAuth((s) => s.accessToken);
  const hasHydrated = useAuth.persist?.hasHydrated() ?? true;

  useEffect(() => {
    if (!hasHydrated) return;
    router.replace(token ? "/dashboard" : "/login");
  }, [token, hasHydrated, router]);

  return (
    <main className="flex min-h-screen items-center justify-center text-sm text-neutral-500 font-sans">
      ORYXLY
    </main>
  );
}
