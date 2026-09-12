import { test, describe, before } from "node:test";
import assert from "node:assert/strict";

import type { LeadStore } from "../src/server/leads/store";
import type { Lead, LeadStatus, NewLead } from "../src/server/leads/types";

/**
 * Lead notification is optional. These tests exist because it did not look
 * that way during deployment: a "Required" column in the README and a health
 * warning that named SERVICE_REQUEST_WEBHOOK_URL read as a missing mandatory
 * variable, and the obvious way to silence that is to paste in a made-up URL.
 *
 * A fabricated webhook URL is worse than an empty one. Empty means the lead is
 * stored and listed with no alert sent. A bogus URL means a real outbound POST
 * on every enquiry — to a host that may not exist, may belong to someone else,
 * or may quietly accept a customer's name, phone number and address. The
 * variable must therefore stay genuinely optional, and that is what is pinned
 * here.
 *
 * `env` snapshots process.env once at module load, so the variables are cleared
 * before the modules under test are imported. Hence the dynamic imports —
 * static ones are hoisted above the deletions and would capture whatever the
 * developer happens to have in their shell.
 */

type NotifyModule = typeof import("../src/server/notify");
type EnvModule = typeof import("../src/server/env");
type ServiceModule = typeof import("../src/server/leads/service");
type RateLimitModule = typeof import("../src/server/rate-limit");

let notify: NotifyModule;
let envModule: EnvModule;
let service: ServiceModule;
let rateLimit: RateLimitModule;

before(async () => {
  delete process.env.SERVICE_REQUEST_WEBHOOK_URL;
  delete process.env.RESEND_API_KEY;
  delete process.env.NOTIFY_FROM_EMAIL;
  delete process.env.NOTIFY_TO_EMAIL;

  // Exercise the production branch: in development `notifyNewLead` logs the
  // payload to the console and reports no error, which would hide the
  // behaviour these tests are about.
  //
  // Written through a cast because Next types NODE_ENV as a read-only literal
  // union — correct for application code, which must never reassign it, and an
  // obstacle only here where the point is to pick the branch under test.
  (process.env as Record<string, string>).NODE_ENV = "production";

  envModule = await import("../src/server/env");
  notify = await import("../src/server/notify");
  service = await import("../src/server/leads/service");
  rateLimit = await import("../src/server/rate-limit");
});

function createFakeStore(): LeadStore & { leads: Lead[] } {
  const leads: Lead[] = [];

  return {
    leads,
    async create(input: NewLead) {
      const lead: Lead = {
        id: `test-${leads.length + 1}`,
        receivedAt: new Date().toISOString(),
        ...input,
        status: "new",
        notifiedAt: null,
        notifyError: null,
      };
      leads.push(lead);
      return lead;
    },
    list: async () => leads,
    get: async (id) => leads.find((lead) => lead.id === id) ?? null,
    async updateStatus(id, status: LeadStatus) {
      const lead = leads.find((entry) => entry.id === id);
      if (!lead) return null;
      lead.status = status;
      return lead;
    },
    async markNotified(id, at) {
      const lead = leads.find((entry) => entry.id === id);
      if (lead) lead.notifiedAt = at;
    },
    async markNotifyFailed(id, error) {
      const lead = leads.find((entry) => entry.id === id);
      if (lead) lead.notifyError = error;
    },
    countRecentByIpHash: async (ipHash) =>
      leads.filter((lead) => lead.ipHash === ipHash).length,
    countByStatus: async () => ({
      new: leads.length,
      contacted: 0,
      scheduled: 0,
      closed: 0,
    }),
  };
}

const validInput = {
  name: "Jordan Rivera",
  phone: "(555) 555-0123",
  email: "jordan@example.com",
  zip: "12345",
  serviceSlug: "ac-repair",
  urgency: "soon",
  message: "Blowing warm since yesterday.",
};

const context = {
  source: "website-form" as const,
  ipHash: "hash-optional",
  userAgent: "test-agent",
};

const fakeResolveServiceName = async () => "AC Repair";

describe("notification channels are optional", () => {
  test("no channel is reported as configured when none is set", () => {
    assert.deepEqual(envModule.configuredChannels(), []);
  });

  test("an absent webhook is not a configuration error", () => {
    const warnings = envModule.configurationWarnings();
    const alertWarning = warnings.find((w) => w.includes("lead alerts"));

    assert.ok(alertWarning, "the operator is still told nobody is being alerted");
    assert.match(
      alertWarning,
      /optional/i,
      "the warning must say so, or it reads as a missing required variable",
    );
  });

  test("notifying with no channel configured never throws", async () => {
    const lead = (await createFakeStore().create({
      name: "Jordan Rivera",
      phone: "(555) 555-0123",
      email: null,
      zip: "12345",
      serviceSlug: "ac-repair",
      serviceName: "AC Repair",
      urgency: "soon",
      message: null,
      source: "website-form",
      ipHash: null,
      userAgent: null,
    })) as Lead;

    const result = await notify.notifyNewLead(lead);

    assert.equal(result.delivered, false);
    assert.deepEqual(result.channels, []);
  });
});

describe("a lead survives having nowhere to send an alert", () => {
  before(() => rateLimit.resetRateLimits());

  test("the submission succeeds with no webhook and no email", async () => {
    const store = createFakeStore();

    const outcome = await service.submitLead(
      validInput,
      context,
      store,
      fakeResolveServiceName,
    );

    assert.equal(
      outcome.ok,
      true,
      "a missing notification channel must never fail the request",
    );
    assert.equal(store.leads.length, 1, "the lead is stored regardless");
    assert.equal(store.leads[0].name, "Jordan Rivera");
  });

  test("the lead is readable in the admin panel afterwards", async () => {
    rateLimit.resetRateLimits();
    const store = createFakeStore();

    await service.submitLead(
      validInput,
      { ...context, ipHash: "hash-admin" },
      store,
      fakeResolveServiceName,
    );

    const listed = await store.list();
    assert.equal(listed.length, 1, "it appears at /admin/leads, which is the fallback");
    assert.equal(listed[0].status, "new");
  });

  test("the lead records why no alert went out, without being lost", async () => {
    rateLimit.resetRateLimits();
    const store = createFakeStore();

    const outcome = await service.submitLead(
      validInput,
      { ...context, ipHash: "hash-record" },
      store,
      fakeResolveServiceName,
    );

    assert.equal(outcome.ok, true);
    if (outcome.ok) {
      assert.equal(outcome.notified, false, "nothing was delivered, and it says so");
    }
    // The operator can see the reason on the lead itself rather than having to
    // reason about environment variables.
    assert.match(store.leads[0].notifyError ?? "", /no notification channel/i);
  });
});
