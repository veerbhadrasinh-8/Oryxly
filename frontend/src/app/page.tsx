import type { Metadata } from "next";
import Link from "next/link";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { PricingCards } from "@/components/marketing/PricingCards";
import { JsonLd } from "@/components/marketing/JsonLd";
import {
  CONTACT_EMAIL,
  FAQS,
  ORG_NAME,
  ORG_URL,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";

export const metadata: Metadata = {
  title: "Email campaigns through your own SMTP",
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: `${SITE_NAME} - Email campaigns through your own SMTP`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
  },
};

const FEATURES = [
  {
    title: "Bring your own SMTP",
    body: "Send from your own domain and infrastructure. No shared IPs, no per-email pricing, no reputation roulette.",
  },
  {
    title: "Upload & dedupe contacts",
    body: "Import CSV or XLSX up to 10 MB. ORYXLY validates and deduplicates every list automatically.",
  },
  {
    title: "Personalize with variables",
    body: "Reference any column from your list in the subject and body, with a live preview before you launch.",
  },
  {
    title: "Safe, throttled sending",
    body: "A minimum 4-second delay between messages with automatic retries protects your sender reputation.",
  },
  {
    title: "Delivery logs you can trust",
    body: "Track every message as sent, failed, or pending - with searchable, audit-grade history.",
  },
  {
    title: "Encrypted credentials",
    body: "SMTP passwords are encrypted at rest and never returned by the API. Decrypted only at send time.",
  },
];

export default function HomePage() {
  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: ORG_NAME,
    url: ORG_URL,
    brand: { "@type": "Brand", name: SITE_NAME },
  };
  const appLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    offers: {
      "@type": "Offer",
      price: "1499",
      priceCurrency: "INR",
    },
  };
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
    <div className="font-sans">
      <JsonLd data={orgLd} />
      <JsonLd data={appLd} />
      <JsonLd data={faqLd} />
      <MarketingHeader />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-16 text-center">
        <span className="inline-block rounded-full border border-neutral-300 dark:border-neutral-700 px-3 py-1 text-xs text-neutral-500">
          Built for Indian SMBs, exporters, recruiters & agencies
        </span>
        <h1 className="mt-6 text-4xl sm:text-6xl font-bold tracking-tight max-w-4xl mx-auto">
          Email campaigns that send through your own SMTP
        </h1>
        <p className="mt-6 text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
          {SITE_DESCRIPTION}
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/register"
            className="rounded-md bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900 px-6 py-3 text-sm font-medium hover:opacity-90"
          >
            Start campaign
          </Link>
          <Link
            href="/pricing"
            className="rounded-md border border-neutral-300 dark:border-neutral-700 px-6 py-3 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-900"
          >
            View pricing
          </Link>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-3xl font-bold tracking-tight text-center">
          Everything you need to run real campaigns
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-6"
            >
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-3xl font-bold tracking-tight text-center">Simple, transparent pricing</h2>
        <p className="mt-3 text-center text-neutral-500">
          Pay for the platform. Send through your own SMTP - no per-email fees.
        </p>
        <div className="mt-12">
          <PricingCards />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="text-3xl font-bold tracking-tight text-center">Frequently asked questions</h2>
        <div className="mt-10 space-y-4">
          {FAQS.map((f) => (
            <details
              key={f.q}
              className="group rounded-xl border border-neutral-200 dark:border-neutral-800 p-5"
            >
              <summary className="cursor-pointer font-medium list-none flex justify-between items-center">
                {f.q}
                <span className="text-neutral-400 group-open:rotate-45 transition">+</span>
              </summary>
              <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 px-8 py-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Ready to start your first campaign?</h2>
          <p className="mt-3 text-neutral-600 dark:text-neutral-400">
            Create an account and connect your SMTP in minutes.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="/register"
              className="rounded-md bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900 px-6 py-3 text-sm font-medium hover:opacity-90"
            >
              Sign up
            </Link>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="rounded-md border border-neutral-300 dark:border-neutral-700 px-6 py-3 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-900"
            >
              Talk to us
            </a>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
