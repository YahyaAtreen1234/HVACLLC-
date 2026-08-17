/**
 * Site-level (not business-level) configuration: canonical URL, default SEO
 * copy and the shared CTA labels used by every call-to-action on the site.
 */
import { business } from "./business";

export const site = {
  /**
   * Canonical origin, no trailing slash. Used for metadata, sitemap and
   * structured data. TODO: set NEXT_PUBLIC_SITE_URL in the deploy environment.
   */
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.example.com").replace(
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
