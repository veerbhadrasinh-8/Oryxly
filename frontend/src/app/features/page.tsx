import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Features",
  description:
    "ORYXLY features: bring-your-own SMTP sending, contact upload and dedupe, variable personalization with live preview, throttled queue-based delivery with retries, encrypted credentials, and audit-grade delivery logs.",
  alternates: { canonical: "/features" },
  openGraph: { title: `Features - ${SITE_NAME}`, url: "/features" },
};

const SECTIONS = [
  {
    title: "Bring your own SMTP",
    body: "Connect any SMTP provider and send from your own domain. ORYXLY verifies the connection with a test send before you trust it with a campaign. No shared IP pools, no per-email pricing.",
  },
  {
    title: "Contact management",
    body: "Upload CSV, XLSX, or XLS files up to 10 MB. Every list is validated and deduplicated on import, so the same address is never emailed twice from one list.",
  },
  {
    title: "Personalization that previews",
    body: "Turn any column from your contact list into a variable. Reference it in the subject line or body, and render a live preview against a real sample contact before you launch.",
  },
  {
    title: "Queue-based, throttled sending",
    body: "Campaigns are queued and sent by background workers with a minimum 4-second delay between messages and automatic retries on transient failures - protecting your sender reputation.",
  },
  {
    title: "Delivery logs",
    body: "See every message as sent, failed, or pending. Searchable, exportable, and scoped to your account so you always know exactly what went out.",
  },
  {
    title: "Security by default",
    body: "SMTP credentials are encrypted at rest and never returned by the API. Passwords are hashed, sessions are token-based, and every account is fully isolated from every other tenant.",
  },
];

export default function FeaturesPage() {
  return (
    <MarketingShell>
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Features</h1>
        <p className="mt-3 text-neutral-500 max-w-xl mx-auto">
          Everything you need to run reliable, personalized email campaigns through your
          own infrastructure.
        </p>
      </div>
      <div className="mt-12 grid gap-8 md:grid-cols-2">
        {SECTIONS.map((s) => (
          <div key={s.title} className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
            <h2 className="text-lg font-semibold">{s.title}</h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{s.body}</p>
          </div>
        ))}
      </div>
    </MarketingShell>
  );
}
