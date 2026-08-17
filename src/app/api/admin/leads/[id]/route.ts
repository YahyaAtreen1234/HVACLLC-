import { authorizeAdmin } from "@/server/auth";
import { errorJson, json } from "@/server/http";
import { sqliteLeadStore } from "@/server/leads/store";
import { isLeadStatus } from "@/server/leads/types";

/**
 * GET   /api/admin/leads/:id  — fetch one lead
 * PATCH /api/admin/leads/:id  — move it along the pipeline
 *
 * Both require a bearer token.
 *
 * Example:
 *   curl -X PATCH -H "Authorization: Bearer $ADMIN_API_TOKEN" \
 *        -H "Content-Type: application/json" -d '{"status":"contacted"}' \
 *        http://localhost:3000/api/admin/leads/<id>
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = authorizeAdmin(request);
  if (!auth.ok) return errorJson(auth.message, auth.status);

  const { id } = await params;
  const lead = sqliteLeadStore.get(id);

  if (!lead) return errorJson("No lead with that id.", 404);
  return json({ lead });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = authorizeAdmin(request);
  if (!auth.ok) return errorJson(auth.message, auth.status);

  const { id } = await params;

  let body: { status?: unknown };
  try {
    body = (await request.json()) as { status?: unknown };
  } catch {
    return errorJson("Body is not valid JSON.", 400);
  }

  if (!isLeadStatus(body.status)) {
    return errorJson(
      "Provide a status of new, contacted, scheduled or closed.",
      422,
    );
  }

  const updated = sqliteLeadStore.updateStatus(id, body.status);
  if (!updated) return errorJson("No lead with that id.", 404);

  return json({ lead: updated });
}
