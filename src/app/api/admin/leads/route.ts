import { authorizeAdmin } from "@/server/auth";
import { errorJson, json } from "@/server/http";
import { sqliteLeadStore } from "@/server/leads/store";
import { isLeadStatus, type LeadStatus } from "@/server/leads/types";

/**
 * GET /api/admin/leads — list captured leads. Requires a bearer token.
 *
 * Query parameters:
 *   status  new | contacted | scheduled | closed
 *   limit   1–200 (default 50)
 *   offset  pagination offset
 *
 * Example:
 *   curl -H "Authorization: Bearer $ADMIN_API_TOKEN" \
 *        "http://localhost:3000/api/admin/leads?status=new"
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = authorizeAdmin(request);
  if (!auth.ok) return errorJson(auth.message, auth.status);

  const url = new URL(request.url);
  const statusParam = url.searchParams.get("status");

  let status: LeadStatus | undefined;
  if (statusParam !== null) {
    if (!isLeadStatus(statusParam)) {
      return errorJson(
        "Unknown status. Use new, contacted, scheduled or closed.",
        400,
      );
    }
    status = statusParam;
  }

  const limit = Number(url.searchParams.get("limit") ?? 50);
  const offset = Number(url.searchParams.get("offset") ?? 0);

  if (!Number.isFinite(limit) || !Number.isFinite(offset)) {
    return errorJson("limit and offset must be numbers.", 400);
  }

  try {
    const leads = sqliteLeadStore.list({ status, limit, offset });

    return json({
      counts: sqliteLeadStore.countByStatus(),
      returned: leads.length,
      leads,
    });
  } catch (error) {
    console.error("[admin] failed to list leads:", error);
    return errorJson("Could not read leads.", 500);
  }
}
