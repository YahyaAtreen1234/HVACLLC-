import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { mainNav, legalNav } from "@/config/navigation";
import { getServices } from "@/server/content/read";

/**
 * XML sitemap, generated from the same navigation and service data the site
 * renders — so a new service page can never be missing from it.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages = [...mainNav, ...legalNav].map((item) => ({
    url: `${site.url}${item.href === "/" ? "" : item.href}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: item.href === "/" ? 1 : 0.7,
  }));

  const servicePages = getServices().map((service) => ({
    url: `${site.url}/services/${service.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...servicePages];
}
