/**
 * Shared, dependency-free validation for the contact / service request form.
 * The exact same rules run in the browser (instant feedback) and on the server
 * (the browser is never trusted).
 */

export interface ServiceRequestInput {
  name: string;
  phone: string;
  email: string;
  zip: string;
  serviceSlug: string;
  urgency: string;
  message: string;
  /** Honeypot — must stay empty. Bots fill it in. */
  company?: string;
}

export type FieldErrors = Partial<Record<keyof ServiceRequestInput, string>>;

export const URGENCY_OPTIONS = [
  { value: "emergency", label: "No heat / no cooling — as soon as possible" },
  { value: "soon", label: "Within the next few days" },
  { value: "flexible", label: "Flexible — schedule at your convenience" },
  { value: "quote", label: "Just looking for an estimate" },
] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

function digits(value: string) {
  return value.replace(/\D/g, "");
}

export function validateServiceRequest(
  input: Partial<ServiceRequestInput>,
): FieldErrors {
  const errors: FieldErrors = {};

  const name = input.name?.trim() ?? "";
  if (name.length < 2) errors.name = "Please enter your name.";
  if (name.length > 100) errors.name = "Please shorten your name.";

  const phoneDigits = digits(input.phone ?? "");
  if (phoneDigits.length === 0) {
    errors.phone = "A phone number lets us confirm your appointment.";
  } else if (phoneDigits.length < 10 || phoneDigits.length > 11) {
    errors.phone = "Please enter a 10-digit US phone number.";
  }

  const email = input.email?.trim() ?? "";
  // Email is optional, but must be valid when supplied.
  if (email && !EMAIL_RE.test(email)) {
    errors.email = "Please check the email address.";
  }

  const zip = digits(input.zip ?? "");
  if (zip.length !== 5) {
    errors.zip = "Enter your 5-digit ZIP so we can confirm we cover you.";
  }

  if (!input.serviceSlug) {
    errors.serviceSlug = "Choose what you need help with.";
  }

  if (!input.urgency) {
    errors.urgency = "Let us know how soon you need us.";
  }

  const message = input.message?.trim() ?? "";
  if (message.length > 2000) {
    errors.message = "Please keep the description under 2000 characters.";
  }

  return errors;
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}
