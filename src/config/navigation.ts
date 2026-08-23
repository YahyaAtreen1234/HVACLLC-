/**
 * Navigation is defined once and consumed by the desktop nav, the mobile nav,
 * the footer and the sitemap so they can never drift apart.
 */
export interface NavItem {
  label: string;
  href: string;
  /** Optional short line used by the mobile menu. */
  description?: string;
}

/**
 * The header bar. Kept deliberately short — a seven-item nav is already at the
 * limit of what someone scans on a phone while their AC is broken. Secondary
 * pages live in the footer instead of stretching this list.
 */
export const mainNav: NavItem[] = [
  { label: "Home", href: "/", description: "Back to the start" },
  {
    label: "Services",
    href: "/services",
    description: "Repair, replacement and maintenance",
  },
  {
    label: "Maintenance",
    href: "/maintenance-plans",
    description: "Plans that keep systems from failing",
  },
  { label: "About", href: "/about", description: "Who you are calling" },
  {
    label: "Service Areas",
    href: "/service-areas",
    description: "Where we work",
  },
  { label: "Reviews", href: "/reviews", description: "What customers say" },
  { label: "Contact", href: "/contact", description: "Reach the office" },
];

/**
 * Footer-only pages. Real pages that most visitors do not need in the header:
 * they matter for SEO and for the minority who go looking.
 */
export const companyNav: NavItem[] = [
  /*
   * Points at the section on the About page rather than a page of its own.
   * A separate /team page would be thin — a handful of cards — and thin pages
   * compete with the page they were split from. The header already links to
   * About, so a second header entry would lead to the same place twice; it
   * belongs here, where the secondary links live.
   */
  { label: "Meet the Team", href: "/about#team" },
  { label: "Maintenance Plans", href: "/maintenance-plans" },
  { label: "Financing", href: "/financing" },
  { label: "FAQs", href: "/faqs" },
  { label: "Reviews", href: "/reviews" },
  { label: "Careers", href: "/careers" },
];

export const legalNav: NavItem[] = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms-conditions" },
];
