import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { JsonLd } from "@/components/marketing/JsonLd";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "ORYXLY vs Mailchimp - Affordable Mailchimp Alternative for India",
  description:
    "ORYXLY vs Mailchimp: flat INR pricing, your own SMTP, no per-contact fees. The most affordable Mailchimp alternative for Indian SMBs, exporters, and agencies.",
  alternates: { canonical: "/compare/mailchimp" },
  openGraph: {
    title: `ORYXLY vs Mailchimp | ${SITE_NAME}`,
    url: `${SITE_URL}/compare/mailchimp`,
  },
};

const COMPARISON = [
  {
    feature: "Sending infrastructure",
    oryxly: "Your own SMTP (Gmail, Outlook, Zoho Mail, SendGrid)",
    mailchimp: "Mailchimp shared servers and IP pools",
  },
  {
    feature: "IP reputation control",
    oryxly: "100% yours - your domain, your sending history",
    mailchimp: "Shared with all Mailchimp users on the same pool",
  },
  {
    feature: "Pricing currency",
    oryxly: "INR - no forex conversion or USD surprises",
    mailchimp: "USD only - price changes with rupee exchange rate",
  },
  {
    feature: "Free plan",
    oryxly: "No free plan - paid from Rs. 1,499/month",
    mailchimp: "Yes - up to 500 contacts, 1,000 emails/month (limited)",
  },
  {
    feature: "Per-contact pricing",
    oryxly: "None - flat fee regardless of list size",
    mailchimp: "Yes - price rises as your contact count grows",
  },
  {
    feature: "Cost at 10,000 contacts",
    oryxly: "Rs. 3,499/month (Growth plan, up to 25,000 contacts)",
    mailchimp: "~$100/month (~Rs. 8,300) on Essentials plan",
  },
  {
    feature: "Cost at 25,000 contacts",
    oryxly: "Rs. 3,499/month (same Growth plan)",
    mailchimp: "~$230/month (~Rs. 19,000+)",
  },
  {
    feature: "SMTP provider choice",
    oryxly: "Any SMTP - Gmail, Outlook, Zoho Mail, SendGrid",
    mailchimp: "Mailchimp infrastructure only - no SMTP choice",
  },
  {
    feature: "Contact file formats",
    oryxly: "CSV, XLSX, XLS up to 10 MB",
    mailchimp: "CSV and TXT only",
  },
  {
    feature: "Variable personalization",
    oryxly: "Any column from your CSV or XLSX - live preview before send",
    mailchimp: "Merge tags from contact fields - no live preview on free",
  },
  {
    feature: "Delivery logs",
    oryxly: "Per-message logs with SMTP error details for every send",
    mailchimp: "Campaign-level open and click stats, no per-message SMTP logs",
  },
  {
    feature: "Auto-retry on failure",
    oryxly: "Yes - automatic retry with configurable backoff",
    mailchimp: "No - failed sends require manual re-send",
  },
  {
    feature: "India-focused",
    oryxly: "Yes - INR pricing, built for Indian SMBs",
    mailchimp: "Global product, no India-specific pricing or support",
  },
];

const FAQS = [
  {
    q: "Is ORYXLY a good Mailchimp alternative for India?",
    a: "Yes. ORYXLY is built for Indian businesses - priced in INR with no per-contact fees. At 10,000 contacts, Mailchimp costs ~Rs. 8,300/month in USD. ORYXLY Growth plan covers up to 25,000 contacts for Rs. 3,499/month flat. ORYXLY also sends through your own SMTP so your deliverability is not tied to Mailchimp shared servers.",
  },
  {
    q: "How does ORYXLY pricing compare to Mailchimp?",
    a: "ORYXLY charges a flat monthly fee in INR regardless of contact list size. Mailchimp charges per contact in USD: at 10,000 contacts you pay ~$100/month (~Rs. 8,300), at 25,000 contacts ~$230/month (~Rs. 19,000+). ORYXLY Growth plan covers 25,000 contacts for Rs. 3,499/month - about 5x cheaper at that scale.",
  },
  {
    q: "Does ORYXLY use shared IPs like Mailchimp?",
    a: "No. ORYXLY sends through your own SMTP server - Gmail, Outlook, Zoho Mail, or SendGrid. Your emails never go through shared infrastructure. Mailchimp routes everything through their own shared IP pools, which means another sender's bad behaviour can affect your deliverability.",
  },
  {
    q: "Can I migrate my contacts from Mailchimp to ORYXLY?",
    a: "Yes. Export your contacts from Mailchimp as a CSV file, then upload that CSV directly to ORYXLY. ORYXLY validates and deduplicates the list automatically. The migration takes a few minutes and requires no technical knowledge.",
  },
  {
    q: "What does ORYXLY not have compared to Mailchimp?",
    a: "ORYXLY does not include Mailchimp features like marketing automation workflows, landing page builder, social media ads, CRM, or website builder. ORYXLY is focused on one thing - sending personalized bulk email campaigns through your own SMTP with reliable delivery and full logs. If you need only email campaigns and not a full marketing suite, ORYXLY is simpler and more affordable.",
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
          The affordable Mailchimp alternative for India. Flat INR pricing,
          your own SMTP, no per-contact fees, no shared IP reputation risk.
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

      {/* Quick answer */}
      <div className="mt-16 max-w-3xl mx-auto rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
        <h2 className="text-xl font-bold">The short answer</h2>
        <p className="mt-3 text-neutral-600 dark:text-neutral-400">
          ORYXLY is the best Mailchimp alternative for Indian SMBs. Mailchimp charges in USD
          and scales cost with your contact list - at 10,000 contacts you pay ~Rs. 8,300/month.
          ORYXLY charges Rs. 3,499/month flat for up to 25,000 contacts. More importantly, ORYXLY
          sends through your own SMTP so your deliverability is not tied to Mailchimp shared
          infrastructure.
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
        <p className="mt-2 text-xs text-neutral-400">Mailchimp pricing approximate based on published rates. Exchange rate used: 1 USD = Rs. 84.</p>
      </div>

      {/* Why switch */}
      <div className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold tracking-tight mb-6">Why Indian businesses switch from Mailchimp to ORYXLY</h2>
        <div className="space-y-4">
          {[
            {
              title: "5x cheaper at scale",
              body: "Mailchimp at 10,000 contacts costs ~Rs. 8,300/month billed in USD. ORYXLY Growth plan covers 25,000 contacts for Rs. 3,499/month flat in INR. No forex risk, no per-contact spikes as your list grows.",
            },
            {
              title: "No shared IP reputation risk",
              body: "Mailchimp sends from their shared IP pool. Other senders on that pool affect your deliverability. ORYXLY routes through your own Gmail, Outlook, or SendGrid - you own the reputation entirely.",
            },
            {
              title: "Simpler - no features you do not need",
              body: "Mailchimp bundles CRM, landing pages, social ads, and automation builders most Indian SMBs never use. ORYXLY does one thing well - upload a list and send a campaign.",
            },
            {
              title: "INR pricing with no currency risk",
              body: "Mailchimp bills in USD. When the rupee weakens, your Mailchimp bill goes up. ORYXLY is priced in INR - what you see is what you pay, every month.",
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
          Export contacts from Mailchimp as CSV, upload to ORYXLY, and send your first campaign in minutes.
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
