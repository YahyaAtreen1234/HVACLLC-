/**
 * Site-level (not business-level) configuration: canonical URL, default SEO
 * copy and the shared CTA labels used by every call-to-action on the site.
 */
import { business } from "./business";

/**
 * The canonical production origin.
 *
 * Hardcoded as the default rather than left to an environment variable. It is
 * a public fact, not a secret, and it is the single value every canonical tag,
 * the sitemap, robots.txt, the Open Graph URLs and `metadataBase` are built
 * from — so an unset variable does not degrade the site, it publishes the
 * wrong address everywhere at once.
 *
 * This previously fell back to example.com. A launch with that in place would
 * have told search engines that every page's canonical home was a domain the
 * business does not own, which is the one SEO mistake that is hard to undo.
 *
 * NEXT_PUBLIC_SITE_URL still overrides it, which is what a preview deployment
 * or a domain change needs.
 *
 * The `www.` is not decoration — it is where visitors actually end up. The apex
 * is registered in Vercel as a 308 redirect to the www host, so every real
 * request finishes there. While this constant said `https://northstarhvacllc.us`
 * the site was publishing a canonical URL, a sitemap and Open Graph links that
 * all pointed at an address that immediately redirects: a wasted hop on every
 * crawl, two URLs competing for the same ranking signals, and shared links
 * resolving to a different host than the one in the card.
 *
 * If the redirect is ever flipped so the apex serves directly and `www`
 * redirects to it, change this one line back — it is the only place the
 * origin is written.
 */
const PRODUCTION_ORIGIN = "https://www.northstarhvacllc.us";

export const site = {
  /** Canonical origin, no trailing slash. */
  url: (process.env.NEXT_PUBLIC_SITE_URL || PRODUCTION_ORIGIN).replace(
    /\/$/,
    "",
  ),
  defaultTitle: `${business.name} | HVAC Repair, Installation & Maintenance`,
  titleTemplate: `%s | ${business.name}`,
  defaultDescription: business.description,
  locale: "en_US",
} as const;

/**
 * Every CTA label lives here so wording stays identical across the site and can
 * be changed in one place.
 */
export const cta = {
  primary: "Request Service",
  secondary: "Call Now",
  quote: "Get a Free Estimate",
  schedule: "Schedule Service",
} as const;

/**
 * The emergency CTA label is derived, never hard-coded: it only says "24/7"
 * when `business.emergency.available247` is explicitly true.
 */
export function emergencyLabel(): string {
  return business.emergency.available247
    ? "24/7 Emergency HVAC Service"
    : "Emergency HVAC Service";
}

export const emergencyOffered = business.emergency.offered;
