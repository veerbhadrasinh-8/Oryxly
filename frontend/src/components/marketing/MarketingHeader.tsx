"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight } from "lucide-react";
import { useAuth } from "@/stores/auth";
import { MARKETING_NAV, SITE_NAME } from "@/lib/site";
import { ThemeToggle } from "@/components/ThemeToggle";

export function MarketingHeader() {
  const token = useAuth((s) => s.accessToken);
  const pathname = usePathname() ?? "";
  const [hydrated, setHydrated] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setHydrated(useAuth.persist?.hasHydrated() ?? true);
    const unsub = useAuth.persist?.onFinishHydration(() => setHydrated(true));
    return () => unsub?.();
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when menu open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const isAuthed = hydrated && !!token;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-neutral-200 dark:border-neutral-800 bg-white/85 dark:bg-neutral-950/85 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 h-16 flex items-center gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt={SITE_NAME} className="h-8 w-8 object-contain" />
            <span className="font-semibold tracking-tight text-[15px]">{SITE_NAME}</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5 flex-1 ml-2">
            {MARKETING_NAV.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-md px-3 py-1.5 text-[13px] transition-colors ${
                  pathname === l.href
                    ? "text-neutral-900 dark:text-neutral-100 font-medium bg-neutral-100 dark:bg-neutral-800"
                    : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-neutral-100"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2.5 ml-auto shrink-0">
            <ThemeToggle />

            {/* Desktop CTAs */}
            {isAuthed ? (
              <Link
                href="/dashboard"
                className="hidden md:inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900 px-4 py-2 text-[13px] font-semibold hover:opacity-90 transition-opacity"
              >
                Dashboard
                <ArrowRight size={13} strokeWidth={2.5} />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden md:inline text-[13px] text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors font-medium"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="hidden md:inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900 px-4 py-2 text-[13px] font-semibold hover:opacity-90 transition-opacity"
                >
                  Get started
                  <ArrowRight size={13} strokeWidth={2.5} />
                </Link>
              </>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="md:hidden p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen
                ? <X size={18} strokeWidth={2} />
                : <Menu size={18} strokeWidth={2} />
              }
            </button>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════
          MOBILE FULL-SCREEN OVERLAY MENU
      ═══════════════════════════════════════════ */}
      {menuOpen && (
        <div
          className="md:hidden fixed inset-0 z-[60] flex flex-col animate-fade-in-overlay"
          style={{ background: "var(--background)" }}
        >
          {/* Top bar inside overlay */}
          <div className="flex items-center justify-between px-5 h-16 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt={SITE_NAME} className="h-8 w-8 object-contain" />
              <span className="font-semibold tracking-tight text-[15px]">{SITE_NAME}</span>
            </Link>
            <div className="flex items-center gap-2.5">
              <ThemeToggle />
              <button
                onClick={() => setMenuOpen(false)}
                className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
              >
                <X size={18} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Nav links */}
          <nav className="flex-1 flex flex-col justify-start px-6 pt-4 overflow-y-auto">
            <ul className="space-y-1">
              {MARKETING_NAV.map((l, i) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => setMenuOpen(false)}
                    className={`animate-menu-item group flex items-center justify-between px-5 py-4 rounded-2xl transition-colors ${
                      pathname === l.href
                        ? "bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900"
                        : "text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                    }`}
                    style={{ animationDelay: `${50 + i * 45}ms` }}
                  >
                    <span className="text-[22px] font-bold tracking-tight leading-none">
                      {l.label}
                    </span>
                    <ArrowRight
                      size={18}
                      strokeWidth={2}
                      className={`transition-transform group-hover:translate-x-1 ${
                        pathname === l.href
                          ? "text-neutral-300 dark:text-neutral-600"
                          : "text-neutral-400 dark:text-neutral-600"
                      }`}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Bottom CTA area */}
          <div
            className="px-6 pb-8 pt-4 border-t border-neutral-100 dark:border-neutral-800 shrink-0 space-y-3"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 24px)" }}
          >
            {isAuthed ? (
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="animate-menu-item flex items-center justify-center gap-2 w-full rounded-2xl bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900 py-4 text-[15px] font-bold hover:opacity-90 transition-opacity"
                style={{ animationDelay: `${50 + MARKETING_NAV.length * 45}ms` }}
              >
                Go to Dashboard
                <ArrowRight size={16} strokeWidth={2.5} />
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  onClick={() => setMenuOpen(false)}
                  className="animate-menu-item flex items-center justify-center gap-2 w-full rounded-2xl bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900 py-4 text-[15px] font-bold hover:opacity-90 transition-opacity"
                  style={{ animationDelay: `${50 + MARKETING_NAV.length * 45}ms` }}
                >
                  Get started free
                  <ArrowRight size={16} strokeWidth={2.5} />
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="animate-menu-item flex items-center justify-center w-full rounded-2xl border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 py-4 text-[15px] font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                  style={{ animationDelay: `${50 + (MARKETING_NAV.length + 1) * 45}ms` }}
                >
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
