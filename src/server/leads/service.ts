import { getService } from "../content/read";
import {
  hasErrors,
  validateServiceRequest,
  type FieldErrors,
  type ServiceRequestInput,
} from "@/lib/validation";
import { notifyNewLead } from "../notify";
import { checkRateLimit } from "../rate-limit";
import { postgresLeadStore, type LeadStore } from "./store";
import type { Lead, LeadSource } from "./types";

/**
 * The one path a service request takes, whether it arrives from the website
 * form or the public API. Both call `submitLead`, so validation, spam
 * handling, rate limiting, storage and notification can never drift apart
 * between the two entry points.
 *
 * Order matters: **store first, notify second.** A notification failure is
 * recoverable — the lead is in the database and shows up in the admin list
 * with its error. A storage failure is not, which is why it is the only step
 * that can fail the request.
 */

/** Longer-window cap that survives restarts, backing up the in-memory limiter. */
const DB_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const DB_MAX_PER_WINDOW = 8;

export type SubmitOutcome =
  | { ok: true; lead: Lead; notified: boolean; notifyError: string | null }
  | { ok: false; reason: "validation"; errors: FieldErrors }
  | { ok: false; reason: "rate-limited"; retryAfter: number }
  | { ok: false; reason: "spam" }
  | { ok: false; reason: "storage"; error: string };

export interface SubmitContext {
  source: LeadSource;
  ipHash: string | null;
  userAgent: string | null;
}

/**
 * Turns a service slug into its display name.
 *
 * Injected like the store so a caller — in practice a test — can supply the
 * lookup instead of reaching the content database. Before this existed,
 * `submitLead` imported the read layer directly, which meant a test that had
 * carefully faked the store still needed a live database to run.
 */
export type ResolveServiceName = (slug: string) => Promise<string | null>;

const lookUpServiceName: ResolveServiceName = async (slug) =>
  (await getService(slug))?.name ?? null;

export async function submitLead(
  input: Partial<ServiceRequestInput>,
  context: SubmitContext,
  store: LeadStore = postgresLeadStore,
  resolveServiceName: ResolveServiceName = lookUpServiceName,
): Promise<SubmitOutcome> {
  // 1. Honeypot. Accepted-looking response, nothing stored — a bot that gets
  //    an error learns to try again, one that gets a 200 usually does not.
  if (input.company) {
    return { ok: false, reason: "spam" };
  }

  // 2. Same rules the browser ran, re-run here. The client is never trusted.
  const errors = validateServiceRequest(input);
  if (hasErrors(errors)) {
    return { ok: false, reason: "validation", errors };
  }

  // 3. Rate limit: fast in-memory window, then the durable database cap.
  const limit = checkRateLimit(context.ipHash);
  if (!limit.allowed) {
    return { ok: false, reason: "rate-limited", retryAfter: limit.retryAfter };
  }

  if (context.ipHash) {
    const since = new Date(Date.now() - DB_WINDOW_MS).toISOString();

    // A database failure here must not escape. This check is a backstop behind
    // the in-memory limiter above, and letting it throw turned an unreachable
    // database into a bare 500 — instead of the handled response that tells
    // the customer to phone instead. Skipping the backstop is the lesser harm:
    // the in-memory window still applies.
    let recent = 0;
    try {
      recent = await store.countRecentByIpHash(context.ipHash, since);
    } catch {
      recent = 0;
    }

    if (recent >= DB_MAX_PER_WINDOW) {
      return { ok: false, reason: "rate-limited", retryAfter: 900 };
    }
  }

  // 4. Store.
  const serviceSlug = input.serviceSlug!;

  // The display name is cosmetic — the slug is the field that matters, and it
  // is already validated. Losing an enquiry because a lookup for a prettier
  // label failed would be the wrong trade, so a failure here degrades to the
  // fallback instead of failing the submission.
  let serviceName = "Something else / not sure";
  try {
    serviceName = (await resolveServiceName(serviceSlug)) ?? serviceName;
  } catch {
    // Left at the fallback deliberately.
  }

  let lead: Lead;
  try {
    lead = await store.create({
      name: input.name!.trim(),
      phone: input.phone!.trim(),
      email: input.email?.trim() || null,
      zip: input.zip!.trim(),
      serviceSlug,
      serviceName,
      urgency: input.urgency!,
      message: input.message?.trim() || null,
      source: context.source,
      ipHash: context.ipHash,
      userAgent: context.userAgent,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[leads] failed to store a request:", message);
    return { ok: false, reason: "storage", error: message };
  }

  // 5. Notify. Never throws; the outcome is recorded against the lead.
  const result = await notifyNewLead(lead);

  try {
    if (result.delivered) {
      store.markNotified(lead.id, new Date().toISOString());
    } else if (result.error) {
      store.markNotifyFailed(lead.id, result.error);
    }
  } catch (error) {
    // Bookkeeping only — the lead itself is already safe.
    console.error("[leads] could not record notification state:", error);
  }

  return {
    ok: true,
    lead,
    notified: result.delivered,
    notifyError: result.error,
  };
}
