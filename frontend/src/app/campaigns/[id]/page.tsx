"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { AuthGuard } from "@/features/auth/AuthGuard";
import {
  cancelCampaign,
  deleteCampaign,
  getCampaign,
  launchCampaign,
} from "@/features/campaigns/api";
import {
  attachToCampaign,
  detachFromCampaign,
  humanSize,
  listAttachments,
  listCampaignAttachments,
} from "@/features/attachments/api";
import { StatusPill } from "@/features/campaigns/StatusPill";
import type { CampaignStatus } from "@/types/campaigns";

const ACTIVE: CampaignStatus[] = ["queued", "running"];

function Detail({ id }: { id: string }) {
  const router = useRouter();
  const qc = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["campaigns", id],
    queryFn: () => getCampaign(id),
    refetchInterval: (q) =>
      q.state.data && ACTIVE.includes(q.state.data.status) ? 5000 : false,
  });

  const launch = useMutation({
    mutationFn: () => launchCampaign(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaigns"] });
      refetch();
    },
    onError: (e) => alert(extractError(e)),
  });
  const cancel = useMutation({
    mutationFn: () => cancelCampaign(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaigns"] });
      refetch();
    },
    onError: (e) => alert(extractError(e)),
  });
  const del = useMutation({
    mutationFn: () => deleteCampaign(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaigns"] });
      router.replace("/campaigns");
    },
    onError: (e) => alert(extractError(e)),
  });

  if (isLoading) {
    return <main className="px-6 py-12 text-sm">Loading…</main>;
  }
  if (error || !data) {
    return <main className="px-6 py-12 text-sm text-red-500">Failed to load campaign</main>;
  }

  const canLaunch = data.status === "draft";
  const canCancel = ACTIVE.includes(data.status) || data.status === "draft";
  const canDelete = data.status !== "running";

  const progressPct =
    data.total_recipients > 0
      ? Math.round(((data.sent_count + data.failed_count) / data.total_recipients) * 100)
      : 0;

  return (
    <main className="mx-auto max-w-4xl px-6 py-12 font-sans space-y-8">
      <header className="flex items-start justify-between gap-3">
        <div>
          <Link href="/campaigns" className="text-sm text-neutral-500 hover:underline">
            ← Campaigns
          </Link>
          <div className="mt-2 flex items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">{data.name}</h1>
            <StatusPill status={data.status} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          {canLaunch && (
            <button
              onClick={() => launch.mutate()}
              disabled={launch.isPending}
              className="rounded-md bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900 px-3 py-1.5 text-sm font-medium disabled:opacity-50"
            >
              {launch.isPending ? "Launching…" : "Launch"}
            </button>
          )}
          {canCancel && data.status !== "draft" && (
            <button
              onClick={() => cancel.mutate()}
              disabled={cancel.isPending}
              className="rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-sm"
            >
              {cancel.isPending ? "Cancelling…" : "Cancel"}
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => {
                if (confirm(`Delete campaign "${data.name}"?`)) del.mutate();
              }}
              disabled={del.isPending}
              className="rounded-md border border-red-300 dark:border-red-900 text-red-600 dark:text-red-400 px-3 py-1.5 text-sm"
            >
              Delete
            </button>
          )}
        </div>
      </header>

      <section className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-4">
        <h2 className="text-sm font-medium uppercase text-neutral-500">Progress</h2>
        <div className="grid grid-cols-4 gap-3 text-sm">
          <Tile label="Recipients" value={data.total_recipients} />
          <Tile label="Sent" value={data.sent_count} accent="emerald" />
          <Tile label="Failed" value={data.failed_count} accent="red" />
          <Tile label="Pending" value={data.pending_count} accent="amber" />
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-neutral-500">
            <span>{progressPct}% processed</span>
            <span>
              {data.started_at ? `Started ${new Date(data.started_at).toLocaleString()}` : "Not started"}
            </span>
          </div>
          <div className="h-2 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
            <div
              className="h-full bg-neutral-900 dark:bg-neutral-100 transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-3">
        <h2 className="text-sm font-medium uppercase text-neutral-500">Configuration</h2>
        <dl className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
          <Row
            label="Sender"
            value={data.smtp_email}
            mono
            href={`/smtp`}
          />
          <Row
            label="Contact list"
            value={data.list_name}
            href={`/contacts/${data.list_id}`}
          />
          <Row
            label="Template"
            value={data.template_name}
            href={`/templates/${data.template_id}`}
          />
          <Row label="Created" value={new Date(data.created_at).toLocaleString()} />
        </dl>
      </section>

      {data.status === "queued" && (
        <div className="rounded-md border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 px-4 py-3 text-sm">
          <strong>Queued.</strong> The send engine will start delivering shortly. Recipients
          are paced 4 seconds apart.
        </div>
      )}

      {data.status === "draft" && <AttachmentsPanel campaignId={id} />}
    </main>
  );
}

function AttachmentsPanel({ campaignId }: { campaignId: string }) {
  const qc = useQueryClient();
  const linkedQ = useQuery({
    queryKey: ["campaigns", campaignId, "attachments"],
    queryFn: () => listCampaignAttachments(campaignId),
  });
  const allQ = useQuery({
    queryKey: ["attachments"],
    queryFn: listAttachments,
  });

  const attachM = useMutation({
    mutationFn: (id: string) => attachToCampaign(campaignId, [id]),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaigns", campaignId, "attachments"] });
    },
    onError: (err) => alert(extractError(err)),
  });
  const detachM = useMutation({
    mutationFn: (id: string) => detachFromCampaign(campaignId, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaigns", campaignId, "attachments"] });
    },
    onError: (err) => alert(extractError(err)),
  });

  const linkedIds = new Set((linkedQ.data ?? []).map((a) => a.id));
  const unlinked = (allQ.data ?? []).filter((a) => !linkedIds.has(a.id));

  return (
    <section className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-4">
      <header className="flex items-center justify-between">
        <h2 className="text-sm font-medium uppercase text-neutral-500">Attachments</h2>
        <Link href="/attachments" className="text-xs text-neutral-500 hover:underline">
          Manage files →
        </Link>
      </header>

      <div>
        <h3 className="text-xs font-medium uppercase text-neutral-500 mb-2">Attached</h3>
        {linkedQ.data && linkedQ.data.length === 0 ? (
          <p className="text-sm text-neutral-500">None — pick from below.</p>
        ) : (
          <ul className="space-y-1.5">
            {linkedQ.data?.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-2 rounded-md border border-neutral-200 dark:border-neutral-800 px-3 py-2">
                <div className="text-sm">
                  <span className="font-medium">{a.original_name}</span>
                  <span className="text-xs text-neutral-500 ml-2">{humanSize(a.file_size)}</span>
                </div>
                <button
                  onClick={() => detachM.mutate(a.id)}
                  className="text-xs text-red-600 hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {unlinked.length > 0 && (
        <div>
          <h3 className="text-xs font-medium uppercase text-neutral-500 mb-2">Available</h3>
          <ul className="space-y-1.5">
            {unlinked.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-2 rounded-md border border-neutral-200 dark:border-neutral-800 px-3 py-2">
                <div className="text-sm">
                  <span className="font-medium">{a.original_name}</span>
                  <span className="text-xs text-neutral-500 ml-2">{humanSize(a.file_size)}</span>
                </div>
                <button
                  onClick={() => attachM.mutate(a.id)}
                  className="text-xs text-neutral-700 dark:text-neutral-300 hover:underline"
                >
                  Attach
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function Tile({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "emerald" | "red" | "amber";
}) {
  const cls =
    accent === "emerald"
      ? "text-emerald-600 dark:text-emerald-400"
      : accent === "red"
        ? "text-red-600 dark:text-red-400"
        : accent === "amber"
          ? "text-amber-600 dark:text-amber-400"
          : "";
  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 px-3 py-2">
      <div className="text-xs uppercase text-neutral-500">{label}</div>
      <div className={`text-xl font-semibold ${cls}`}>{value}</div>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
  href,
}: {
  label: string;
  value: string;
  mono?: boolean;
  href?: string;
}) {
  const content = (
    <span className={mono ? "font-mono" : ""}>{value}</span>
  );
  return (
    <div className="space-y-0.5">
      <dt className="text-xs uppercase text-neutral-500">{label}</dt>
      <dd>
        {href ? (
          <Link href={href} className="hover:underline">
            {content}
          </Link>
        ) : (
          content
        )}
      </dd>
    </div>
  );
}

function extractError(err: unknown): string {
  if (isAxiosError(err)) {
    const detail = err.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (!err.response) {
      return `Network error (${err.message}). Refresh — the action may already have succeeded.`;
    }
    if (err.response.status === 500) {
      return "Server error 500 — backend logs should have the details.";
    }
    return `Request failed (HTTP ${err.response.status})`;
  }
  return "Action failed";
}

export default function CampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <AuthGuard>
      <Detail id={id} />
    </AuthGuard>
  );
}
