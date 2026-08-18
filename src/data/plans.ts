/**
 * Maintenance plan tiers.
 *
 * ⚠️ PRICES ARE PLACEHOLDERS. `price: ""` renders "Call for pricing" instead of
 * a number, so nothing is quoted until the office sets a real figure. A
 * published price is an offer a customer can hold you to — do not guess.
 *
 * The benefits below are the industry-standard shape of these agreements, but
 * every one of them is a promise the office has to keep. Delete any line the
 * business will not honour rather than leaving it in because it sounds good.
 */

export interface MaintenancePlan {
  slug: string;
  name: string;
  /** Empty renders "Call for pricing" rather than inventing a number. */
  price: string;
  /** e.g. "per year", "per month". Ignored when price is empty. */
  interval: string;
  summary: string;
  visitsPerYear: number;
  benefits: string[];
  /** Draws the highlighted border. Exactly one should be true. */
  featured: boolean;
}

export const maintenancePlans: MaintenancePlan[] = [
  {
    slug: "seasonal",
    name: "Seasonal",
    price: "",
    interval: "per year",
    summary:
      "One tune-up a year for a single system. Suited to a newer unit in a mild-use home.",
    visitsPerYear: 1,
    benefits: [
      "One precision tune-up per year",
      "Full safety and combustion inspection",
      "Written record of measured readings",
      "Priority booking ahead of non-members",
    ],
    featured: false,
  },
  {
    slug: "year-round",
    name: "Year-Round",
    price: "",
    interval: "per year",
    summary:
      "Cooling tune-up before summer, heating tune-up before winter. The plan most homes should be on.",
    visitsPerYear: 2,
    benefits: [
      "Two precision tune-ups per year — heating and cooling",
      "Full safety and combustion inspection",
      "Written record of measured readings",
      "Priority booking ahead of non-members",
      "Discount on repairs while the plan is active",
      "No overtime charge on after-hours calls",
    ],
    featured: true,
  },
  {
    slug: "whole-home",
    name: "Whole Home",
    price: "",
    interval: "per year",
    summary:
      "For multi-system homes, or where indoor air quality equipment also needs servicing.",
    visitsPerYear: 2,
    benefits: [
      "Everything in Year-Round, for up to three systems",
      "Indoor air quality equipment serviced",
      "Filter changes included at each visit",
      "Front-of-queue dispatch on emergency calls",
      "Transferable if you sell the home",
    ],
    featured: false,
  },
];

/** True while no tier has a real price, so the UI can flag it in development. */
export const planPricesArePlaceholder = maintenancePlans.every(
  (plan) => !plan.price,
);
