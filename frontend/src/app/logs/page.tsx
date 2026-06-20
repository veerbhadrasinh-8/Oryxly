"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AuthGuard } from "@/features/auth/AuthGuard";
import { listLogs } from "@/features/logs/api";
import { LogStatusPill } from "@/features/logs/StatusPill";
import { listCampaigns } from "@/features/campaigns/api";
import type { RecipientStatus } from "@/types/logs";

const STATUS_OPTIONS: { label: string; value: RecipientStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Sent", value: "sent" },
  { label: "Failed", value: "failed" },
  { label: "Pending", value: "pending" },
  { label: "Bounced", value: "bounced" },
];

const PAGE_SIZE = 50;

function LogsInner() {
  const [statusFilter, setStatusFilter] = useState<RecipientStatus | "all">("all");
  const [campaignFilter, setCampaignFilter] = useState<string>("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const campaignsQ = useQuery({
    queryKey: ["campaigns", "all-for-logs-filter"],
    queryFn: () => listCampaigns({ limit: 100 }),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["logs", statusFilter, campaignFilter, search, page],
    queryFn: () =>
      listLogs({
        page,
        limit: PAGE_SIZE,
        status: statusFilter === "all" ? undefined : statusFilter,
        campaign_id: campaignFilter === "all" ? undefined : campaignFilter,
        search: search || undefined,
      }),
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  function onSubmitSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  function resetPage<T>(fn: (v: T) => void) {
    return (v: T) => {
      setPage(1);
      fn(v);
    };
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 font-sans space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Send logs</h1>
        <p className="text-sm text-neutral-500">
          Every recipient across every campaign. Filter by status, campaign, or search by email.
        </p>
      </header>

      <section className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s.value}
              onClick={() => resetPage(setStatusFilter)(s.value)}
              className={`rounded-full px-3 py-1 text-xs ${
                statusFilter === s.value
                  ? "bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900"
                  : "border border-neutral-300 dark:border-neutral-700"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <select
          value={campaignFilter}
          onChange={(e) => resetPage(setCampaignFilter)(e.target.value)}
          className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-2 py-1 text-sm"
        >
          <option value="all">All campaigns</option>
          {campaignsQ.data?.items.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <form onSubmit={onSubmitSearch} className="flex gap-1.5 ml-auto">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search email / name / company"
            className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-1.5 text-sm outline-none focus:border-neutral-900 dark:focus:border-neutral-200 w-64"
          />
          <button
            type="submit"
            className="rounded-md bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900 px-3 py-1.5 text-sm"
          >
            Search
          </button>
          {(search || searchInput) && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                setSearch("");
                setPage(1);
              }}
              className="rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-sm"
            >
              Clear
            </button>
          )}
        </form>
      </section>

      {isLoading && <p className="text-sm">Loading…</p>}

      {data && data.items.length === 0 && (
        <div className="rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 px-6 py-12 text-center text-sm text-neutral-500">
          No log entries match these filters.
        </div>
      )}

      {data && data.items.length > 0 && (
        <>
          <div className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 dark:bg-neutral-900/50 text-left text-xs uppercase text-neutral-500">
                <tr>
                  <th className="px-4 py-2.5">Recipient</th>
                  <th className="px-4 py-2.5">Campaign</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5 text-right">Attempts</th>
                  <th className="px-4 py-2.5">Last attempt</th>
                  <th className="px-4 py-2.5">Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {data.items.map((log) => (
                  <tr key={log.recipient_id}>
                    <td className="px-4 py-3">
                      <div className="font-mono text-xs">{log.email}</div>
                      {(log.contact_name || log.company) && (
                        <div className="text-xs text-neutral-500 mt-0.5">
                          {log.contact_name}
                          {log.contact_name && log.company && " · "}
                          {log.company}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/campaigns/${log.campaign_id}`}
                        className="hover:underline"
                      >
                        {log.campaign_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <LogStatusPill status={log.status} />
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs">
                      {log.attempt_count}
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-500">
                      {log.last_attempt_at
                        ? new Date(log.last_attempt_at).toLocaleString()
                        : log.sent_at
                          ? new Date(log.sent_at).toLocaleString()
                          : "-"}
                    </td>
                    <td className="px-4 py-3 text-xs text-red-600 dark:text-red-400 max-w-xs truncate">
                      {log.error_message ?? "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <nav className="flex items-center justify-between text-sm">
              <span className="text-neutral-500">
                Page {data.page} of {totalPages} · {data.total} total
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-sm disabled:opacity-50"
                >
                  ← Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-sm disabled:opacity-50"
                >
                  Next →
                </button>
              </div>
            </nav>
          )}
        </>
      )}
    </main>
  );
}

export default function LogsPage() {
  return (
    <AuthGuard>
      <LogsInner />
    </AuthGuard>
  );
}
