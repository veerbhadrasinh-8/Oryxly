import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Allow crawling of public marketing pages; keep authenticated app surfaces and
 * admin out of the index.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/smtp",
        "/contacts",
        "/campaigns",
        "/templates",
        "/attachments",
        "/logs",
        "/admin",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
