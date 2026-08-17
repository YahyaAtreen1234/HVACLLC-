import type { ComparisonRow } from "@/types";

/**
 * Repair-vs-replace decision table.
 *
 * This is the comparison an HVAC customer actually needs. A tiered price table
 * would be the obvious alternative, but every cell in it would be a number
 * nobody has confirmed — and a published price you will not honour is worse
 * than no price at all. See the note at the bottom of this file for how to add
 * real pricing tiers when you have them.
 *
 * Nothing here is company-specific: these are the industry rules of thumb, and
 * they stay true whoever does the work.
 */
export const repairVsReplace: ComparisonRow[] = [
  {
    criterion: "System age",
    optionA: "Under about 10 years",
    optionB: "12–15 years or older",
  },
  {
    criterion: "What failed",
    optionA: "Capacitor, contactor, sensor, board, motor",
    optionB: "Compressor, or a cracked heat exchanger",
  },
  {
    criterion: "Repair cost vs replacement",
    optionA: "A small fraction of a new system",
    optionB: "Approaching a large share of replacement",
  },
  {
    criterion: "Repair history",
    optionA: "First real fault",
    optionB: "Third call in two seasons",
  },
  {
    criterion: "Refrigerant type",
    optionA: "Current refrigerant, parts available",
    optionB: "R-22, which is no longer produced",
  },
  {
    criterion: "Comfort right now",
    optionA: "Rooms are even, bills are steady",
    optionB: "Hot and cold rooms, bills climbing yearly",
  },
  {
    criterion: "How long you are staying",
    optionA: "Moving within a couple of years",
    optionB: "Staying long enough to earn back efficiency",
  },
];

/**
 * TODO — tiered pricing.
 *
 * If you want a pricing table on this page, add the tiers here (name, what is
 * included, real price) and render them with the same <ComparisonTable>. Only
 * publish figures you will honour on the invoice, and state clearly what is
 * excluded (parts, after-hours rates, permits).
 */
export const pricingTiers: never[] = [];
