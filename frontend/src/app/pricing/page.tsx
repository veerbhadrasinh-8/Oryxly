import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { PricingCards } from "@/components/marketing/PricingCards";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Transparent monthly pricing for ORYXLY. Pay for the platform and send through your own SMTP - no per-email fees. Starter, Growth, and Agency plans for Indian SMBs and agencies.",
  alternates: { canonical: "/pricing" },
  openGraph: { title: `Pricing - ${SITE_NAME}`, url: "/pricing" },
};

export default function PricingPage() {
  return (
    <MarketingShell>
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Pricing</h1>
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
