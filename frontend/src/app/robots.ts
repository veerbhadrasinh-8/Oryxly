import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Allow crawling of public marketing pages; keep authenticated app surfaces and
 * admin out of the index.
 */
const APP_ROUTES = [
  "/dashboard",
  "/smtp",
  "/contacts",
  "/campaigns",
  "/templates",
  "/attachments",
  "/logs",
  "/admin",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // General crawlers: public pages only
      {
        userAgent: "*",
        allow: "/",
        disallow: APP_ROUTES,
      },
      // AI crawlers: explicitly allowed on all public pages for AEO citation
      { userAgent: "GPTBot",        allow: "/" },
      { userAgent: "ClaudeBot",     allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "Googlebot",     allow: "/" },
      // Google-Extended (AI training): allow so Google AI Overview cites us
      { userAgent: "Google-Extended", allow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
