/** Shared content types used by the data files and the components. */

export type IconName =
  // Domain icons
  | "snowflake"
  | "flame"
  | "heat-pump"
  | "wrench"
  | "briefcase"
  | "shield"
  | "wind"
  | "duct"
  | "thermostat"
  | "building"
  | "clock"
  | "phone"
  | "check"
  | "star"
  | "calendar"
  | "map-pin"
  | "mail"
  | "alert"
  // Interface icons
  | "chevron-down"
  | "arrow-right"
  | "menu"
  | "close"
  | "quote";

export interface SiteImage {
  /**
   * Path under /public. An empty string means "photo not supplied yet" — the
   * MediaFrame component then renders a clearly-marked placeholder using `alt`
   * as the shot brief, so no stock photo is ever invented.
   */
  src: string;
  /**
   * Descriptive alt text. Required — never ship an empty alt on a content
   * image. Use "" only for purely decorative images.
   */
  alt: string;
  width: number;
  height: number;
}

export interface Service {
  slug: string;
  /** Short label used in navigation, cards and the footer. */
  name: string;
  /** Longer H1 for the detail page. */
  title: string;
  /** One-sentence summary used on cards and in meta descriptions. */
  summary: string;
  icon: IconName;
  category: "cooling" | "heating" | "air-quality" | "maintenance" | "commercial";
  /** Bullet list of what the visit actually includes. */
  includes: string[];
  /** Symptoms that tell a homeowner they need this service. */
  signs: string[];
  /** Body copy paragraphs for the detail page. */
  body: string[];
  image: SiteImage;
  /** Slugs of services shown as "related" on the detail page. */
  related: string[];
}

export interface ServiceArea {
  slug: string;
  city: string;
  state: string;
  /** Optional neighbourhoods/communities within the city. */
  neighborhoods?: string[];
  /**
   * Local writing for this town, shown at the top of its page.
   *
   * The rest of a city page is shared template with the name substituted, so
   * this is the only part that makes one page genuinely different from the
   * next. A page without it is thin content whatever else is on it.
   */
  note?: string;
  /** True while the entry is stand-in data. */
  isPlaceholder: boolean;
}

export interface Review {
  /** Reviewer name exactly as published on the source platform. */
  author: string;
  /** 1–5. Only record the rating the customer actually left. */
  rating: 1 | 2 | 3 | 4 | 5;
  /** The review text, unedited. */
  quote: string;
  /** Where the review was published, e.g. "Google". */
  source: string;
  /** Link to the original review, when the platform provides one. */
  sourceUrl?: string;
  /** ISO date the review was left. */
  date: string;
  /** Optional city, for local relevance. */
  location?: string;
  /** Optional related service slug. */
  service?: string;
}

export interface TeamMember {
  /** Full name as the person wants it published. */
  name: string;
  role: string;
  /** One line — what they do and what they are known for. */
  bio: string;
  image: SiteImage;
  /** Optional certifications this individual holds. Never invent these. */
  credentials?: string[];
  /** True while the entry is stand-in data. */
  isPlaceholder: boolean;
}

export interface ComparisonRow {
  /** What is being compared, e.g. "System age". */
  criterion: string;
  /** The value in the left-hand column. */
  optionA: string;
  /** The value in the right-hand column. */
  optionB: string;
}

export interface Faq {
  question: string;
  answer: string;
  /** Group used to filter FAQs onto the right page. */
  topic: "general" | "cooling" | "heating" | "maintenance" | "billing";
}

export interface TrustBadgeItem {
  label: string;
  detail: string;
  icon: IconName;
}
