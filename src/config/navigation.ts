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

export const mainNav: NavItem[] = [
  { label: "Home", href: "/", description: "Back to the start" },
  {
    label: "Services",
    href: "/services",
    description: "Repair, replacement and maintenance",
  },
  { label: "About", href: "/about", description: "Who you are calling" },
  {
    label: "Service Areas",
    href: "/service-areas",
    description: "Where we work",
  },
  { label: "Reviews", href: "/reviews", description: "What customers say" },
  {
    label: "Financing",
    href: "/financing",
    description: "Ways to pay for a new system",
  },
  { label: "Contact", href: "/contact", description: "Reach the office" },
];

export const legalNav: NavItem[] = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms-conditions" },
];
