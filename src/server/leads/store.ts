import { randomUUID } from "node:crypto";
import { getDb } from "../db";
import type {
  Lead,
  LeadListOptions,
  LeadStatus,
  NewLead,
} from "./types";

/**
 * Persistence boundary.
 *
 * Everything above this line works in terms of `LeadStore`, so swapping SQLite
 * for Postgres (required on serverless hosts with an ephemeral filesystem)
 * means writing one new implementation of this interface and nothing else.
 */
export interface LeadStore {
  create(input: NewLead): Lead;
  list(options?: LeadListOptions): Lead[];
  get(id: string): Lead | null;
  updateStatus(id: string, status: LeadStatus): Lead | null;
  markNotified(id: string, at: string): void;
  markNotifyFailed(id: string, error: string): void;
  /** Submissions from this IP hash since the given ISO timestamp. */
  countRecentByIpHash(ipHash: string, since: string): number;
  countByStatus(): Record<LeadStatus, number>;
}

/**
 * SQLite hands back loosely-typed rows, so the mapping is done explicitly
 * rather than with a blind cast. Columns declared NOT NULL go through `str`;
 * nullable ones through `strOrNull`. If the schema and this code ever drift,
 * the failure is a clear one at the boundary instead of an `undefined`
 * surfacing somewhere far away.
 */
type Row = Record<string, unknown>;

function str(row: Row, column: string): string {
  const value = row[column];
  return typeof value === "string" ? value : String(value ?? "");
}

function strOrNull(row: Row, column: string): string | null {
  const value = row[column];
  return typeof value === "string" ? value : null;
}

function toLead(row: Row): Lead {
  return {
    id: str(row, "id"),
    receivedAt: str(row, "received_at"),
    name: str(row, "name"),
    phone: str(row, "phone"),
    email: strOrNull(row, "email"),
    zip: str(row, "zip"),
    serviceSlug: str(row, "service_slug"),
    serviceName: str(row, "service_name"),
    urgency: str(row, "urgency"),
    message: strOrNull(row, "message"),
    source: str(row, "source") as Lead["source"],
    status: str(row, "status") as LeadStatus,
    ipHash: strOrNull(row, "ip_hash"),
    userAgent: strOrNull(row, "user_agent"),
    notifiedAt: strOrNull(row, "notified_at"),
    notifyError: strOrNull(row, "notify_error"),
  };
}

export const sqliteLeadStore: LeadStore = {
  create(input) {
    const lead: Lead = {
      id: randomUUID(),
      receivedAt: new Date().toISOString(),
      ...input,
      status: "new",
      notifiedAt: null,
      notifyError: null,
    };

    getDb()
      .prepare(
        `INSERT INTO leads (
           id, received_at, name, phone, email, zip, service_slug, service_name,
           urgency, message, source, status, ip_hash, user_agent
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        lead.id,
        lead.receivedAt,
        lead.name,
        lead.phone,
        lead.email,
        lead.zip,
        lead.serviceSlug,
        lead.serviceName,
        lead.urgency,
        lead.message,
        lead.source,
        lead.status,
        lead.ipHash,
        lead.userAgent,
      );

    return lead;
  },

  list({ status, limit = 50, offset = 0 } = {}) {
    // Clamp so a caller cannot ask for the whole table in one request.
    const safeLimit = Math.min(Math.max(limit, 1), 200);
    const safeOffset = Math.max(offset, 0);

    const rows: Row[] = status
      ? getDb()
          .prepare(
            `SELECT * FROM leads WHERE status = ?
             ORDER BY received_at DESC LIMIT ? OFFSET ?`,
          )
          .all(status, safeLimit, safeOffset)
      : getDb()
          .prepare(
            `SELECT * FROM leads ORDER BY received_at DESC LIMIT ? OFFSET ?`,
          )
          .all(safeLimit, safeOffset);

    return rows.map(toLead);
  },

  get(id) {
    const row: Row | undefined = getDb()
      .prepare("SELECT * FROM leads WHERE id = ?")
      .get(id);
    return row ? toLead(row) : null;
  },

  updateStatus(id, status) {
    const result = getDb()
      .prepare("UPDATE leads SET status = ? WHERE id = ?")
      .run(status, id);
    if (result.changes === 0) return null;
    return this.get(id);
  },

  markNotified(id, at) {
    getDb()
      .prepare("UPDATE leads SET notified_at = ?, notify_error = NULL WHERE id = ?")
      .run(at, id);
  },

  markNotifyFailed(id, error) {
    getDb()
      .prepare("UPDATE leads SET notify_error = ? WHERE id = ?")
      .run(error.slice(0, 500), id);
  },

  countRecentByIpHash(ipHash, since) {
    const row = getDb()
      .prepare(
        "SELECT COUNT(*) AS n FROM leads WHERE ip_hash = ? AND received_at >= ?",
      )
      .get(ipHash, since) as { n: number };
    return row.n;
  },

  countByStatus() {
    const rows = getDb()
      .prepare("SELECT status, COUNT(*) AS n FROM leads GROUP BY status")
      .all() as Array<{ status: LeadStatus; n: number }>;

    const counts = { new: 0, contacted: 0, scheduled: 0, closed: 0 };
    for (const row of rows) counts[row.status] = row.n;
    return counts;
  },
};
