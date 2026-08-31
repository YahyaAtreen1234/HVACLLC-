/**
 * CENTRAL BUSINESS CONFIGURATION
 * -----------------------------------------------------------------------------
 * Every piece of company information on the website is read from this file.
 * Change it here once and it updates the header, footer, contact page, schema
 * markup, sitemap and every call-to-action.
 *
 * ⚠️  PLACEHOLDER POLICY
 * Fields that still hold made-up stand-in data are listed in
 * `PLACEHOLDER_FIELDS` at the bottom of this file. While that list is not empty
 * a warning banner is shown in development (never in production) so nothing
 * fictional ships by accident.
 *
 * Nothing in here should be a claim the business cannot back up: no licence
 * numbers, awards, certifications, guarantees, prices or review counts have
 * been invented. Add them only when you have the real values.
 */

export type WeekDay =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface BusinessHours {
  /** 24h "HH:MM" open time, or null when closed that day. */
  open: string | null;
  /** 24h "HH:MM" close time, or null when closed that day. */
  close: string | null;
}

export const business = {
  // ---------------------------------------------------------------------------
  // Identity
  // ---------------------------------------------------------------------------
  name: "NorthStar HVAC",
  /**
   * TODO: confirm the registered entity name. The business card's domain
   * (northstarhvacllc.us) implies an LLC, but a domain is not a filing. This
   * appears in the footer copyright and in structured data, so it is worth
   * checking against the actual registration.
   */
  legalName: "NorthStar HVAC LLC",
  /** The short service list from the business card, sitting under the logo. */
  serviceLine: "Heating · Cooling · Installation · Repair",
  /**
   * Currently rendered nowhere. The hero sentence that used to end with it now
   * carries the business's own wording instead. Kept because a one-line
   * positioning statement is worth having to hand, but nothing on the site
   * will show it until something asks for it.
   */
  tagline: "Heating and cooling done right the first time",
  /** TODO: replace with a short factual description of the business. */
  description:
    "Residential and light commercial heating, ventilation and air conditioning — repair, replacement and maintenance.",
  /** TODO: set the real year the business started operating (used in the footer). */
  foundedYear: 2010,

  // ---------------------------------------------------------------------------
  // Contact
  // ---------------------------------------------------------------------------
  phone: {
    display: "(314) 435-2394",
    /** Digits only, E.164. Must match `display`. */
    e164: "+13144352394",
  },
  /** TODO: set to null if there is no separate emergency line. */
  emergencyPhone: null as { display: string; e164: string } | null,
  email: "northshvac@gmail.com",

  address: {
    /** TODO: replace with the real street address (or leave `showAddress` false). */
    street: "",
    /** TODO */
    suite: "",
    city: "Phoenix",
    state: "AZ",
    /** TODO: the real ZIP for the business address. */
    postalCode: "",
    country: "US",
    /**
     * Set to false for a service-area business that works out of a home base
     * and should not publish a street address.
     *
     * Off until there is a real street address to show — a fabricated one
     * breaks Google Business Profile verification and misleads customers.
     */
    showAddress: false,
    /** TODO: paste the Google Maps share link for the business ("Get directions"). */
    mapUrl: "",
    /**
     * TODO: optional embed URL for an inline map (Google Maps → Share → Embed
     * a map → copy the src from the iframe).
     *
     * Leaving this empty renders a styled placeholder instead, and — worth
     * knowing — keeps the page free of a third-party frame that sets cookies
     * before the visitor has agreed to anything.
     */
    mapEmbedUrl: "",
  },

  // ---------------------------------------------------------------------------
  // Hours
  // ---------------------------------------------------------------------------
  /**
   * Open around the clock, every day.
   *
   * 00:00–23:59 is how a 24-hour day is expressed in schema.org's
   * OpeningHoursSpecification; the site detects that span and prints "Open 24
   * hours" rather than the literal "12:00 AM – 11:59 PM".
   *
   * ⚠️ This is a promise, and it is the one customers test hardest — they ring
   * at 2am precisely because the site said they could. Every surface reads
   * from here: the header strip, the contact page table, the footer, and the
   * hours Google publishes in search results. Narrow it here the day it stops
   * being true, and all four follow.
   */
  hours: {
    monday: { open: "00:00", close: "23:59" },
    tuesday: { open: "00:00", close: "23:59" },
    wednesday: { open: "00:00", close: "23:59" },
    thursday: { open: "00:00", close: "23:59" },
    friday: { open: "00:00", close: "23:59" },
    saturday: { open: "00:00", close: "23:59" },
    sunday: { open: "00:00", close: "23:59" },
  } satisfies Record<WeekDay, BusinessHours>,
  /**
   * Arizona does not observe daylight saving, so this must be America/Phoenix
   * rather than a generic US zone — otherwise the opening hours published in
   * structured data drift by an hour for half the year.
   */
  timezone: "America/Phoenix",

  // ---------------------------------------------------------------------------
  // Emergency service
  // ---------------------------------------------------------------------------
  // ---------------------------------------------------------------------------
  // Recruiting
  // ---------------------------------------------------------------------------
  /**
   * Drives the hiring banner and the wording on the careers page together, so
   * the two can never contradict each other — a strip advertising vacancies
   * above a page saying nobody is being hired is worse than showing neither.
   *
   * `active` is about whether applications are welcome at all, which is not the
   * same as having a role listed: a contractor will nearly always make room for
   * a good technician without a formal opening. Specific roles live in
   * `src/data/jobs.ts` and are listed on the careers page when present.
   *
   * Set `active: false` and the banner disappears site-wide.
   */
  hiring: {
    active: true,
    headline: "We're hiring",
    /**
     * ⚠️ Only name trades the business actually employs. The site sells no
     * plumbing work, so advertising plumbing roles would draw applicants for a
     * job that does not exist here.
     */
    note: "Join the team — HVAC service and installation roles.",
    ctaLabel: "Apply now",
  },

  emergency: {
    /**
     * TODO: confirm the business really does take after-hours emergency calls.
     * Set to false and the emergency CTA disappears site-wide.
     */
    offered: true,
    /**
     * Confirmed by the business: the phone is answered and technicians are
     * dispatched around the clock. This turns "Emergency HVAC Service" into
     * "24/7 Emergency HVAC Service" site-wide, and matches the opening hours
     * above — the two must agree, or the site claims 24/7 in one place while
     * telling Google it shuts at six.
     */
    available247: true,
    /**
     * Shown under the emergency CTA. Keep it factual.
     * TODO: replace with the real after-hours promise (e.g. actual hours covered).
     */
    note: "Call our main line and describe the problem — we will tell you the soonest we can be there.",
  },

  /**
   * Shown next to the contact form.
   *
   * ⚠️ This is a promise. Only state a turnaround the office consistently
   * hits — a missed "within 1 hour" does more damage than an honest "same or
   * next business day".
   * TODO: confirm and adjust.
   */
  responseTime: "We reply to every request by the next business day.",

  // ---------------------------------------------------------------------------
  // Licensing / credentials
  // ---------------------------------------------------------------------------
  /**
   * ⚠️ Do not invent any of these. Leave them empty until you have documents in
   * hand — anything left empty is simply not rendered anywhere on the site.
   */
  credentials: {
    /** TODO: e.g. "ST HVAC Lic. #000000" — leave "" if not confirmed. */
    licenseNumber: "",
    /** TODO: set true only if the business carries current liability insurance. */
    insured: false,
    /** TODO: set true only if the business is bonded. */
    bonded: false,
    /** TODO: manufacturer/industry certifications you can evidence, e.g. "NATE-certified technicians". */
    certifications: [] as string[],
    /** TODO: awards with the awarding body and year. */
    awards: [] as string[],
  },

  // ---------------------------------------------------------------------------
  // Headline numbers ("Why choose us")
  // ---------------------------------------------------------------------------
  /**
   * The big stat counters on the home page.
   *
   * ⚠️ EMPTY ON PURPOSE. Every entry here is a factual claim to customers, and
   * inflated counts ("500+ Happy Clients") are deceptive advertising under FTC
   * rules — the kind of thing that shows up in a complaint, not just a bad
   * review. The band renders only the entries you fill in, and disappears
   * entirely while the list is empty, so nothing is claimed by default.
   *
   * Fill in only what the office can evidence from job records:
   *   { value: "1,200+", label: "Jobs completed", hint: "Since 2010" }
   *
   * `foundedYear` above already powers an accurate "years in business" figure
   * elsewhere on the site — that one is computed, so it cannot drift.
   */
  stats: [] as Array<{ value: string; label: string; hint?: string }>,

  // ---------------------------------------------------------------------------
  // Social
  // ---------------------------------------------------------------------------
  /** Empty strings are skipped — the footer only renders links that exist. */
  social: {
    /** TODO */ facebook: "",
    /** TODO */ instagram: "",
    /** TODO */ youtube: "",
    /** TODO */ linkedin: "",
    /** TODO: Google Business Profile URL — powers the "leave a review" link. */
    google: "",
    /** TODO */ yelp: "",
  },
} as const;

export type Business = typeof business;

/**
 * Human-readable list of everything still holding stand-in data.
 * Delete each line as you replace the real value; when the array is empty the
 * development-only warning banner stops rendering.
 */
export const PLACEHOLDER_FIELDS: string[] = [
  "business.legalName — confirm the registered entity name and suffix",
  "business.description — used in the footer, the About band, page titles and the structured data",
  "business.foundedYear",
  "business.address — city/state still say Phoenix, AZ, but the phone number on the business card is a 314 (St. Louis, MO) line. One of the two is wrong, and it decides the service areas, the timezone and every local search result.",
  "business.address (street, postalCode, mapUrl, mapEmbedUrl)",
  "business.responseTime (only promise what the office actually hits)",
  "business.social.* (all empty)",
  "business.credentials.* (intentionally empty — never invent)",
  "data/service-areas.ts — every city is a placeholder",
  "data/team.ts — placeholder names, roles and photos",
  "app/about/page.tsx — the founding story block is still a TODO",
  "data/reviews.ts — empty on purpose, add only real reviews",
  "data/financing.ts — no lender, term or APR has been filled in",
  "public/images/* — branded stand-ins, replace with real photography",
];
