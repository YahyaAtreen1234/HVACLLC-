import { business } from "@/config/business";

/** `tel:` href for the main line. */
export const telHref = `tel:${business.phone.e164}`;

/** Human-readable main line, e.g. "(555) 555-0100". */
export const phoneDisplay = business.phone.display;

/** Separate emergency line, when the business has one. */
export const emergencyPhone = business.emergency.offered
  ? (business.emergencyPhone ?? business.phone)
  : null;

export const emergencyTelHref = emergencyPhone
  ? `tel:${emergencyPhone.e164}`
  : null;

/**
 * Formats an E.164 US number for display. Used when a number comes from
 * somewhere other than the config (e.g. a future CMS field).
 */
export function formatUsPhone(e164: string): string {
  const digits = e164.replace(/\D/g, "").replace(/^1/, "");
  if (digits.length !== 10) return e164;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}
