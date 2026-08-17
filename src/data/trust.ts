import { business } from "@/config/business";
import { serviceAreas } from "./service-areas";
import type { TrustBadgeItem } from "@/types";

/**
 * Trust badges are DERIVED from the business config, never hard-coded.
 *
 * A badge only renders when the underlying fact exists — no licence number in
 * the config means no "Licensed" badge on the site. That makes it impossible to
 * accidentally publish a credential the business does not hold.
 */
export function getTrustBadges(): TrustBadgeItem[] {
  const badges: TrustBadgeItem[] = [];

  if (business.credentials.licenseNumber) {
    badges.push({
      label: "Licensed",
      detail: business.credentials.licenseNumber,
      icon: "shield",
    });
  }

  if (business.credentials.insured) {
    badges.push({
      label: "Insured",
      detail: "Liability coverage in force",
      icon: "shield",
    });
  }

  if (business.credentials.bonded) {
    badges.push({ label: "Bonded", detail: "Surety bonded", icon: "shield" });
  }

  for (const certification of business.credentials.certifications) {
    badges.push({
      label: certification,
      detail: "Certification on file",
      icon: "check",
    });
  }

  const years = new Date().getFullYear() - business.foundedYear;
  if (years >= 1) {
    badges.push({
      label: `${years}+ years in business`,
      detail: `Serving homeowners since ${business.foundedYear}`,
      icon: "calendar",
    });
  }

  if (business.emergency.offered) {
    badges.push({
      label: business.emergency.available247
        ? "24/7 emergency service"
        : "Emergency service available",
      detail: business.emergency.available247
        ? "Someone answers around the clock"
        : "Call the main line for urgent breakdowns",
      icon: "clock",
    });
  }

  if (serviceAreas.length) {
    badges.push({
      label: `${serviceAreas.length} communities served`,
      detail: "Local crews, local drive times",
      icon: "map-pin",
    });
  }

  return badges;
}

/**
 * Short reasons-to-choose-us blocks. These describe how the work is done
 * rather than making claims that need certification. Edit freely — but only
 * keep the ones that are actually true of this business.
 */
export const differentiators = [
  {
    title: "Diagnosis before parts",
    body: "Readings first — static pressure, temperature split, electrical draw. The measurement decides the repair, so you are not paying for parts that were never the problem.",
    icon: "wrench" as const,
  },
  {
    title: "Options, not pressure",
    body: "Where there is a repair path and a replacement path, you get both, in writing, with the trade-offs explained. The decision stays yours.",
    icon: "check" as const,
  },
  {
    title: "Sized for your home",
    body: "Replacements start with a load calculation instead of copying the nameplate on the old unit — the single biggest factor in whether a new system actually feels better.",
    icon: "heat-pump" as const,
  },
  {
    title: "Clean work, documented",
    body: "Commissioning readings are recorded at start-up so there is proof the system is running to specification when we leave.",
    icon: "shield" as const,
  },
];

/** The steps a customer goes through, used by the "how it works" section. */
export const processSteps = [
  {
    title: "Tell us what is happening",
    body: "Call or send the form. Describe the symptoms, the equipment and how urgent it is.",
  },
  {
    title: "Get a scheduled window",
    body: "You get an appointment window rather than an open-ended wait, and a heads-up before the technician arrives.",
  },
  {
    title: "Diagnosis and options",
    body: "The system is measured and tested, then you get the findings and the options — in writing, before work starts.",
  },
  {
    title: "The work, done properly",
    body: "Repairs are completed and verified with readings. The work area is left clean.",
  },
];
