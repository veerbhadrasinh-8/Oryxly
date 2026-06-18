"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { testSmtp } from "./api";
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

  return (
    <article className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium">{account.email}</p>
            <span className="rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 px-2 py-0.5 text-xs font-medium">
              🔒 Locked
            </span>
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

      <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 rounded-lg px-3 py-2">
        This SMTP account is permanently locked. Credentials cannot be changed or deleted.
      </p>

      {feedback && (
        <p className={`text-sm ${feedback.kind === "ok" ? "text-emerald-600" : "text-red-500"}`}>
          {feedback.msg}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
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
          {testMutation.isPending && testMutation.variables?.sendReal ? "Sending…" : "Send test to me"}
        </button>
      </div>
    </article>
  );
}
