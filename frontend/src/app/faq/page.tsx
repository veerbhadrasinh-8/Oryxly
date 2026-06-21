import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { JsonLd } from "@/components/marketing/JsonLd";
import { FAQS, SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Email Marketing FAQ – Common Questions Answered",
  description:
    "Answers to common questions about ORYXLY email marketing software: how SMTP sending works, vs Zoho Campaigns and Mailchimp, pricing, personalization, supported file formats, deduplication, and bulk email limits.",
  alternates: { canonical: "/faq" },
  openGraph: { title: `Email Marketing FAQ | ${SITE_NAME}`, url: "/faq" },
};

export default function FaqPage() {
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
      { "@type": "ListItem", position: 2, name: "FAQ", item: `${SITE_URL}/faq` },
    ],
  };

  return (
    <MarketingShell>
      <JsonLd data={faqLd} />
      <JsonLd data={breadcrumbLd} />
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-center">
          Email Marketing FAQ
        </h1>
        <p className="mt-3 text-center text-neutral-500">
          Common questions about ORYXLY, SMTP email marketing, and how we compare to Zoho Campaigns, Mailchimp, and other tools.
        </p>
        <div className="mt-10 space-y-4">
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
    </MarketingShell>
  );
}
