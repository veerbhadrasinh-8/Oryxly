import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { JsonLd } from "@/components/marketing/JsonLd";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "ORYXLY vs Zoho Campaigns - Best Zoho Campaigns Alternative for India",
  description:
    "ORYXLY vs Zoho Campaigns: ORYXLY sends email through your own SMTP, not Zoho shared servers. Flat INR pricing, no per-contact fees. Best Zoho Campaigns alternative for Indian SMBs.",
  alternates: { canonical: "/compare/zoho-campaigns" },
  openGraph: {
    title: `ORYXLY vs Zoho Campaigns | ${SITE_NAME}`,
    url: `${SITE_URL}/compare/zoho-campaigns`,
  },
};

const COMPARISON = [
  {
    feature: "Sending infrastructure",
    oryxly: "Your own SMTP (Gmail, Outlook, Zoho Mail, SendGrid)",
    zoho: "Zoho shared mail servers",
    winner: "oryxly",
  },
  {
    feature: "IP reputation control",
    oryxly: "100% yours - your domain, your sending history",
    zoho: "Shared with all Zoho Campaigns users",
    winner: "oryxly",
  },
  {
    feature: "Pricing currency",
    oryxly: "INR - no forex conversion",
    zoho: "USD (converted at time of payment)",
    winner: "oryxly",
  },
  {
    feature: "Starter price",
    oryxly: "Rs. 1,499/month",
    zoho: "Free up to 2,000 contacts then USD pricing",
    winner: "neutral",
  },
  {
    feature: "Per-contact fees",
    oryxly: "None - flat monthly fee only",
    zoho: "Yes - price scales with contact list size",
    winner: "oryxly",
  },
  {
    feature: "Emails per month (Starter)",
    oryxly: "5,000 included",
    zoho: "6,000 on free plan, limited on paid",
    winner: "neutral",
  },
  {
    feature: "Contact deduplication",
    oryxly: "Automatic on every upload",
    zoho: "Manual - requires user action",
    winner: "oryxly",
  },
  {
    feature: "Personalization variables",
    oryxly: "Any column from your CSV or XLSX file",
    zoho: "Fixed merge tags from contact fields only",
    winner: "oryxly",
  },
  {
    feature: "SMTP provider choice",
    oryxly: "Any SMTP - Gmail, Outlook, Zoho Mail, SendGrid",
    zoho: "Zoho infrastructure only - no SMTP choice",
    winner: "oryxly",
  },
  {
    feature: "Delivery logs",
    oryxly: "Per-message logs - sent, failed, pending with SMTP error details",
    zoho: "Campaign-level open/click reports",
    winner: "oryxly",
  },
  {
    feature: "Credential security",
    oryxly: "SMTP passwords encrypted at rest, never exposed via API",
    zoho: "No SMTP credentials needed (uses Zoho servers)",
    winner: "neutral",
  },
  {
    feature: "India-focused support",
    oryxly: "Yes - built for Indian SMBs",
    zoho: "Global product, India is one of many markets",
    winner: "oryxly",
  },
];

const FAQS = [
  {
    q: "Is ORYXLY a good alternative to Zoho Campaigns?",
    a: "Yes. ORYXLY is built for businesses that want to send email campaigns through their own SMTP server - Gmail, Outlook, Zoho Mail, or SendGrid - rather than a shared platform like Zoho Campaigns. You get full control over deliverability, sender reputation, and infrastructure. Pricing is flat monthly in INR with no per-contact fees.",
  },
  {
    q: "How is ORYXLY pricing different from Zoho Campaigns?",
    a: "ORYXLY charges a flat monthly fee in INR (starting at Rs. 1,499/month) regardless of how many contacts you have - up to your plan limit. Zoho Campaigns scales cost by contact count and bills in USD. For businesses with growing lists, ORYXLY stays predictable while Zoho costs keep climbing.",
  },
  {
    q: "Can I use Zoho Mail SMTP with ORYXLY?",
    a: "Yes. Connect your Zoho Mail account to ORYXLY as an SMTP source. Use smtp.zoho.in (India) or smtp.zoho.com (global) on port 587 with STARTTLS and an application-specific password. Your campaigns send from your own Zoho Mail domain - not Zoho Campaigns shared servers.",
  },
  {
    q: "Why send through your own SMTP instead of Zoho Campaigns?",
    a: "Zoho Campaigns sends from shared IP pools. If other senders on that pool get flagged for spam, your deliverability drops too. With ORYXLY, campaigns go out from your own domain and SMTP - your sender reputation is entirely in your hands and cannot be affected by other users.",
  },
  {
    q: "Which is better for Indian SMBs - ORYXLY or Zoho Campaigns?",
    a: "ORYXLY is designed specifically for Indian SMBs, exporters, recruiters, and agencies. It is priced in INR, requires no USD payments, and is built around bring-your-own-SMTP. Zoho Campaigns is a broader global product with USD pricing and shared infrastructure that does not give you control over your sending domain.",
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
          ORYXLY sends your email campaigns through your own SMTP, not Zoho shared servers.
          Full control over deliverability, flat INR pricing, no per-contact fees.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            href="/register"
            className="rounded-md bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900 px-6 py-3 text-sm font-medium hover:opacity-90"
          >
            Start email campaigns
          </Link>
          <Link
            href="/pricing"
            className="rounded-md border border-neutral-300 dark:border-neutral-700 px-6 py-3 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-900"
          >
            View pricing
          </Link>
        </div>
      </div>

      {/* Quick answer - AEO optimised */}
      <div className="mt-16 max-w-3xl mx-auto rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
        <h2 className="text-xl font-bold">The short answer</h2>
        <p className="mt-3 text-neutral-600 dark:text-neutral-400">
          ORYXLY is the best Zoho Campaigns alternative for Indian businesses that want to send email
          through their own SMTP. Zoho Campaigns routes your email through Zoho shared infrastructure -
          ORYXLY lets you connect Gmail, Outlook, Zoho Mail, or SendGrid as the actual sending engine.
          You own the sender reputation. Pricing is a flat monthly fee in INR with no per-contact or
          per-email charges.
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
        <h2 className="text-2xl font-bold tracking-tight mb-6">Why businesses switch from Zoho Campaigns to ORYXLY</h2>
        <div className="space-y-4">
          {[
            {
              title: "Your sender reputation, not Zoho's",
              body: "Zoho Campaigns sends from shared IPs. One bad sender on that pool can hurt your deliverability. ORYXLY routes every campaign through your own domain and SMTP - your reputation is entirely yours and cannot be impacted by other users.",
            },
            {
              title: "Flat INR pricing with no surprises",
              body: "Zoho Campaigns charges per contact and bills in USD. ORYXLY charges a flat monthly fee in INR. As your list grows, your cost stays the same - no USD conversion, no per-contact spikes.",
            },
            {
              title: "Works with Zoho Mail SMTP",
              body: "You do not have to leave Zoho Mail to use ORYXLY. Connect your Zoho Mail account via SMTP and send campaigns directly from your own @zoho.in address through ORYXLY's campaign engine.",
            },
            {
              title: "Built specifically for India",
              body: "INR pricing, designed for Indian SMBs, exporters, recruiters, and agencies. Not a global product retrofitted for India.",
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
          Connect your SMTP and send your first email campaign in under 15 minutes.
        </p>
        <Link
          href="/register"
          className="mt-6 inline-block rounded-md bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900 px-6 py-3 text-sm font-medium hover:opacity-90"
        >
          Send your first campaign
        </Link>
      </div>
    </MarketingShell>
  );
}
