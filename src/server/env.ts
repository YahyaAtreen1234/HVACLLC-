/**
 * Server-side environment access.
 *
 * Everything is read through here so there is one place to see what the
 * backend depends on, and so a missing variable produces a clear message
 * instead of `undefined` surfacing three layers down.
 */

export const env = {
  /** Where the SQLite file lives. Relative paths resolve from the project root. */
  leadsDbPath: process.env.LEADS_DB_PATH ?? ".data/leads.db",

  /** Optional outbound webhook (Zapier/Make/CRM). */
  webhookUrl: process.env.SERVICE_REQUEST_WEBHOOK_URL ?? "",

  /** Optional email delivery via Resend's HTTP API. */
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  notifyFrom: process.env.NOTIFY_FROM_EMAIL ?? "",
  notifyTo: process.env.NOTIFY_TO_EMAIL ?? "",

  /** Bearer token protecting the admin endpoints. */
  adminToken: process.env.ADMIN_API_TOKEN ?? "",

  /**
   * Salt for hashing IP addresses before they are stored.
   * Raw IPs are personal data; we only need them for abuse control, so the
   * stored form is a one-way hash.
   */
  ipHashSalt: process.env.IP_HASH_SALT ?? "",

  /**
   * Secret used to sign admin session tokens.
   * ⚠️ Changing this invalidates all existing sessions.
   * Generate one with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   */
  adminSessionSecret: process.env.ADMIN_SESSION_SECRET ?? "",

  /**
   * Admin username for the browser panel (a single shared login, not
   * per-person accounts). Set by `npm run admin:setup`.
   */
  adminUsername: process.env.ADMIN_USERNAME ?? "admin",

  /**
   * Admin password as a scrypt hash in `salt:hash` form — see
   * src/server/admin/password.ts. Empty means the panel refuses every login.
   *
   * ⚠️ This object is evaluated once when the module first loads, so editing
   * .env.local has no effect until the server restarts.
   */
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH ?? "",

  isProduction: process.env.NODE_ENV === "production",
} as const;

/** Notification channels that are actually configured. */
export function configuredChannels(): string[] {
  const channels: string[] = [];
  if (env.webhookUrl) channels.push("webhook");
  if (env.resendApiKey && env.notifyFrom && env.notifyTo) channels.push("email");
  return channels;
}

/**
 * Problems that should block a production deploy. Surfaced by /api/health so
 * a misconfiguration is visible before a customer finds it.
 */
export function configurationWarnings(): string[] {
  const warnings: string[] = [];

  if (!configuredChannels().length) {
    warnings.push(
      "No notification channel configured — leads are stored but nobody is told about them. Set SERVICE_REQUEST_WEBHOOK_URL or the RESEND_* variables.",
    );
  }
  if (!env.adminToken) {
    warnings.push(
      "ADMIN_API_TOKEN is not set — the admin endpoints are disabled.",
    );
  }
  if (!env.ipHashSalt) {
    warnings.push(
      "IP_HASH_SALT is not set — a per-deployment random salt is used instead, so IP hashes will not match across restarts.",
    );
  }
  if (env.isProduction && !process.env.NEXT_PUBLIC_SITE_URL) {
    warnings.push("NEXT_PUBLIC_SITE_URL is not set — canonical URLs will be wrong.");
  }

  return warnings;
}
