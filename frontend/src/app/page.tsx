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
  REVIEWS,
  SITE_DESCRIPTION,
  SITE_META_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";

export const metadata: Metadata = {
  title: {
    absolute: `${SITE_NAME} – Email Campaign Tool & Marketing Software for India`,
  },
  description: SITE_META_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: `${SITE_NAME} – Email Campaign Tool & Marketing Software for India`,
    description: SITE_META_DESCRIPTION,
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
  const graphLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: ORG_NAME,
        url: ORG_URL,
        logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
        brand: { "@type": "Brand", name: SITE_NAME },
        contactPoint: {
          "@type": "ContactPoint",
          email: "oryxusofficial@gmail.com",
          contactType: "customer support",
        },
        sameAs: [ORG_URL],
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE_URL}/#software`,
        name: SITE_NAME,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description: SITE_DESCRIPTION,
        url: SITE_URL,
        featureList: [
          "Bring your own SMTP",
          "Bulk email campaigns",
          "Contact upload and deduplication",
          "Email personalization with variables",
          "Throttled sending with automatic retries",
          "Delivery logs",
          "Encrypted SMTP credentials",
        ],
        offers: [
          {
            "@type": "Offer",
            name: "Starter",
            price: "1499",
            priceCurrency: "INR",
            description: "1 SMTP connection, 5,000 emails/month, 5 campaigns/month",
          },
          {
            "@type": "Offer",
            name: "Growth",
            price: "3499",
            priceCurrency: "INR",
            description: "3 SMTP connections, 30,000 emails/month, unlimited campaigns",
          },
          {
            "@type": "Offer",
            name: "Agency",
            price: "12999",
            priceCurrency: "INR",
            description: "10 SMTP connections, 150,000 emails/month, team access",
          },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/#faq`,
        mainEntity: FAQS.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@type": "Product",
        "@id": `${SITE_URL}/#product`,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        url: SITE_URL,
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.8",
          reviewCount: String(REVIEWS.length),
          bestRating: "5",
          worstRating: "1",
        },
        review: REVIEWS.map((r) => ({
          "@type": "Review",
          author: { "@type": "Person", name: r.name },
          reviewRating: { "@type": "Rating", ratingValue: String(r.rating), bestRating: "5" },
          reviewBody: r.body,
          name: `${r.name} - ${r.company}`,
        })),
      },
    ],
  };

  return (
    <div className="font-sans">
      <JsonLd data={graphLd} />
      <MarketingHeader />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-16 text-center">
        <span className="inline-block rounded-full border border-neutral-300 dark:border-neutral-700 px-3 py-1 text-xs text-neutral-500">
          Built for Indian SMBs, exporters, recruiters & agencies
        </span>
        <h1 className="mt-6 text-4xl sm:text-6xl font-bold tracking-tight max-w-4xl mx-auto">
          The email marketing & campaign tool that sends through your own SMTP
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

      {/* Reviews marquee */}
      <section aria-label="Customer reviews" className="py-12 overflow-hidden border-y border-neutral-100 dark:border-neutral-800/60">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-8">
          Trusted by Indian SMBs, exporters, recruiters & agencies
        </p>
        <div className="relative">
          {/* fade edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 z-10 bg-gradient-to-r from-white dark:from-[#0a0a0a] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 z-10 bg-gradient-to-l from-white dark:from-[#0a0a0a] to-transparent" />
          {/* track — duplicated for seamless loop */}
          <div className="flex gap-4 animate-marquee w-max">
            {[...REVIEWS, ...REVIEWS].map((r, i) => (
              <article
                key={i}
                className="w-72 shrink-0 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 p-5 space-y-3"
              >
                <div className="flex items-center gap-0.5" aria-label={`${r.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }).map((_, s) => (
                    <svg key={s} className={`w-3.5 h-3.5 ${s < r.rating ? "text-amber-400" : "text-neutral-200 dark:text-neutral-700"}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">&quot;{r.body}&quot;</p>
                <div>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{r.name}</p>
                  <p className="text-xs text-neutral-400">{r.role}, {r.company}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-5 sm:px-6 py-16">
        <h2 className="text-3xl font-bold tracking-tight text-center">
          Everything you need to run real campaigns
        </h2>
        <div className="mt-12 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-6"
            >
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">{f.title}</h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{f.body}</p>
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
