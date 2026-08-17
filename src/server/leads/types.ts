/** Lead domain types, shared by the store, the service and the API routes. */

export const LEAD_STATUSES = [
  "new",
  "contacted",
  "scheduled",
  "closed",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export function isLeadStatus(value: unknown): value is LeadStatus {
  return (
    typeof value === "string" &&
    (LEAD_STATUSES as readonly string[]).includes(value)
  );
}

/** Where the lead came from. */
export type LeadSource = "website-form" | "api";

export interface Lead {
  id: string;
  /** ISO 8601, UTC. */
  receivedAt: string;
  name: string;
  phone: string;
  email: string | null;
  zip: string;
  serviceSlug: string;
  /** Human-readable service name, resolved at write time. */
  serviceName: string;
  urgency: string;
  message: string | null;
  source: LeadSource;
  status: LeadStatus;
  /** Salted hash — never the raw address. */
  ipHash: string | null;
  userAgent: string | null;
  /** When the office was successfully told. Null means nobody has been. */
  notifiedAt: string | null;
  /** Last notification failure, kept so failures are visible rather than silent. */
  notifyError: string | null;
}

/** Fields supplied when creating a lead; the rest are derived. */
export interface NewLead {
  name: string;
  phone: string;
  email: string | null;
  zip: string;
  serviceSlug: string;
  serviceName: string;
  urgency: string;
  message: string | null;
  source: LeadSource;
  ipHash: string | null;
  userAgent: string | null;
}

export interface LeadListOptions {
  status?: LeadStatus;
  limit?: number;
  offset?: number;
}
