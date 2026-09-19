/**
 * Equipment brands the office services, grouped by the manufacturer that owns
 * them.
 *
 * The grouping is the point. A homeowner rarely knows that Bryant, Payne, Heil,
 * Tempstar, Arcoaire, Comfortmaker and Day & Night are all built by Carrier, so
 * someone with a Comfortmaker furnace cannot tell from a flat logo wall whether
 * this company can help. Grouped, the answer is obvious at a glance.
 *
 * `logo` is optional and deliberately so. Only fifteen of these brands have a
 * logo file; the rest render as a typographic tile, which looks intentional
 * rather than broken and means the list states the real coverage instead of
 * being trimmed to whatever artwork happened to be on hand. Drop a file into
 * public/images/logos/ named for the slug and it appears automatically.
 *
 * Accent colours are used for the family header and the active tab. They lean
 * on each manufacturer's own colour where that reads clearly on the dark panel,
 * and diverge where two families would otherwise be indistinguishable — Trane,
 * Lennox, Rheem and Bosch are all predominantly red, so only one of them can
 * keep it.
 */

export interface Brand {
  name: string;
  /** Path under /images/logos/, or undefined to render the name as type. */
  logo?: string;
}

export interface BrandFamily {
  slug: string;
  /** Shown on the tab and the panel header. */
  name: string;
  /** One line explaining who actually builds these. */
  note: string;
  /** Hex, used for the header rule, the active tab and the hover ring. */
  accent: string;
  brands: Brand[];
}

const LOGOS = "/images/logos";

export const brandFamilies: BrandFamily[] = [
  {
    slug: "carrier",
    name: "Carrier Brands",
    note: "Eight badges, one manufacturer — parts and diagnostics carry across all of them.",
    accent: "#4C8DFF",
    brands: [
      { name: "Carrier", logo: `${LOGOS}/carrier.jpg` },
      { name: "Bryant", logo: `${LOGOS}/bryant.jpg` },
      { name: "Payne" },
      { name: "Heil" },
      { name: "Tempstar", logo: `${LOGOS}/tempstar.jpg` },
      { name: "Arcoaire" },
      { name: "Comfortmaker" },
      { name: "Day & Night" },
    ],
  },
  {
    slug: "trane",
    name: "Trane Brands",
    note: "Trane Technologies, including the value lines sold under other names.",
    accent: "#F4525B",
    brands: [
      { name: "Trane", logo: `${LOGOS}/trane.jpg` },
      { name: "American Standard", logo: `${LOGOS}/american-standard.jpg` },
      { name: "RunTru" },
      { name: "Oxbox" },
    ],
  },
  {
    slug: "daikin",
    name: "Daikin Group",
    note: "Daikin, with the Goodman and Amana lines built alongside them.",
    accent: "#2BC4F0",
    brands: [
      { name: "Daikin", logo: `${LOGOS}/daikin.jpg` },
      { name: "Goodman", logo: `${LOGOS}/goodman.jpg` },
      { name: "Amana", logo: `${LOGOS}/amana.jpg` },
    ],
  },
  {
    slug: "lennox",
    name: "Lennox Group",
    note: "Lennox International, premium through contractor-grade.",
    accent: "#F0559C",
    brands: [
      { name: "Lennox", logo: `${LOGOS}/lennox.jpg` },
      { name: "Armstrong Air", logo: `${LOGOS}/armstrong-air.jpg` },
      { name: "Ducane" },
      { name: "Concord" },
    ],
  },
  {
    slug: "rheem",
    name: "Rheem & Ruud",
    note: "The same equipment under two badges, split by dealer territory.",
    accent: "#FF8A3D",
    brands: [
      { name: "Rheem", logo: `${LOGOS}/rheem.jpg` },
      { name: "Ruud", logo: `${LOGOS}/ruud.jpg` },
    ],
  },
  {
    slug: "bosch",
    name: "Bosch Group",
    // Deliberately describes the badges rather than the corporate structure.
    // Ownership in this part of the industry changes hands, and a sentence
    // about who owns whom is a claim that can quietly go stale on a live page.
    note: "Bosch, with the York, Coleman and Luxaire lines.",
    accent: "#3FD48A",
    brands: [
      { name: "Bosch", logo: `${LOGOS}/bosch.jpg` },
      { name: "York", logo: `${LOGOS}/york.jpg` },
      { name: "Coleman", logo: `${LOGOS}/coleman.jpg` },
      { name: "Luxaire" },
      { name: "AC PRO" },
    ],
  },
];

/** How long each family holds before the wall advances, in milliseconds. */
export const BRAND_ROTATE_MS = 7000;

export const totalBrandCount = brandFamilies.reduce(
  (sum, family) => sum + family.brands.length,
  0,
);
