"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  LayoutDashboard,
  Send,
  Users,
  FileText,
  MoreHorizontal,
  Server,
  Paperclip,
  BookOpen,
  Shield,
  LogOut,
  X,
} from "lucide-react";
import { fetchMe, logoutRequest } from "@/features/auth/api";
import { useAuth } from "@/stores/auth";
import { isMarketingPath } from "@/lib/site";
import { ThemeToggle } from "@/components/ThemeToggle";

const PRIMARY_TABS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/campaigns", label: "Campaigns", icon: Send },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/logs", label: "Logs", icon: FileText },
] as const;

const DESKTOP_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/smtp", label: "SMTP" },
  { href: "/contacts", label: "Contacts" },
  { href: "/attachments", label: "Attachments" },
  { href: "/campaigns", label: "Campaigns" },
  { href: "/logs", label: "Logs" },
  { href: "/guide", label: "Guide" },
] as const;

const MORE_LINKS = [
  { href: "/smtp", label: "SMTP", icon: Server },
  { href: "/attachments", label: "Attachments", icon: Paperclip },
  { href: "/guide", label: "Guide", icon: BookOpen },
] as const;

export function AppNav() {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const token = useAuth((s) => s.accessToken);
  const clear = useAuth((s) => s.clear);
  const [moreOpen, setMoreOpen] = useState(false);

  const meQ = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
    enabled: !!token,
    staleTime: 60_000,
  });

  if (
    !token ||
    pathname === "/login" ||
    pathname === "/register" ||
    isMarketingPath(pathname)
  ) {
    return null;
  }

  async function handleLogout() {
    setMoreOpen(false);
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

  const isPrimaryActive = PRIMARY_TABS.some((t) => isActive(t.href));
  const isMoreActive =
    !isPrimaryActive &&
    (MORE_LINKS.some((l) => isActive(l.href)) || isActive("/admin"));

  return (
    <>
      {/* ═══════════════════════════════════════════
          DESKTOP NAV (md+)
      ═══════════════════════════════════════════ */}
      <header className="hidden md:block sticky top-0 z-40 border-b border-neutral-200 dark:border-neutral-800 bg-white/85 dark:bg-neutral-950/85 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-6 h-14 flex items-center gap-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="ORYXLY" className="h-8 w-8 object-contain" />
            <span className="font-semibold tracking-tight">ORYXLY</span>
          </Link>

          <nav className="flex items-center gap-0.5 ml-2 flex-1 overflow-x-auto scrollbar-none">
            {DESKTOP_LINKS.map((l) => {
              const active = isActive(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`rounded-md px-3 py-1.5 text-sm transition-colors whitespace-nowrap ${
                    active
                      ? "bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900 font-medium"
                      : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-neutral-100"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
            {meQ.data?.is_admin && (
              <Link
                href="/admin"
                className={`rounded-md px-3 py-1.5 text-sm transition-colors whitespace-nowrap ${
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
            <ThemeToggle />
            {meQ.data && (
              <div className="hidden lg:flex items-center gap-2 text-xs text-neutral-500">
                <span className="rounded-full border border-neutral-300 dark:border-neutral-700 px-2 py-0.5 uppercase tracking-wide font-medium">
                  {meQ.data.plan}
                </span>
                <span className="font-mono truncate max-w-[160px]">{meQ.data.email}</span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════
          MOBILE TOP BAR (< md)
      ═══════════════════════════════════════════ */}
      <header className="md:hidden sticky top-0 z-40 border-b border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-md">
        <div className="px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="ORYXLY" className="h-8 w-8 object-contain" />
            <span className="font-semibold tracking-tight">ORYXLY</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            {meQ.data && (
              <span className="text-[11px] font-semibold rounded-full border border-neutral-300 dark:border-neutral-700 px-2.5 py-0.5 uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                {meQ.data.plan}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════
          MOBILE BOTTOM TAB BAR (< md)
      ═══════════════════════════════════════════ */}
      <nav
        className="mobile-bottom-nav md:hidden fixed bottom-0 left-0 right-0 z-40
          bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl
          border-t border-neutral-200/80 dark:border-neutral-800/80
          grid grid-cols-5"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {PRIMARY_TABS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center gap-1 py-3 relative transition-colors"
            >
              <div
                className={`relative p-1.5 rounded-xl transition-all duration-200 ${
                  active
                    ? "bg-neutral-900 dark:bg-neutral-100"
                    : ""
                }`}
              >
                <Icon
                  size={19}
                  strokeWidth={active ? 2.2 : 1.6}
                  className={
                    active
                      ? "text-neutral-100 dark:text-neutral-900"
                      : "text-neutral-400 dark:text-neutral-600"
                  }
                />
              </div>
              <span
                className={`text-[9px] font-semibold tracking-wide uppercase transition-colors ${
                  active
                    ? "text-neutral-900 dark:text-neutral-100"
                    : "text-neutral-400 dark:text-neutral-600"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}

        {/* More tab */}
        <button
          onClick={() => setMoreOpen(true)}
          className="flex flex-col items-center justify-center gap-1 py-3 relative transition-colors"
        >
          <div
            className={`relative p-1.5 rounded-xl transition-all duration-200 ${
              isMoreActive || moreOpen
                ? "bg-neutral-900 dark:bg-neutral-100"
                : ""
            }`}
          >
            <MoreHorizontal
              size={19}
              strokeWidth={isMoreActive || moreOpen ? 2.2 : 1.6}
              className={
                isMoreActive || moreOpen
                  ? "text-neutral-100 dark:text-neutral-900"
                  : "text-neutral-400 dark:text-neutral-600"
              }
            />
          </div>
          <span
            className={`text-[9px] font-semibold tracking-wide uppercase transition-colors ${
              isMoreActive || moreOpen
                ? "text-neutral-900 dark:text-neutral-100"
                : "text-neutral-400 dark:text-neutral-600"
            }`}
          >
            More
          </span>
        </button>
      </nav>

      {/* ═══════════════════════════════════════════
          MORE BOTTOM SHEET (mobile)
      ═══════════════════════════════════════════ */}
      {moreOpen && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 z-[45] bg-black/40 backdrop-blur-sm animate-fade-in-overlay"
            onClick={() => setMoreOpen(false)}
          />

          {/* Sheet */}
          <div
            className="md:hidden fixed bottom-0 left-0 right-0 z-[50]
              bg-white dark:bg-[#0f0f0f]
              rounded-t-[28px]
              border-t border-neutral-200 dark:border-neutral-800
              animate-slide-up-sheet
              overflow-hidden"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)" }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3.5 pb-2">
              <div className="w-9 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />
            </div>

            {/* Close button */}
            <button
              onClick={() => setMoreOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              <X size={16} strokeWidth={2} />
            </button>

            {/* User info pill */}
            {meQ.data && (
              <div className="mx-4 mt-2 mb-4 px-4 py-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-[11px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider font-medium">Signed in as</p>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mt-0.5 truncate">{meQ.data.email}</p>
                  </div>
                  <span className="ml-3 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 shrink-0">
                    {meQ.data.plan}
                  </span>
                </div>
              </div>
            )}

            {/* Nav links */}
            <div className="px-4 space-y-1">
              {MORE_LINKS.map(({ href, label, icon: Icon }, i) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMoreOpen(false)}
                    className={`animate-menu-item flex items-center gap-4 px-4 py-4 rounded-2xl transition-colors ${
                      active
                        ? "bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900"
                        : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                    }`}
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <div className={`p-2 rounded-xl ${active ? "bg-neutral-700 dark:bg-neutral-300" : "bg-neutral-100 dark:bg-neutral-800"}`}>
                      <Icon
                        size={17}
                        strokeWidth={2}
                        className={active ? "text-neutral-100 dark:text-neutral-900" : "text-neutral-600 dark:text-neutral-400"}
                      />
                    </div>
                    <span className="text-sm font-semibold">{label}</span>
                    {active && (
                      <span className="ml-auto text-[10px] font-bold uppercase tracking-wider opacity-60">Active</span>
                    )}
                  </Link>
                );
              })}

              {meQ.data?.is_admin && (
                <Link
                  href="/admin"
                  onClick={() => setMoreOpen(false)}
                  className={`animate-menu-item flex items-center gap-4 px-4 py-4 rounded-2xl transition-colors ${
                    isActive("/admin")
                      ? "bg-violet-600 text-white"
                      : "text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30"
                  }`}
                  style={{ animationDelay: `${MORE_LINKS.length * 40}ms` }}
                >
                  <div className={`p-2 rounded-xl ${isActive("/admin") ? "bg-violet-500" : "bg-violet-100 dark:bg-violet-950/40"}`}>
                    <Shield size={17} strokeWidth={2} className={isActive("/admin") ? "text-white" : "text-violet-600 dark:text-violet-400"} />
                  </div>
                  <span className="text-sm font-semibold">Admin</span>
                </Link>
              )}
            </div>

            {/* Divider + Sign out */}
            <div className="mx-4 mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
              >
                <div className="p-2 rounded-xl bg-red-50 dark:bg-red-950/30">
                  <LogOut size={17} strokeWidth={2} className="text-red-500 dark:text-red-400" />
                </div>
                <span className="text-sm font-semibold">Sign out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
