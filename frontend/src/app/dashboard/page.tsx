"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AuthGuard } from "@/features/auth/AuthGuard";
import { fetchMe } from "@/features/auth/api";
import { getDashboardSummary, getRecentCampaigns } from "@/features/dashboard/api";
import { StatusPill } from "@/features/campaigns/StatusPill";

function DashboardInner() {
  const meQ = useQuery({ queryKey: ["me"], queryFn: fetchMe });
  const summaryQ = useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: getDashboardSummary,
    refetchInterval: 10_000,
  });
  const recentQ = useQuery({
    queryKey: ["dashboard", "recent"],
    queryFn: () => getRecentCampaigns(5),
    refetchInterval: 10_000,
  });

  const s = summaryQ.data;
  const monthlyPct =
    s && s.monthly.monthly_cap > 0
      ? Math.min(100, Math.round((s.monthly.sent_this_month / s.monthly.monthly_cap) * 100))
      : 0;

  if (summaryQ.error) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12 font-sans">
        <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 px-6 py-8 text-center space-y-2">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">
            Dashboard failed to load
          </p>
          <p className="text-xs text-neutral-500">
            The server returned an error. Check that the backend and Redis are running.
          </p>
          <button
            onClick={() => summaryQ.refetch()}
            className="mt-2 text-xs text-neutral-700 dark:text-neutral-300 underline"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 font-sans space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {meQ.data ? `Welcome, ${meQ.data.full_name.split(" ")[0]}` : "Dashboard"}
          </h1>
          <p className="text-sm text-neutral-500">
            {meQ.data ? `${meQ.data.plan} plan · ${meQ.data.email}` : "Loading…"}
          </p>
        </div>
        <Link
          href="/campaigns/new"
          className="rounded-md bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900 px-3 py-1.5 text-sm font-medium"
        >
          New campaign
        </Link>
      </header>

      <section className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total campaigns"
          value={s?.campaigns.total ?? "—"}
          sub={
            s
              ? `${s.campaigns.completed} completed · ${s.campaigns.running + s.campaigns.queued} active`
              : ""
          }
          href="/campaigns"
        />
        <KpiCard
          label="Emails sent"
          value={s?.emails.sent ?? "—"}
          sub={s ? `${s.emails.failed} failed · ${s.emails.pending} pending` : ""}
          accent="emerald"
          href="/logs?status=sent"
        />
        <KpiCard
          label="SMTP active"
          value={s ? `${s.smtp.active}/${s.smtp.total}` : "—"}
          sub="verified senders"
          href="/smtp"
        />
        <KpiCard
          label="Monthly quota"
          value={s ? `${s.monthly.sent_this_month}/${s.monthly.monthly_cap}` : "—"}
          sub={s ? `${monthlyPct}% of monthly cap` : ""}
          accent={monthlyPct >= 90 ? "red" : monthlyPct >= 60 ? "amber" : undefined}
        />
      </section>

      <section>
        <h2 className="text-sm font-medium uppercase text-neutral-500 mb-3">Quick actions</h2>
        <div className="grid gap-2 grid-cols-2 lg:grid-cols-4">
          <QuickAction
            href="/smtp"
            title="SMTP accounts"
            subtitle={s ? `${s.smtp.total} configured` : ""}
          />
          <QuickAction
            href="/contacts"
            title="Contacts"
            subtitle={s ? `${s.contact_lists} list${s.contact_lists === 1 ? "" : "s"}` : ""}
          />
          <QuickAction href="/logs" title="Send logs" subtitle="filter + search" />
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium uppercase text-neutral-500">
            Recent campaigns
          </h2>
          <Link href="/campaigns" className="text-xs text-neutral-500 hover:underline">
            View all →
          </Link>
        </div>
        {recentQ.isLoading && <p className="text-sm">Loading…</p>}
        {recentQ.error && (
          <p className="text-sm text-red-500">
            Failed to load recent campaigns.{" "}
            <button onClick={() => recentQ.refetch()} className="underline">Retry</button>
          </p>
        )}
        {recentQ.data && recentQ.data.length === 0 && (
          <div className="rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 px-6 py-10 text-center text-sm text-neutral-500">
            No campaigns yet.{" "}
            <Link href="/campaigns/new" className="underline">
              Create your first one
            </Link>
            .
          </div>
        )}
        {recentQ.data && recentQ.data.length > 0 && (
          <ul className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-800">
            {recentQ.data.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/campaigns/${c.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-900/40"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{c.name}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {c.sent_count} sent · {c.failed_count} failed · {c.total_recipients} total
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusPill status={c.status} />
                    <span className="text-xs text-neutral-500 w-20 text-right">
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function KpiCard({
  label,
  value,
  sub,
  accent,
  href,
}: {
  label: string;
  value: number | string;
  sub: string;
  accent?: "emerald" | "amber" | "red";
  href?: string;
}) {
  const accentCls =
    accent === "emerald"
      ? "text-emerald-600 dark:text-emerald-400"
      : accent === "amber"
        ? "text-amber-600 dark:text-amber-400"
        : accent === "red"
          ? "text-red-600 dark:text-red-400"
          : "";

  const inner = (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 hover:border-neutral-400 dark:hover:border-neutral-600 transition">
      <div className="text-xs uppercase text-neutral-500">{label}</div>
      <div className={`text-3xl font-semibold mt-1 ${accentCls}`}>{value}</div>
      {sub && <div className="text-xs text-neutral-500 mt-1">{sub}</div>}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

function QuickAction({
  href,
  title,
  subtitle,
}: {
  href: string;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 hover:border-neutral-400 dark:hover:border-neutral-600 transition"
    >
      <div className="text-sm font-medium">{title} →</div>
      {subtitle && <div className="text-xs text-neutral-500 mt-0.5">{subtitle}</div>}
    </Link>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardInner />
    </AuthGuard>
  );
}
