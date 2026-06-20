"use client";

import { usePathname } from "next/navigation";
import { isMarketingPath, ORG_NAME, ORG_URL } from "@/lib/site";

/**
 * Minimal footer for authenticated app and auth pages. Marketing pages render
 * their own richer footer, so suppress this one there to avoid a double footer.
 */
export function GlobalFooter() {
  const pathname = usePathname() ?? "";
  if (isMarketingPath(pathname)) return null;

  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 py-4 mt-8">
      <p className="text-center text-xs text-neutral-500">
        Developed by{" "}
        <a
          href={ORG_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-neutral-400 hover:text-neutral-100 transition-colors underline underline-offset-2"
        >
          {ORG_NAME}
        </a>
      </p>
    </footer>
  );
}
