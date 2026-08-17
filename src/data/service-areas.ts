import type { ServiceArea } from "@/types";

/**
 * Service areas across metro Phoenix.
 *
 * Phoenix itself is confirmed. The surrounding cities are the standard metro
 * coverage ring and are marked as placeholders until the office confirms which
 * ones it actually dispatches to — trim the list rather than adding to it, as
 * claiming an area you will not drive to produces cancelled jobs and bad
 * reviews.
 *
 * These entries feed the service-area page, the footer column and the
 * `areaServed` property in the LocalBusiness structured data, so accuracy
 * matters for local SEO.
 *
 * ⚠️ This file only seeds an empty database. Once the site has run, edit
 * service areas in the admin panel at /admin/areas instead — that is the live
 * source of truth.
 */
export const serviceAreas: ServiceArea[] = [
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
    slug: "scottsdale",
    city: "Scottsdale",
    state: "AZ",
    neighborhoods: ["Old Town", "North Scottsdale", "McCormick Ranch"],
    isPlaceholder: true,
  },
  {
    slug: "mesa",
    city: "Mesa",
    state: "AZ",
    neighborhoods: ["Dobson Ranch", "Red Mountain", "Eastmark"],
    isPlaceholder: true,
  },
  {
    slug: "tempe",
    city: "Tempe",
    state: "AZ",
    neighborhoods: ["Downtown Tempe", "South Tempe"],
    isPlaceholder: true,
  },
  { slug: "chandler", city: "Chandler", state: "AZ", isPlaceholder: true },
  { slug: "glendale", city: "Glendale", state: "AZ", isPlaceholder: true },
  { slug: "gilbert", city: "Gilbert", state: "AZ", isPlaceholder: true },
  { slug: "peoria", city: "Peoria", state: "AZ", isPlaceholder: true },
];

/** True while any area is still a stand-in, so the UI can flag it. */
export const serviceAreasArePlaceholder = serviceAreas.some(
  (area) => area.isPlaceholder,
);
