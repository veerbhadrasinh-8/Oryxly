"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/stores/auth";
import { listInvitations, listUsers } from "@/features/admin/api";
import { UsersTable } from "@/features/admin/UsersTable";
import { InvitationsPanel } from "@/features/admin/InvitationsPanel";

type Tab = "users" | "invitations";

function AdminInner() {
  const [tab, setTab] = useState<Tab>("users");

  const usersQuery = useQuery({
    queryKey: ["admin-users"],
    queryFn: listUsers,
    enabled: tab === "users",
  });

  const invQuery = useQuery({
    queryKey: ["admin-invitations"],
    queryFn: listInvitations,
    enabled: tab === "invitations",
  });

  return (
    <main className="mx-auto max-w-5xl px-6 py-12 font-sans space-y-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Admin panel</h1>
        <p className="text-sm text-neutral-500">Manage users, quotas, and invitations.</p>
      </header>

      <div className="flex gap-1 border-b border-neutral-200 dark:border-neutral-800">
        {(["users", "invitations"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm capitalize border-b-2 transition-colors ${
              tab === t
                ? "border-neutral-900 dark:border-white font-medium"
                : "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "users" && (
        <section>
          {usersQuery.isLoading && <p className="text-sm">Loading…</p>}
          {usersQuery.error && <p className="text-sm text-red-500">Failed to load users</p>}
          {usersQuery.data && <UsersTable users={usersQuery.data} />}
        </section>
      )}

      {tab === "invitations" && (
        <section>
          {invQuery.isLoading && <p className="text-sm">Loading…</p>}
          {invQuery.error && <p className="text-sm text-red-500">Failed to load invitations</p>}
          <InvitationsPanel invitations={invQuery.data ?? []} />
        </section>
      )}
    </main>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const token = useAuth((s) => s.accessToken);
  const hasHydrated = useAuth.persist?.hasHydrated() ?? true;

  useEffect(() => {
    if (!hasHydrated) return;
    if (!token) { router.replace("/login"); return; }
    if (user && !user.is_admin) router.replace("/dashboard");
  }, [hasHydrated, token, user, router]);

  if (!hasHydrated || !token || !user?.is_admin) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-neutral-500">
        Loading…
      </div>
    );
  }

  return <AdminInner />;
}
