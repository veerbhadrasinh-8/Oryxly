import Link from "next/link";
import { MARKETING_NAV, ORG_NAME, ORG_URL, SITE_NAME } from "@/lib/site";

/** Public marketing footer with secondary navigation and brand attribution. */
export function MarketingFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 mt-20">
      <div className="mx-auto max-w-6xl px-6 py-12 grid gap-8 sm:grid-cols-2 md:grid-cols-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt={SITE_NAME} className="h-7 w-7 object-contain" />
            <span className="font-semibold tracking-tight">{SITE_NAME}</span>
          </div>
          <p className="text-sm text-neutral-500 max-w-xs">
            Reliable email campaigns through your own SMTP - built for Indian SMBs,
            exporters, recruiters, and agencies.
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Product</h3>
          <ul className="space-y-1.5 text-sm text-neutral-500">
            {MARKETING_NAV.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-neutral-900 dark:hover:text-neutral-100">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Get started</h3>
          <ul className="space-y-1.5 text-sm text-neutral-500">
            <li><Link href="/register" className="hover:text-neutral-900 dark:hover:text-neutral-100">Sign up</Link></li>
            <li><Link href="/login" className="hover:text-neutral-900 dark:hover:text-neutral-100">Sign in</Link></li>
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Company</h3>
          <ul className="space-y-1.5 text-sm text-neutral-500">
            <li>
              <a href={ORG_URL} target="_blank" rel="noopener noreferrer" className="hover:text-neutral-900 dark:hover:text-neutral-100">
                {ORG_NAME}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-neutral-200 dark:border-neutral-800 py-6">
        <p className="text-center text-xs text-neutral-500">
          © {year} {SITE_NAME}. Built by{" "}
          <a href={ORG_URL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-neutral-900 dark:hover:text-neutral-100">
            {ORG_NAME}
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
