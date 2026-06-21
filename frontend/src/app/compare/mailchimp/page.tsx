import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { JsonLd } from "@/components/marketing/JsonLd";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "ORYXLY vs Mailchimp – Affordable Mailchimp Alternative for India",
  description:
    "ORYXLY vs Mailchimp: flat INR pricing, your own SMTP, no per-contact fees. The best affordable Mailchimp alternative for Indian SMBs, exporters, and agencies.",
  alternates: { canonical: "/compare/mailchimp" },
  openGraph: {
    title: `ORYXLY vs Mailchimp | ${SITE_NAME}`,
    url: `${SITE_URL}/compare/mailchimp`,
  },
};

const COMPARISON = [
  { feature: "Sending infrastructure",  oryxly: "Your own SMTP",              mailchimp: "Mailchimp shared servers" },
  { feature: "IP reputation",           oryxly: "Your domain, your control",   mailchimp: "Shared IP pool" },
  { feature: "Pricing currency",        oryxly: "INR (Indian Rupees)",         mailchimp: "USD only" },
  { feature: "Free plan",               oryxly: "No (paid from ₹1,499/month)", mailchimp: "Yes (500 contacts, limited)" },
  { feature: "Per-contact fees",        oryxly: "None",                        mailchimp: "Yes — price rises with list size" },
  { feature: "1,000 contacts cost",     oryxly: "₹1,499/month flat",           mailchimp: "~$13/month (~₹1,100) + usage" },
  { feature: "10,000 contacts cost",    oryxly: "₹3,499/month flat",           mailchimp: "~$100/month (~₹8,300)" },
  { feature: "SMTP provider choice",    oryxly: "Gmail, Outlook, SendGrid…",   mailchimp: "Mailchimp infrastructure only" },
  { feature: "Variable personalization",oryxly: "Any CSV/XLSX column",         mailchimp: "Merge tags (limited in free)" },
  { feature: "Delivery logs",           oryxly: "Audit-grade per message",     mailchimp: "Campaign-level reports only" },
  { feature: "India-focused support",   oryxly: "Yes",                         mailchimp: "No" },
];

const FAQS = [
  {
    q: "Is ORYXLY a good Mailchimp alternative for India?",
    a: "Yes. ORYXLY is built specifically for Indian businesses — priced in INR, designed for bring-your-own-SMTP sending, and with no per-contact fees. Mailchimp charges in USD and scales cost with list size, making it expensive for Indian SMBs with large contact lists.",
  },
  {
    q: "How does ORYXLY pricing compare to Mailchimp?",
    a: "ORYXLY charges a flat monthly fee in INR regardless of contact list size — ₹1,499/month for Starter, ₹3,499/month for Growth. Mailchimp charges per contact: at 10,000 contacts you pay ~$100/month (~₹8,300), which is more than double ORYXLY's Growth plan. As your list grows, ORYXLY becomes significantly cheaper.",
  },
  {
    q: "Does ORYXLY work without Mailchimp's shared IPs?",
    a: "Yes — that is the core difference. ORYXLY sends through your own SMTP (Gmail, Outlook, Zoho Mail, or SendGrid). Your emails never touch Mailchimp's or anyone else's shared infrastructure. Your sender reputation is entirely your own.",
  },
  {
    q: "Can I migrate my contacts from Mailchimp to ORYXLY?",
    a: "Yes. Export your contacts from Mailchimp as a CSV file, then upload that CSV directly to ORYXLY. ORYXLY validates and deduplicates the list automatically. The process takes a few minutes.",
  },
  {
    q: "What does ORYXLY have that Mailchimp doesn't?",
    a: "ORYXLY lets you send through your own SMTP server, giving you full control over deliverability and sender reputation. It is priced in INR with no per-contact fees. It is also simpler — focused on upload, personalize, and send — without the complexity of Mailchimp's automation builder, CRM, and landing page features that most Indian SMBs don't use.",
  },
];

export default function VsMailchimpPage() {
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
      { "@type": "ListItem", position: 3, name: "ORYXLY vs Mailchimp", item: `${SITE_URL}/compare/mailchimp` },
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
          ORYXLY vs Mailchimp
        </h1>
        <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
          ORYXLY is the affordable Mailchimp alternative for India — flat INR pricing,
          your own SMTP, no per-contact fees, no shared IPs.
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

      {/* Quick answer */}
      <div className="mt-16 max-w-3xl mx-auto rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
        <h2 className="text-xl font-bold">The short answer</h2>
        <p className="mt-3 text-neutral-600 dark:text-neutral-400">
          <strong>ORYXLY</strong> is the best Mailchimp alternative for Indian SMBs. Mailchimp charges in
          USD and scales cost with your contact list — at 10,000 contacts you pay ~₹8,300/month.
          ORYXLY charges ₹3,499/month flat for up to 25,000 contacts. More importantly, ORYXLY sends
          through your own SMTP — so your deliverability and sender reputation are not tied to
          Mailchimp&apos;s shared infrastructure.
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
                <th className="text-left px-5 py-3 font-semibold text-neutral-500">Mailchimp</th>
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
                  <td className="px-5 py-3 text-neutral-500">{row.mailchimp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Why switch */}
      <div className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold tracking-tight mb-6">Why Indian businesses switch from Mailchimp to ORYXLY</h2>
        <div className="space-y-4">
          {[
            {
              title: "10x cheaper at scale",
              body: "Mailchimp at 10,000 contacts costs ~₹8,300/month billed in USD. ORYXLY Growth plan covers 25,000 contacts for ₹3,499/month — flat, in INR, with no surprise charges when your list grows.",
            },
            {
              title: "No shared IP reputation risk",
              body: "Mailchimp sends from their shared IP pool. Other senders on that pool affect your deliverability. ORYXLY routes through your own Gmail, Outlook, or SendGrid — you own the reputation entirely.",
            },
            {
              title: "Simpler — no features you don't need",
              body: "Mailchimp bundles CRM, landing pages, social ads, and automation builders. Most Indian SMBs just need to upload a list and send a campaign. ORYXLY does exactly that — nothing more, nothing less.",
            },
            {
              title: "Priced in INR",
              body: "No USD conversion, no forex surprises. ORYXLY is priced in Indian Rupees for Indian businesses.",
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
        <h2 className="text-2xl font-bold tracking-tight">Switch from Mailchimp today</h2>
        <p className="mt-3 text-neutral-600 dark:text-neutral-400">
          Export your contacts from Mailchimp as CSV, upload to ORYXLY, and send your first campaign in minutes.
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
