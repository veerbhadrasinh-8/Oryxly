import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { JsonLd } from "@/components/marketing/JsonLd";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "ORYXLY vs Email Marketing Tools - Compare Alternatives",
  description:
    "Compare ORYXLY with Zoho Campaigns, Mailchimp, and other email marketing tools. See how ORYXLY's bring-your-own-SMTP approach saves money and gives you full control over deliverability.",
  alternates: { canonical: "/compare" },
  openGraph: {
    title: `Compare Email Marketing Tools | ${SITE_NAME}`,
    url: `${SITE_URL}/compare`,
  },
};

const COMPARISONS = [
  {
    href: "/compare/zoho-campaigns",
    competitor: "Zoho Campaigns",
    headline: "ORYXLY vs Zoho Campaigns",
    summary:
      "Zoho Campaigns sends from Zoho shared servers. ORYXLY sends through your own SMTP - your domain, your reputation, flat INR pricing.",
    points: [
      "Your own SMTP vs Zoho shared infrastructure",
      "Flat INR pricing vs per-contact USD tiers",
      "Works with Zoho Mail SMTP directly",
    ],
  },
  {
    href: "/compare/mailchimp",
    competitor: "Mailchimp",
    headline: "ORYXLY vs Mailchimp",
    summary:
      "Mailchimp charges in USD and scales cost with your list size. ORYXLY is flat INR pricing with no per-contact fees and your own SMTP.",
    points: [
      "Rs. 3,499/month vs ~Rs. 19,000/month at 25,000 contacts",
      "INR pricing vs USD with forex risk",
      "Your own SMTP vs Mailchimp shared IP pool",
    ],
  },
];

export default function ComparePage() {
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Compare", item: `${SITE_URL}/compare` },
    ],
  };

  return (
    <MarketingShell>
      <JsonLd data={breadcrumbLd} />

      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight">Compare email marketing tools</h1>
        <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
          See how ORYXLY compares to popular email marketing platforms. Every comparison
          covers pricing, infrastructure, and what matters for Indian businesses.
        </p>
      </div>

      <div className="mt-12 max-w-3xl mx-auto grid gap-6 sm:grid-cols-2">
        {COMPARISONS.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 hover:border-neutral-400 dark:hover:border-neutral-600 transition"
          >
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-widest">
              vs {c.competitor}
            </span>
            <h2 className="mt-2 text-xl font-bold tracking-tight group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition">
              {c.headline}
            </h2>
            <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">{c.summary}</p>
            <ul className="mt-4 space-y-1.5">
              {c.points.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <span className="mt-0.5 text-neutral-400">-</span>
                  {p}
                </li>
              ))}
            </ul>
            <span className="mt-5 inline-block text-sm font-medium text-neutral-900 dark:text-neutral-100 group-hover:underline underline-offset-2">
              See full comparison
            </span>
          </Link>
        ))}
      </div>
    </MarketingShell>
  );
}
