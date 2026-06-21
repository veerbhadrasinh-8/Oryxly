import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

const ROUTE_CONFIG: Array<{ path: string; priority: number; changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never" }> = [
  { path: "",          priority: 1.0, changeFrequency: "weekly" },
  { path: "/features", priority: 0.9, changeFrequency: "weekly" },
  { path: "/pricing",  priority: 0.9, changeFrequency: "monthly" },
  { path: "/faq",      priority: 0.9, changeFrequency: "weekly" },
  { path: "/guide",    priority: 0.8, changeFrequency: "monthly" },
  { path: "/about",    priority: 0.7, changeFrequency: "monthly" },
  { path: "/contact",  priority: 0.6, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return ROUTE_CONFIG.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
