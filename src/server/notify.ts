import { business } from "@/config/business";
import { env, configuredChannels } from "./env";
import type { Lead } from "./leads/types";

/**
 * Telling the office a lead came in.
 *
 * Two channels, both optional and independent:
 *   • webhook — POST the lead as JSON (Zapier, Make, n8n, a CRM intake URL)
 *   • email   — via Resend's HTTP API (no SMTP library, no extra dependency)
 *
 * Notification is deliberately decoupled from storage. The lead is written to
 * the database first and this runs afterwards, so a dead webhook or an expired
 * API key can never cause a lost customer — it produces a lead marked
 * `notify_error` that shows up in the admin list instead.
 */

export interface NotifyResult {
  delivered: boolean;
  /** Channels that succeeded. */
  channels: string[];
  /** Human-readable failure summary, or null when everything worked. */
  error: string | null;
}

const URGENCY_LABEL: Record<string, string> = {
  emergency: "URGENT — no heat / no cooling",
  soon: "Within a few days",
  flexible: "Flexible",
  quote: "Estimate only",
};

function plainTextBody(lead: Lead): string {
  return [
    `New service request — ${business.name}`,
    "",
    `Name:     ${lead.name}`,
    `Phone:    ${lead.phone}`,
    `Email:    ${lead.email ?? "(not supplied)"}`,
    `ZIP:      ${lead.zip}`,
    `Service:  ${lead.serviceName}`,
    `Urgency:  ${URGENCY_LABEL[lead.urgency] ?? lead.urgency}`,
    "",
    "Message:",
    lead.message?.trim() || "(none)",
    "",
    `Received: ${new Date(lead.receivedAt).toLocaleString("en-US")}`,
    `Ref:      ${lead.id}`,
  ].join("\n");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function htmlBody(lead: Lead): string {
  const row = (label: string, value: string) =>
    `<tr><td style="padding:6px 14px 6px 0;color:#5b6b7c;font:600 13px system-ui">${label}</td>` +
    `<td style="padding:6px 0;color:#0c1e2e;font:14px system-ui">${escapeHtml(value)}</td></tr>`;

  return `<div style="font:14px system-ui;color:#0c1e2e">
    <h2 style="margin:0 0 4px;font:700 20px system-ui">New service request</h2>
    <p style="margin:0 0 16px;color:#5b6b7c">${escapeHtml(business.name)}</p>
    <table style="border-collapse:collapse">
      ${row("Name", lead.name)}
      ${row("Phone", lead.phone)}
      ${row("Email", lead.email ?? "(not supplied)")}
      ${row("ZIP", lead.zip)}
      ${row("Service", lead.serviceName)}
      ${row("Urgency", URGENCY_LABEL[lead.urgency] ?? lead.urgency)}
    </table>
    <p style="margin:16px 0 4px;color:#5b6b7c;font:600 13px system-ui">Message</p>
    <p style="margin:0;white-space:pre-wrap">${escapeHtml(lead.message?.trim() || "(none)")}</p>
    <p style="margin:20px 0 0;color:#8798a8;font-size:12px">Ref ${lead.id}</p>
  </div>`;
}

async function sendWebhook(lead: Lead): Promise<void> {
  const response = await fetch(env.webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: lead.id,
      receivedAt: lead.receivedAt,
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      zip: lead.zip,
      service: lead.serviceName,
      serviceSlug: lead.serviceSlug,
      urgency: lead.urgency,
      message: lead.message,
      source: lead.source,
    }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(`webhook responded ${response.status}`);
  }
}

async function sendEmail(lead: Lead): Promise<void> {
  const isUrgent = lead.urgency === "emergency";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.notifyFrom,
      to: env.notifyTo.split(",").map((address) => address.trim()),
      // Reply-to the customer, so hitting reply in the inbox does the right thing.
      ...(lead.email ? { reply_to: lead.email } : {}),
      subject: `${isUrgent ? "[URGENT] " : ""}Service request — ${lead.name}, ${lead.serviceName}`,
      text: plainTextBody(lead),
      html: htmlBody(lead),
    }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`email API responded ${response.status} ${detail.slice(0, 200)}`);
  }
}

/**
 * Fires every configured channel. A channel failing does not stop the others,
 * and the caller decides what to record — this never throws.
 */
export async function notifyNewLead(lead: Lead): Promise<NotifyResult> {
  const channels = configuredChannels();

  if (!channels.length) {
    if (!env.isProduction) {
      console.info(
        `[leads] ${lead.id} stored. No notification channel configured — payload:\n${plainTextBody(lead)}`,
      );
      return { delivered: false, channels: [], error: null };
    }
    return {
      delivered: false,
      channels: [],
      error: "No notification channel configured",
    };
  }

  const results = await Promise.allSettled(
    channels.map((channel) =>
      channel === "webhook" ? sendWebhook(lead) : sendEmail(lead),
    ),
  );

  const succeeded: string[] = [];
  const failures: string[] = [];

  results.forEach((result, index) => {
    const channel = channels[index];
    if (result.status === "fulfilled") {
      succeeded.push(channel);
    } else {
      const reason =
        result.reason instanceof Error
          ? result.reason.message
          : String(result.reason);
      failures.push(`${channel}: ${reason}`);
    }
  });

  if (failures.length) {
    console.error(`[leads] ${lead.id} notification failures — ${failures.join("; ")}`);
  }

  return {
    delivered: succeeded.length > 0,
    channels: succeeded,
    error: failures.length ? failures.join("; ") : null,
  };
}
