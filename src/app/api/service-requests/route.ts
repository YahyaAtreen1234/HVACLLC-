import { submitLead } from "@/server/leads/service";
import { getClientIp, getUserAgent, hashIp } from "@/server/request-context";
import { errorJson, json } from "@/server/http";
import type { ServiceRequestInput } from "@/lib/validation";

/**
 * POST /api/service-requests — public lead intake.
 *
 * The website form uses a server action rather than this route; this exists so
 * other things can book work too: a landing page, a chat widget, a Google Ads
 * lead form extension, a phone system integration.
 *
 * It runs the exact same `submitLead` pipeline as the form, so validation,
 * rate limiting, storage and notification behave identically.
 */

// Uses node:sqlite and the filesystem, so it must run on Node, not the Edge runtime.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 16 * 1024;

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return errorJson("Send application/json.", 415);
  }

  // Guard against a huge body before parsing it.
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return errorJson("Request body too large.", 413);
  }

  let body: Partial<ServiceRequestInput>;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return errorJson("Request body too large.", 413);
    }
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return errorJson("Body must be a JSON object.", 400);
    }
    body = parsed as Partial<ServiceRequestInput>;
  } catch {
    return errorJson("Body is not valid JSON.", 400);
  }

  const outcome = await submitLead(body, {
    source: "api",
    ipHash: hashIp(getClientIp(request.headers)),
    userAgent: getUserAgent(request.headers),
  });

  if (outcome.ok) {
    return json(
      {
        id: outcome.lead.id,
        receivedAt: outcome.lead.receivedAt,
        status: outcome.lead.status,
        notified: outcome.notified,
      },
      { status: 201 },
    );
  }

  switch (outcome.reason) {
    case "validation":
      return errorJson("Some fields need attention.", 422, {
        fields: outcome.errors,
      });

    case "rate-limited":
      return errorJson("Too many requests. Please try again shortly.", 429, {
        retryAfter: outcome.retryAfter,
      });

    // A honeypot hit gets a success-shaped response on purpose: a bot that
    // sees an error learns to adapt, one that sees 202 usually moves on.
    case "spam":
      return json({ accepted: true }, { status: 202 });

    case "storage":
      return errorJson(
        "We could not record your request. Please call us instead.",
        503,
      );
  }
}

export async function GET() {
  return errorJson("Use POST to submit a service request.", 405, {
    allow: "POST",
  });
}
