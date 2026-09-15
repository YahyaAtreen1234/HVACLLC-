import type { ServiceArea } from "@/types";

/**
 * The towns the office dispatches to, across the West Valley and Phoenix.
 *
 * All eight are confirmed by the business, so none is a placeholder: every one
 * is indexable, carries its own city page and appears in the sitemap. The
 * previous list was the standard metro ring guessed at build time — Scottsdale,
 * Mesa, Tempe, Chandler, Gilbert — and those towns are gone from it, because
 * claiming an area nobody will drive to produces cancelled jobs and bad
 * reviews. Trim this list rather than adding to it.
 *
 * Ordered as the business supplied it, which is roughly the West Valley run
 * from Sun City down through Buckeye, then Phoenix and back out.
 *
 * These entries feed the service-area page, the footer column and the
 * `areaServed` property in the LocalBusiness structured data, so accuracy
 * matters for local SEO.
 *
 * ⚠️ This file is the fallback used when the database is unreachable, and the
 * seed for an empty one. The live source of truth is the admin panel at
 * /admin/areas. The same eight towns are inserted into an existing database by
 * migration 3 in src/server/db.ts — if you change a city here, that migration
 * will not update a row that already exists, by design, so edit it in the
 * panel too.
 */
export const serviceAreas: ServiceArea[] = [
  {
    slug: "sun-city",
    city: "Sun City",
    state: "AZ",
    isPlaceholder: false,
  },
  {
    slug: "peoria",
    city: "Peoria",
    state: "AZ",
    isPlaceholder: false,
  },
  {
    slug: "surprise",
    city: "Surprise",
    state: "AZ",
    isPlaceholder: false,
  },
  {
    slug: "goodyear",
    city: "Goodyear",
    state: "AZ",
    isPlaceholder: false,
  },
  {
    slug: "buckeye",
    city: "Buckeye",
    state: "AZ",
    isPlaceholder: false,
  },
  {
    slug: "phoenix",
    city: "Phoenix",
    state: "AZ",
    neighborhoods: [
      "Downtown",
      "Arcadia",
      "Ahwatukee",
      "Desert Ridge",
      "Maryvale",
      "North Mountain",
    ],
    isPlaceholder: false,
  },
  {
    slug: "glendale",
    city: "Glendale",
    state: "AZ",
    isPlaceholder: false,
  },
  {
    slug: "avondale",
    city: "Avondale",
    state: "AZ",
    isPlaceholder: false,
  },
];

/** True while any area is still a stand-in, so the UI can flag it. */
export const serviceAreasArePlaceholder = serviceAreas.some(
  (area) => area.isPlaceholder,
);
