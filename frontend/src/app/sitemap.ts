import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/** Public, crawlable routes. Authenticated app routes are intentionally excluded. */
const ROUTES = ["", "/features", "/pricing", "/guide", "/faq", "/about", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));
}
