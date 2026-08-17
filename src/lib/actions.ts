"use server";

import { headers } from "next/headers";
import { business } from "@/config/business";
import { submitLead } from "@/server/leads/service";
import { getClientIp, getUserAgent, hashIp } from "@/server/request-context";
import type { FieldErrors, ServiceRequestInput } from "./validation";

export interface ServiceRequestState {
  status: "idle" | "success" | "error";
  message: string;
  errors: FieldErrors;
  /** Echoed back so the form can repopulate after a failed submit. */
  values?: Partial<ServiceRequestInput>;
  /** Reference shown to the customer on success. */
  reference?: string;
}

function read(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Website form entry point.
 *
 * This is a thin adapter: it turns FormData into the shape the backend wants,
 * calls the same `submitLead` pipeline the public API uses, and turns the
 * outcome back into something the form can render. All the actual rules —
 * validation, spam handling, rate limiting, storage, notification — live in
 * `src/server/leads/service.ts` so the two entry points cannot diverge.
 */
export async function submitServiceRequest(
  _prevState: ServiceRequestState,
  formData: FormData,
): Promise<ServiceRequestState> {
  const values: ServiceRequestInput = {
    name: read(formData, "name"),
    phone: read(formData, "phone"),
    email: read(formData, "email"),
    zip: read(formData, "zip"),
    serviceSlug: read(formData, "serviceSlug"),
    urgency: read(formData, "urgency"),
    message: read(formData, "message"),
    company: read(formData, "company"),
  };

  const requestHeaders = await headers();

  const outcome = await submitLead(values, {
    source: "website-form",
    ipHash: hashIp(getClientIp(requestHeaders)),
    userAgent: getUserAgent(requestHeaders),
  });

  if (outcome.ok) {
    return {
      status: "success",
      message: outcome.notified
        ? "Request received. We will call you to confirm a time — if it is urgent, calling us is still the fastest route."
        : // Stored safely, but nobody has been paged yet. Say so plainly rather
          // than implying someone is already on it.
          `Request received and saved. Our notification system did not confirm delivery, so if this is urgent please call ${business.phone.display} as well.`,
      errors: {},
      reference: outcome.lead.id,
    };
  }

  switch (outcome.reason) {
    // Honeypot: show the bot the same screen a person would see.
    case "spam":
      return {
        status: "success",
        message: "Thanks — we will be in touch.",
        errors: {},
      };

    case "validation":
      return {
        status: "error",
        message: "Please check the highlighted fields and try again.",
        errors: outcome.errors,
        values,
      };

    case "rate-limited":
      return {
        status: "error",
        message: `That is a few requests in a short time. Please wait a moment and try again, or call ${business.phone.display} and we will take the details now.`,
        errors: {},
        values,
      };

    case "storage":
      return {
        status: "error",
        message: `We could not save your request. Please call ${business.phone.display} so this does not get missed.`,
        errors: {},
        values,
      };
  }
}
