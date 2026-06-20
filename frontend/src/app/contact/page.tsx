import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { CONTACT_EMAIL, ORG_NAME, ORG_URL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with the ORYXLY team for sales, support, or partnership questions.",
  alternates: { canonical: "/contact" },
  openGraph: { title: `Contact - ${SITE_NAME}`, url: "/contact" },
};

export default function ContactPage() {
  return (
    <MarketingShell>
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold tracking-tight">Contact us</h1>
        <p className="mt-3 text-neutral-500">
          Questions about plans, deliverability, or getting started? We&apos;re happy to help.
        </p>
        <div className="mt-10 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-8">
          <p className="text-sm text-neutral-500">Email us</p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="mt-1 block text-xl font-semibold underline underline-offset-4"
          >
            {CONTACT_EMAIL}
          </a>
          <p className="mt-6 text-sm text-neutral-500">
            Or visit{" "}
            <a href={ORG_URL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
              {ORG_NAME}
            </a>
            .
          </p>
        </div>
        <div className="mt-8">
          <Link
            href="/register"
            className="rounded-md bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900 px-6 py-3 text-sm font-medium hover:opacity-90"
          >
            Create your account
          </Link>
        </div>
      </div>
    </MarketingShell>
  );
}
