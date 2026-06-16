"use client";

import { useQuery } from "@tanstack/react-query";
import { AuthGuard } from "@/features/auth/AuthGuard";
import { listSmtp } from "@/features/smtp/api";
import { SmtpCard } from "@/features/smtp/SmtpCard";
import { SmtpForm } from "@/features/smtp/SmtpForm";

function SmtpInner() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["smtp"],
    queryFn: listSmtp,
  });

  return (
    <main className="mx-auto max-w-3xl px-6 py-12 font-sans space-y-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">SMTP accounts</h1>
        <p className="text-sm text-neutral-500">
          Connect the mailbox you&apos;ll send campaigns from.
        </p>
      </header>

      <SmtpForm />

      <section className="space-y-3">
        <h2 className="text-sm font-medium uppercase text-neutral-500">Your accounts</h2>
        {isLoading && <p className="text-sm">Loading…</p>}
        {error && <p className="text-sm text-red-500">Failed to load SMTP accounts</p>}
        {data && data.length === 0 && (
          <p className="text-sm text-neutral-500">No SMTP accounts yet. Add one above.</p>
        )}
        {data?.map((account) => <SmtpCard key={account.id} account={account} />)}
      </section>
    </main>
  );
}

export default function SmtpPage() {
  return (
    <AuthGuard>
      <SmtpInner />
    </AuthGuard>
  );
}
