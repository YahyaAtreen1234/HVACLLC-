import { randomUUID } from "node:crypto";
import { count as countRows, execute, query, queryOne } from "../db";
import type { Lead, LeadListOptions, LeadStatus, NewLead } from "./types";

/**
 * Persistence boundary.
 *
 * Everything above this line works in terms of `LeadStore`, so changing where
 * leads are kept means writing one new implementation of this interface and
 * nothing else. That is exactly what happened when SQLite was replaced by
 * Postgres: only this file and the store it calls changed.
 */
export interface LeadStore {
  create(input: NewLead): Promise<Lead>;
  list(options?: LeadListOptions): Promise<Lead[]>;
  get(id: string): Promise<Lead | null>;
  updateStatus(id: string, status: LeadStatus): Promise<Lead | null>;
  markNotified(id: string, at: string): Promise<void>;
  markNotifyFailed(id: string, error: string): Promise<void>;
  /** Submissions from this IP hash since the given ISO timestamp. */
  countRecentByIpHash(ipHash: string, since: string): Promise<number>;
  countByStatus(): Promise<Record<LeadStatus, number>>;
}

/**
 * The driver hands back loosely-typed rows, so the mapping is done explicitly
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

export const postgresLeadStore: LeadStore = {
  async create(input) {
    const lead: Lead = {
      id: randomUUID(),
      receivedAt: new Date().toISOString(),
      ...input,
      status: "new",
      notifiedAt: null,
      notifyError: null,
    };

    await execute(
      `INSERT INTO leads (
         id, received_at, name, phone, email, zip, service_slug, service_name,
         urgency, message, source, status, ip_hash, user_agent
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
      [
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
      ],
    );

    return lead;
  },

  async list({ status, limit = 50, offset = 0 } = {}) {
    // Clamp so a caller cannot ask for the whole table in one request.
    const safeLimit = Math.min(Math.max(limit, 1), 200);
    const safeOffset = Math.max(offset, 0);

    const rows = status
      ? await query(
          `SELECT * FROM leads WHERE status = $1
           ORDER BY received_at DESC LIMIT $2 OFFSET $3`,
          [status, safeLimit, safeOffset],
        )
      : await query(
          "SELECT * FROM leads ORDER BY received_at DESC LIMIT $1 OFFSET $2",
          [safeLimit, safeOffset],
        );

    return rows.map(toLead);
  },

  async get(id) {
    const row = await queryOne("SELECT * FROM leads WHERE id = $1", [id]);
    return row ? toLead(row) : null;
  },

  async updateStatus(id, status) {
    const changed = await execute(
      "UPDATE leads SET status = $1 WHERE id = $2",
      [status, id],
    );
    if (changed === 0) return null;
    return this.get(id);
  },

  async markNotified(id, at) {
    await execute(
      "UPDATE leads SET notified_at = $1, notify_error = NULL WHERE id = $2",
      [at, id],
    );
  },

  async markNotifyFailed(id, error) {
    await execute("UPDATE leads SET notify_error = $1 WHERE id = $2", [
      error.slice(0, 500),
      id,
    ]);
  },

  countRecentByIpHash(ipHash, since) {
    return countRows(
      "SELECT COUNT(*) AS n FROM leads WHERE ip_hash = $1 AND received_at >= $2",
      [ipHash, since],
    );
  },

  async countByStatus() {
    const rows = await query<{ status: LeadStatus; n: string | number }>(
      "SELECT status, COUNT(*) AS n FROM leads GROUP BY status",
    );

    const counts = { new: 0, contacted: 0, scheduled: 0, closed: 0 };
    // COUNT(*) is a bigint, which the driver returns as a string.
    for (const row of rows) counts[row.status] = Number(row.n);
    return counts;
  },
};
