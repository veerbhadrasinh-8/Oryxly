"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchMe, logoutRequest } from "@/features/auth/api";
import { useAuth } from "@/stores/auth";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/smtp", label: "SMTP" },
  { href: "/contacts", label: "Contacts" },
  { href: "/attachments", label: "Attachments" },
  { href: "/campaigns", label: "Campaigns" },
  { href: "/logs", label: "Logs" },
] as const;

export function AppNav() {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const token = useAuth((s) => s.accessToken);
  const clear = useAuth((s) => s.clear);

  const meQ = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
    enabled: !!token,
    staleTime: 60_000,
  });

  // Don't render nav on unauthenticated pages
  if (!token || pathname === "/login" || pathname === "/register" || pathname === "/") {
    return null;
  }

  async function onLogout() {
    try {
      await logoutRequest();
    } finally {
      clear();
      router.replace("/login");
    }
  }

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6 h-14 flex items-center gap-6">
        <Link
          href="/dashboard"
          className="font-semibold tracking-tight text-base hover:opacity-80"
        >
          MailFlow
        </Link>

        <nav className="flex items-center gap-1 ml-2 flex-1 overflow-x-auto">
          {LINKS.map((l) => {
            const active = isActive(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-md px-3 py-1.5 text-sm transition whitespace-nowrap ${
                  active
                    ? "bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900 font-medium"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-neutral-100"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
          {meQ.data?.is_admin && (
            <Link
              href="/admin"
              className={`rounded-md px-3 py-1.5 text-sm transition whitespace-nowrap ${
                isActive("/admin")
                  ? "bg-violet-600 text-white font-medium"
                  : "text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30"
              }`}
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          {meQ.data && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-500">
              <span className="rounded-full border border-neutral-300 dark:border-neutral-700 px-2 py-0.5 uppercase tracking-wide">
                {meQ.data.plan}
              </span>
              <span className="font-mono">{meQ.data.email}</span>
            </div>
          )}
          <button
            onClick={onLogout}
            className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
            title="Sign out"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
