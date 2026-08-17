/**
 * Financing content.
 *
 * ⚠️ No lender, APR, term, monthly payment or approval promise has been filled
 * in. Consumer-finance advertising is regulated (in the US, Regulation Z /
 * TILA): quoting a rate or payment triggers disclosure requirements, and
 * quoting one you cannot honour is a legal problem, not just a marketing one.
 *
 * Fill `options` in only with terms the lender has given you in writing.
 */

export interface FinancingOption {
  name: string;
  /** Plain description of the option — no rates unless confirmed. */
  description: string;
  /** Bullet points. Leave empty until the lender confirms terms. */
  details: string[];
}

/** TODO: replace with the real programmes, or set `financingOffered` to false. */
export const financingOffered = false;

/** TODO: name the actual lending partner once confirmed. */
export const financingPartner = "";

export const financingOptions: FinancingOption[] = [
  // TODO: e.g. { name: "Deferred interest plan", description: "…", details: ["…"] }
];

/** Things that are true regardless of the lender — safe to publish as-is. */
export const financingGuidance = [
  {
    title: "Replacement is usually unplanned",
    body: "Most systems are replaced because they failed, not because it was on the calendar. Spreading the cost is often what makes the right-sized system possible instead of the cheapest one.",
  },
  {
    title: "Ask what the payment actually covers",
    body: "A quote should state the equipment, the labour, permits where required, disposal of the old system and any duct or electrical work. Payments are only comparable when the scope is.",
  },
  {
    title: "Check for utility and manufacturer rebates",
    body: "Many utilities and manufacturers offer rebates on high-efficiency equipment, and some federal or state incentives apply to heat pumps. These are separate from financing and can be combined with it. Eligibility changes — confirm current programmes before you count on them.",
  },
  {
    title: "Efficiency changes the running cost, not just the price",
    body: "A more efficient system costs more up front and less per month to run. Whether that trade works out depends on your climate, your run hours and your utility rates — ask for the comparison rather than assuming.",
  },
];
