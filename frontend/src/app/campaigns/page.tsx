"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AuthGuard } from "@/features/auth/AuthGuard";
import { listCampaigns } from "@/features/campaigns/api";
import { StatusPill } from "@/features/campaigns/StatusPill";
import type { CampaignStatus } from "@/types/campaigns";

const FILTERS: { label: string; value: CampaignStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Queued", value: "queued" },
  { label: "Running", value: "running" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

function CampaignsInner() {
  const [filter, setFilter] = useState<CampaignStatus | "all">("all");
  const { data, isLoading } = useQuery({
    queryKey: ["campaigns", filter],
    queryFn: () =>
      listCampaigns({ status: filter === "all" ? undefined : filter, limit: 50 }),
  });

  return (
    <main className="mx-auto max-w-5xl px-6 py-12 font-sans space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Campaigns</h1>
          <p className="text-sm text-neutral-500">
            Pick an SMTP, a contact list, and a template. We&apos;ll queue it from there.
          </p>
        </div>
        <Link
          href="/campaigns/new"
          className="rounded-md bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900 px-3 py-1.5 text-sm font-medium"
        >
          New campaign
        </Link>
      </header>

      <nav className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-3 py-1 text-xs ${
              filter === f.value
                ? "bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900"
                : "border border-neutral-300 dark:border-neutral-700"
            }`}
          >
            {f.label}
          </button>
        ))}
      </nav>

      {isLoading && <p className="text-sm">Loading…</p>}
      {data && data.items.length === 0 && (
        <div className="rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 px-6 py-12 text-center">
          <p className="text-sm text-neutral-500">
            No campaigns {filter === "all" ? "yet" : `in "${filter}"`}.{" "}
            <Link href="/campaigns/new" className="underline">
              Start one
            </Link>
            .
          </p>
        </div>
      )}

      {data && data.items.length > 0 && (
        <ul className="space-y-3">
          {data.items.map((c) => (
            <li key={c.id}>
              <Link
                href={`/campaigns/${c.id}`}
                className="block rounded-xl border border-neutral-200 dark:border-neutral-800 px-5 py-4 hover:border-neutral-400 dark:hover:border-neutral-600"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{c.name}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {c.total_recipients} recipient{c.total_recipients === 1 ? "" : "s"}
                      {" · "}
                      {c.sent_count} sent · {c.failed_count} failed
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusPill status={c.status} />
                    <div className="text-xs text-neutral-500">
                      {new Date(c.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default function CampaignsPage() {
  return (
    <AuthGuard>
      <CampaignsInner />
    </AuthGuard>
  );
}
