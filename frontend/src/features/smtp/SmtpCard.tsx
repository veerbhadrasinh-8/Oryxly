"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { deleteSmtp, lockSmtp, testSmtp } from "./api";
import type { SmtpAccount } from "@/types/smtp";

const statusStyles: Record<SmtpAccount["status"], string> = {
  active:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  inactive: "bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  failed: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

export function SmtpCard({ account }: { account: SmtpAccount }) {
  const qc = useQueryClient();
  const [feedback, setFeedback] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);
  const [showLockConfirm, setShowLockConfirm] = useState(false);

  const testMutation = useMutation({
    mutationFn: ({ sendReal }: { sendReal: boolean }) =>
      testSmtp(account.id, sendReal ? account.email : undefined),
    onMutate: () => setFeedback(null),
    onSuccess: () => {
      setFeedback({ kind: "ok", msg: "SMTP verified" });
      qc.invalidateQueries({ queryKey: ["smtp"] });
    },
    onError: (err) => {
      const detail = isAxiosError(err) ? err.response?.data?.detail : null;
      setFeedback({ kind: "err", msg: typeof detail === "string" ? detail : "Test failed" });
      qc.invalidateQueries({ queryKey: ["smtp"] });
    },
  });

  const lockMutation = useMutation({
    mutationFn: () => lockSmtp(account.id),
    onSuccess: () => {
      setShowLockConfirm(false);
      setFeedback({ kind: "ok", msg: "SMTP locked permanently" });
      qc.invalidateQueries({ queryKey: ["smtp"] });
    },
    onError: (err) => {
      const detail = isAxiosError(err) ? err.response?.data?.detail : null;
      setFeedback({ kind: "err", msg: typeof detail === "string" ? detail : "Lock failed" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteSmtp(account.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["smtp"] }),
    onError: (err) => {
      const detail = isAxiosError(err) ? err.response?.data?.detail : null;
      setFeedback({ kind: "err", msg: typeof detail === "string" ? detail : "Delete failed" });
    },
  });

  return (
    <article className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium">{account.email}</p>
            {account.is_locked && (
              <span className="rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 px-2 py-0.5 text-xs font-medium">
                🔒 Locked
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-500 font-mono">
            {account.smtp_host}:{account.smtp_port} · user {account.smtp_username}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[account.status]}`}
        >
          {account.status}
        </span>
      </header>

      <div className="text-xs text-neutral-500">
        Last verified:{" "}
        {account.last_verified_at
          ? new Date(account.last_verified_at).toLocaleString()
          : "never"}
      </div>

      {account.is_locked && (
        <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 rounded-lg px-3 py-2">
          This SMTP account is permanently locked. Credentials cannot be changed or deleted.
        </p>
      )}

      {feedback && (
        <p className={`text-sm ${feedback.kind === "ok" ? "text-emerald-600" : "text-red-500"}`}>
          {feedback.msg}
        </p>
      )}

      {/* Lock confirmation dialog */}
      {showLockConfirm && (
        <div className="rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-4 space-y-3">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
            Lock SMTP credentials permanently?
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-400">
            Once locked, these credentials cannot be edited or deleted. This action cannot be undone.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => lockMutation.mutate()}
              disabled={lockMutation.isPending}
              className="rounded-md bg-amber-600 text-white px-3 py-1.5 text-sm hover:bg-amber-700 disabled:opacity-50"
            >
              {lockMutation.isPending ? "Locking…" : "Yes, lock permanently"}
            </button>
            <button
              onClick={() => setShowLockConfirm(false)}
              className="rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-900"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {!account.is_locked && (
          <>
            <button
              onClick={() => testMutation.mutate({ sendReal: false })}
              disabled={testMutation.isPending}
              className="rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-900 disabled:opacity-50"
            >
              {testMutation.isPending && !testMutation.variables?.sendReal ? "Testing…" : "Verify"}
            </button>
            <button
              onClick={() => testMutation.mutate({ sendReal: true })}
              disabled={testMutation.isPending}
              className="rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-900 disabled:opacity-50"
            >
              {testMutation.isPending && testMutation.variables?.sendReal
                ? "Sending…"
                : "Send test to me"}
            </button>
            {account.status === "active" && !showLockConfirm && (
              <button
                onClick={() => setShowLockConfirm(true)}
                className="rounded-md border border-amber-400 dark:border-amber-700 text-amber-700 dark:text-amber-400 px-3 py-1.5 text-sm hover:bg-amber-50 dark:hover:bg-amber-950/20"
              >
                🔒 Lock credentials
              </button>
            )}
            <button
              onClick={() => {
                if (confirm(`Delete SMTP account ${account.email}?`)) deleteMutation.mutate();
              }}
              disabled={deleteMutation.isPending}
              className="rounded-md border border-red-300 dark:border-red-900 text-red-600 dark:text-red-400 px-3 py-1.5 text-sm hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50 ml-auto"
            >
              Delete
            </button>
          </>
        )}

        {account.is_locked && (
          <button
            onClick={() => testMutation.mutate({ sendReal: false })}
            disabled={testMutation.isPending}
            className="rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-900 disabled:opacity-50"
          >
            {testMutation.isPending ? "Testing…" : "Verify"}
          </button>
        )}
      </div>
    </article>
  );
}
