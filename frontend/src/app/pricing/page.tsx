import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { PricingCards } from "@/components/marketing/PricingCards";
import { JsonLd } from "@/components/marketing/JsonLd";
import { PLANS, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Email Marketing Pricing – Affordable Plans for India",
  description:
    "Transparent monthly pricing for ORYXLY email marketing software. Starter ₹1,499, Growth ₹3,499, Agency ₹12,999. Pay for the platform, send bulk emails through your own SMTP — no per-email fees.",
  alternates: { canonical: "/pricing" },
  openGraph: { title: `Email Marketing Pricing | ${SITE_NAME}`, url: `${SITE_URL}/pricing` },
};

export default function PricingPage() {
  const softwareLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    offers: PLANS.map((p) => ({
      "@type": "Offer",
      name: p.name,
      price: p.price.replace(/[₹,]/g, ""),
      priceCurrency: "INR",
      description: p.tagline,
      eligibleRegion: { "@type": "Country", name: "India" },
    })),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Pricing", item: `${SITE_URL}/pricing` },
    ],
  };

  return (
    <MarketingShell>
      <JsonLd data={softwareLd} />
      <JsonLd data={breadcrumbLd} />
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Email Marketing Pricing</h1>
        <p className="mt-3 text-neutral-500 max-w-xl mx-auto">
          One flat monthly price for the platform. You send through your own SMTP, so
          there are never any per-email charges.
        </p>
      </div>
      <div className="mt-12">
        <PricingCards />
      </div>
      <p className="mt-10 text-center text-sm text-neutral-500">
        All plans include personalization variables, deduplication, throttled sending,
        retries, and delivery logs. Prices are in INR, billed monthly.
      </p>
    </MarketingShell>
  );
}
