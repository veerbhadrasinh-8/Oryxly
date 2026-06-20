import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { ORG_NAME, ORG_URL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "ORYXLY is an email campaign platform built by Oryxus for Indian SMBs, exporters, recruiters, and agencies who want to send reliable, personalized email through their own SMTP.",
  alternates: { canonical: "/about" },
  openGraph: { title: `About - ${SITE_NAME}`, url: "/about" },
};

export default function AboutPage() {
  return (
    <MarketingShell>
      <article className="prose-neutral max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight">About {SITE_NAME}</h1>
        <p className="mt-6 text-neutral-600 dark:text-neutral-400">
          {SITE_NAME} is an email campaign platform built for businesses that want full
          control over how their email is sent. Instead of routing your outreach through
          shared infrastructure with unpredictable deliverability and per-email pricing,
          {" "}{SITE_NAME} sends every campaign through your own SMTP - on your domain,
          with your reputation.
        </p>
        <p className="mt-4 text-neutral-600 dark:text-neutral-400">
          We built it for the people who actually run campaigns in India: SMBs reaching
          customers, exporters following up with buyers, recruiters sourcing candidates,
          and agencies sending on behalf of clients. The product stays deliberately
          focused - upload contacts, personalize, send safely, and see exactly what
          happened.
        </p>
        <p className="mt-4 text-neutral-600 dark:text-neutral-400">
          {SITE_NAME} is made by{" "}
          <a href={ORG_URL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
            {ORG_NAME}
          </a>
          .
        </p>
      </article>
    </MarketingShell>
  );
}
