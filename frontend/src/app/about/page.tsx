import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { JsonLd } from "@/components/marketing/JsonLd";
import { ORG_NAME, ORG_URL, SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "About – Email Campaign Tool Built for India",
  description:
    "ORYXLY is an email marketing and campaign tool built by Oryxus for Indian SMBs, exporters, recruiters, and agencies. Send reliable, personalized bulk email through your own SMTP — not a shared IP pool.",
  alternates: { canonical: "/about" },
  openGraph: { title: `About ${SITE_NAME} – Email Campaign Tool for India`, url: `${SITE_URL}/about` },
};

export default function AboutPage() {
  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: ORG_NAME,
    url: ORG_URL,
    logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
    brand: { "@type": "Brand", name: SITE_NAME },
    contactPoint: {
      "@type": "ContactPoint",
      email: "oryxusofficial@gmail.com",
      contactType: "customer support",
      areaServed: "IN",
      availableLanguage: "English",
    },
    areaServed: { "@type": "Country", name: "India" },
    sameAs: [ORG_URL],
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "About", item: `${SITE_URL}/about` },
    ],
  };

  return (
    <MarketingShell>
      <JsonLd data={orgLd} />
      <JsonLd data={breadcrumbLd} />
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
