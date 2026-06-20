"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/stores/auth";
import { MARKETING_NAV, SITE_NAME } from "@/lib/site";

/**
 * Public marketing header. Renders Sign in / Sign up for anonymous visitors and
 * a "Go to dashboard" shortcut once an authenticated session has hydrated.
 */
export function MarketingHeader() {
  const token = useAuth((s) => s.accessToken);
  const [hydrated, setHydrated] = useState(false);

  // Auth state lives in localStorage; only trust it after persist rehydrates,
  // otherwise the first paint can flash the wrong CTA.
  useEffect(() => {
    setHydrated(useAuth.persist?.hasHydrated() ?? true);
    const unsub = useAuth.persist?.onFinishHydration(() => setHydrated(true));
    return () => unsub?.();
  }, []);

  const isAuthed = hydrated && !!token;

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt={SITE_NAME} className="h-9 w-9 object-contain" />
          <span className="font-semibold tracking-tight text-lg">{SITE_NAME}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 flex-1">
          {MARKETING_NAV.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-1.5 text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-neutral-100 transition"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 ml-auto shrink-0">
          {isAuthed ? (
            <Link
              href="/dashboard"
              className="rounded-md bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900 px-4 py-2 text-sm font-medium hover:opacity-90"
            >
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900 px-4 py-2 text-sm font-medium hover:opacity-90"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
