import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { JsonLd } from "@/components/marketing/JsonLd";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "ORYXLY vs Zoho Campaigns – Best Zoho Campaigns Alternative for India",
  description:
    "ORYXLY vs Zoho Campaigns: ORYXLY sends email through your own SMTP — no shared IPs, flat INR pricing, no per-contact fees. The best Zoho Campaigns alternative for Indian SMBs.",
  alternates: { canonical: "/compare/zoho-campaigns" },
  openGraph: {
    title: `ORYXLY vs Zoho Campaigns | ${SITE_NAME}`,
    url: `${SITE_URL}/compare/zoho-campaigns`,
  },
};

const COMPARISON = [
  { feature: "Sending infrastructure",  oryxly: "Your own SMTP",           zoho: "Zoho shared servers" },
  { feature: "IP reputation",           oryxly: "Your domain, your control", zoho: "Shared IP pool" },
  { feature: "Pricing model",           oryxly: "Flat monthly in INR",      zoho: "Per-contact tiers in USD" },
  { feature: "Starter price",           oryxly: "₹1,499/month",             zoho: "~₹800+ (500 contacts only)" },
  { feature: "Per-email fees",          oryxly: "None",                     zoho: "Yes, above plan limits" },
  { feature: "SMTP provider choice",    oryxly: "Gmail, Outlook, SendGrid…", zoho: "Zoho infrastructure only" },
  { feature: "Contact deduplication",   oryxly: "Automatic on upload",      zoho: "Manual" },
  { feature: "Variable personalization",oryxly: "Any CSV/XLSX column",      zoho: "Limited merge tags" },
  { feature: "Delivery logs",           oryxly: "Audit-grade per message",  zoho: "Basic reporting" },
  { feature: "Encrypted credentials",   oryxly: "Yes, decrypted at send only", zoho: "N/A (no SMTP)" },
];

const FAQS = [
  {
    q: "Is ORYXLY a good alternative to Zoho Campaigns?",
    a: "Yes. ORYXLY is purpose-built for businesses that want to send email campaigns through their own SMTP server — Gmail, Outlook, Zoho Mail, or SendGrid — rather than a shared platform like Zoho Campaigns. This gives you full control over deliverability, sender reputation, and infrastructure.",
  },
  {
    q: "How is ORYXLY pricing different from Zoho Campaigns?",
    a: "ORYXLY charges a flat monthly fee in INR (starting at ₹1,499/month) regardless of how many emails you send — up to your plan limit. Zoho Campaigns charges by contact count and adds fees when you exceed plan limits. For high-volume senders, ORYXLY is significantly more affordable.",
  },
  {
    q: "Can I use Zoho Mail SMTP with ORYXLY?",
    a: "Yes. You can connect your Zoho Mail account to ORYXLY as an SMTP source. Use smtp.zoho.in (India) or smtp.zoho.com (global) on port 587 with STARTTLS and an application-specific password. This lets you send ORYXLY campaigns through your own Zoho Mail domain.",
  },
  {
    q: "Why send through your own SMTP instead of Zoho Campaigns?",
    a: "Zoho Campaigns sends from Zoho's shared IP pool. If other senders on that pool are flagged for spam, your deliverability suffers. With ORYXLY, your campaigns send from your own domain and SMTP — so your sender reputation is entirely in your control.",
  },
  {
    q: "Which is better for Indian SMBs — ORYXLY or Zoho Campaigns?",
    a: "ORYXLY is designed specifically for Indian SMBs, exporters, recruiters, and agencies. It is priced in INR, built around bring-your-own-SMTP, and has no per-email fees. Zoho Campaigns is a broader global product that charges in USD and uses shared infrastructure.",
  },
];

export default function VsZohoCampaignsPage() {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Compare", item: `${SITE_URL}/compare` },
      { "@type": "ListItem", position: 3, name: "ORYXLY vs Zoho Campaigns", item: `${SITE_URL}/compare/zoho-campaigns` },
    ],
  };

  return (
    <MarketingShell>
      <JsonLd data={faqLd} />
      <JsonLd data={breadcrumbLd} />

      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto">
        <span className="inline-block rounded-full border border-neutral-300 dark:border-neutral-700 px-3 py-1 text-xs text-neutral-500 mb-4">
          Comparison
        </span>
        <h1 className="text-4xl font-bold tracking-tight">
          ORYXLY vs Zoho Campaigns
        </h1>
        <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
          ORYXLY sends your email campaigns through your own SMTP — not Zoho&apos;s shared servers.
          Full control over deliverability, flat INR pricing, no per-contact fees.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            href="/register"
            className="rounded-md bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900 px-6 py-3 text-sm font-medium hover:opacity-90"
          >
            Try ORYXLY free
          </Link>
          <Link
            href="/pricing"
            className="rounded-md border border-neutral-300 dark:border-neutral-700 px-6 py-3 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-900"
          >
            View pricing
          </Link>
        </div>
      </div>

      {/* Quick answer — AEO-optimised direct answer */}
      <div className="mt-16 max-w-3xl mx-auto rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
        <h2 className="text-xl font-bold">The short answer</h2>
        <p className="mt-3 text-neutral-600 dark:text-neutral-400">
          <strong>ORYXLY</strong> is the best Zoho Campaigns alternative for Indian businesses that want to
          send email through their own SMTP. Unlike Zoho Campaigns — which routes your email through
          Zoho&apos;s shared infrastructure — ORYXLY lets you connect Gmail, Outlook, Zoho Mail, or
          SendGrid as the actual sending engine. You own the sender reputation. Pricing is a flat monthly
          fee in INR with no per-contact or per-email charges.
        </p>
      </div>

      {/* Comparison table */}
      <div className="mt-12 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold tracking-tight mb-6">Feature comparison</h2>
        <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40">
                <th className="text-left px-5 py-3 font-semibold">Feature</th>
                <th className="text-left px-5 py-3 font-semibold text-neutral-900 dark:text-neutral-100">ORYXLY</th>
                <th className="text-left px-5 py-3 font-semibold text-neutral-500">Zoho Campaigns</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row, i) => (
                <tr
                  key={row.feature}
                  className={`border-b border-neutral-100 dark:border-neutral-800 last:border-0 ${i % 2 === 0 ? "" : "bg-neutral-50/50 dark:bg-neutral-900/20"}`}
                >
                  <td className="px-5 py-3 font-medium text-neutral-700 dark:text-neutral-300">{row.feature}</td>
                  <td className="px-5 py-3 text-neutral-900 dark:text-neutral-100">{row.oryxly}</td>
                  <td className="px-5 py-3 text-neutral-500">{row.zoho}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Why switch */}
      <div className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold tracking-tight mb-6">Why Indian businesses switch from Zoho Campaigns to ORYXLY</h2>
        <div className="space-y-4">
          {[
            {
              title: "Your sender reputation, not Zoho's",
              body: "Zoho Campaigns sends from shared IPs. One bad sender on that pool can hurt your deliverability. ORYXLY routes every campaign through your own domain and SMTP — your reputation stays yours.",
            },
            {
              title: "Flat INR pricing — no surprises",
              body: "Zoho Campaigns charges per contact and in USD. ORYXLY charges a flat monthly fee in INR. As your list grows, your cost doesn't spike.",
            },
            {
              title: "Works with Zoho Mail SMTP",
              body: "You don't have to leave Zoho Mail to use ORYXLY. Connect your Zoho Mail account via SMTP and send campaigns directly from your own @zoho.in address.",
            },
            {
              title: "Built for India",
              body: "INR pricing, designed for Indian SMBs, exporters, recruiters, and agencies. Not a global product with India as an afterthought.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
              <h3 className="font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{item.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold tracking-tight mb-6">Frequently asked questions</h2>
        <div className="space-y-3">
          {FAQS.map((f) => (
            <details key={f.q} className="group rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
              <summary className="cursor-pointer font-medium list-none flex justify-between items-center">
                {f.q}
                <span className="text-neutral-400 group-open:rotate-45 transition">+</span>
              </summary>
              <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">{f.a}</p>
            </details>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-16 max-w-3xl mx-auto rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 px-8 py-12 text-center">
        <h2 className="text-2xl font-bold tracking-tight">Switch from Zoho Campaigns today</h2>
        <p className="mt-3 text-neutral-600 dark:text-neutral-400">
          Connect your SMTP and send your first campaign in under 15 minutes.
        </p>
        <Link
          href="/register"
          className="mt-6 inline-block rounded-md bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900 px-6 py-3 text-sm font-medium hover:opacity-90"
        >
          Get started free
        </Link>
      </div>
    </MarketingShell>
  );
}
