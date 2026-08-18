import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { mainNav, companyNav, legalNav } from "@/config/navigation";
import { getServices, getServiceAreas } from "@/server/content/read";
import { jobOpenings } from "@/data/jobs";

/**
 * XML sitemap, generated from the same navigation and service data the site
 * renders — so a new service page can never be missing from it.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Deduplicated: a page listed in both the header and footer must not appear
  // twice in the sitemap.
  const seen = new Set<string>();
  const staticPages = [...mainNav, ...companyNav, ...legalNav]
    .filter((item) => {
      if (seen.has(item.href)) return false;
      seen.add(item.href);
      // Careers is noindex while there are no openings; advertising it here
      // would contradict the page's own robots directive.
      if (item.href === "/careers" && jobOpenings.length === 0) return false;
      return true;
    })
    .map((item) => ({
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

  // Placeholder cities are excluded — they are noindex, and listing a page
  // in the sitemap that tells crawlers not to index it is a contradiction.
  const areaPages = getServiceAreas()
    .filter((area) => !area.isPlaceholder)
    .map((area) => ({
      url: `${site.url}/service-areas/${area.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));

  return [...staticPages, ...servicePages, ...areaPages];
}
