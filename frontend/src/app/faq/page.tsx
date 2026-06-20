import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { JsonLd } from "@/components/marketing/JsonLd";
import { FAQS, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to common questions about ORYXLY: how SMTP sending works, credential security, personalization, supported file formats, deduplication, and who it's for.",
  alternates: { canonical: "/faq" },
  openGraph: { title: `FAQ - ${SITE_NAME}`, url: "/faq" },
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

  return (
    <MarketingShell>
      <JsonLd data={faqLd} />
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-center">
          Frequently asked questions
        </h1>
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
