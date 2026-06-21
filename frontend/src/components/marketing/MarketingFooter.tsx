import Link from "next/link";
import { MARKETING_NAV, ORG_NAME, ORG_URL, SITE_NAME } from "@/lib/site";

export function MarketingFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 mt-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-6 py-12">
        {/* Mobile: stack brand then 2-col grid for links */}
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">

          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt={SITE_NAME} className="h-7 w-7 object-contain" />
              <span className="font-semibold tracking-tight">{SITE_NAME}</span>
            </div>
            <p className="text-[13px] text-neutral-500 leading-relaxed max-w-xs">
              Reliable email campaigns through your own SMTP — built for Indian SMBs,
              exporters, recruiters, and agencies.
            </p>
          </div>

          {/* Product links */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Product</h3>
            <ul className="space-y-2">
              {MARKETING_NAV.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[13px] text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Compare links */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Compare</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/compare/zoho-campaigns" className="text-[13px] text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
                  vs Zoho Campaigns
                </Link>
              </li>
              <li>
                <Link href="/compare/mailchimp" className="text-[13px] text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
                  vs Mailchimp
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-[13px] text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
                  Sign up
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-[13px] text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
                  Sign in
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Company</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href={ORG_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                >
                  {ORG_NAME}
                </a>
              </li>
              <li>
                <Link href="/contact" className="text-[13px] text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-200 dark:border-neutral-800 px-5 sm:px-6 py-5">
        <p className="text-center text-[12px] text-neutral-400">
          © {year} {SITE_NAME}. Built by{" "}
          <a
            href={ORG_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            {ORG_NAME}
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
