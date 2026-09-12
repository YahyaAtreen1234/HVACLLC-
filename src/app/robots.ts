import type { MetadataRoute } from "next";
import { site } from "@/config/site";


/**
 * Rendered per request. The content comes from a database the owner edits in
 * the admin panel, so pre-rendering it at build time would serve the
 * deploy-time copy until the next deploy — and would make the build depend on
 * the database being reachable.
 */
export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      /**
       * Only these two. Neither has anything to offer a search result: the
       * admin panel is a login screen, and the API returns JSON. Keeping them
       * out spends the crawl budget on pages that can actually win a customer.
       *
       * Deliberately nothing else. The unconfirmed service-area pages are held
       * back with a noindex instead, and a crawler has to fetch a page to read
       * that — disallowing them here would block the fetch and leave the pages
       * eligible for indexing on inbound links alone, achieving the opposite.
       */
      disallow: ["/admin", "/api"],
    },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
