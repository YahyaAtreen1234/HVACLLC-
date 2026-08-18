import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";

import { submitLead } from "../src/server/leads/service";
import { resetRateLimits } from "../src/server/rate-limit";
import { validateServiceRequest, hasErrors } from "../src/lib/validation";
import type { LeadStore } from "../src/server/leads/store";
import type { Lead, LeadStatus, NewLead } from "../src/server/leads/types";

/**
 * Backend tests. Run with `npm test`.
 *
 * These cover the paths where a silent failure costs a real customer: a valid
 * request being rejected, an invalid one being accepted, a lead not being
 * stored, or a notification failure taking the lead down with it.
 *
 * The store is faked so the tests never touch the filesystem or the network.
 */

function createFakeStore(): LeadStore & { leads: Lead[] } {
  const leads: Lead[] = [];

  // Async to match `LeadStore`, which became promise-based when the backing
  // database moved from in-process SQLite to Postgres over the network.
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

/**
 * Stands in for the content lookup.
 *
 * `submitLead` needs a display name for the chosen service, which in
 * production means a database read. Supplying it here keeps the faked store as
 * the only dependency these tests have — otherwise every one of them would
 * need a live Postgres just to resolve a label.
 */
const fakeResolveServiceName = async (slug: string): Promise<string | null> =>
  slug === "ac-repair" ? "AC Repair" : null;

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
  ipHash: "hash-a",
  userAgent: "test-agent",
};

beforeEach(() => {
  resetRateLimits();
});

describe("validation", () => {
  test("accepts a complete request", () => {
    assert.equal(hasErrors(validateServiceRequest(validInput)), false);
  });

  test("email is optional but must be valid when given", () => {
    assert.equal(
      hasErrors(validateServiceRequest({ ...validInput, email: "" })),
      false,
    );
    assert.ok(validateServiceRequest({ ...validInput, email: "not-an-email" }).email);
  });

  test("rejects a short phone number", () => {
    assert.ok(validateServiceRequest({ ...validInput, phone: "555" }).phone);
  });

  test("requires a 5-digit ZIP", () => {
    assert.ok(validateServiceRequest({ ...validInput, zip: "123" }).zip);
  });

  test("requires a service and an urgency", () => {
    const errors = validateServiceRequest({
      ...validInput,
      serviceSlug: "",
      urgency: "",
    });
    assert.ok(errors.serviceSlug);
    assert.ok(errors.urgency);
  });
});

describe("submitLead", () => {
  test("stores a valid request and resolves the service name", async () => {
    const store = createFakeStore();
    const outcome = await submitLead(validInput, context, store, fakeResolveServiceName);

    assert.equal(outcome.ok, true);
    assert.equal(store.leads.length, 1);
    assert.equal(store.leads[0].name, "Jordan Rivera");
    assert.equal(store.leads[0].serviceName, "AC Repair");
    assert.equal(store.leads[0].status, "new");
  });

  test("never stores an invalid request", async () => {
    const store = createFakeStore();
    const outcome = await submitLead({ ...validInput, phone: "" }, context, store, fakeResolveServiceName);

    assert.equal(outcome.ok, false);
    if (!outcome.ok) assert.equal(outcome.reason, "validation");
    assert.equal(store.leads.length, 0);
  });

  test("drops honeypot submissions without storing them", async () => {
    const store = createFakeStore();
    const outcome = await submitLead(
      { ...validInput, company: "spam-bot" },
      context,
      store,
      fakeResolveServiceName,
    );

    assert.equal(outcome.ok, false);
    if (!outcome.ok) assert.equal(outcome.reason, "spam");
    assert.equal(store.leads.length, 0);
  });

  test("does not store the raw IP address", async () => {
    const store = createFakeStore();
    await submitLead(validInput, { ...context, ipHash: "hashed-value" }, store, fakeResolveServiceName);

    const serialised = JSON.stringify(store.leads[0]);
    assert.ok(!serialised.includes("192.168"));
    assert.equal(store.leads[0].ipHash, "hashed-value");
  });

  test("keeps the lead even when no notification channel is configured", async () => {
    const store = createFakeStore();
    const outcome = await submitLead(validInput, context, store, fakeResolveServiceName);

    // No channels are set in the test environment, so nothing is delivered —
    // but losing the lead over that would be the actual bug.
    assert.equal(outcome.ok, true);
    if (outcome.ok) assert.equal(outcome.notified, false);
    assert.equal(store.leads.length, 1);
  });

  test("rate-limits repeated submissions from one source", async () => {
    const store = createFakeStore();
    const results = [];

    for (let i = 0; i < 7; i++) {
      results.push(await submitLead(validInput, context, store, fakeResolveServiceName));
    }

    const accepted = results.filter((result) => result.ok).length;
    const limited = results.filter(
      (result) => !result.ok && result.reason === "rate-limited",
    ).length;

    assert.equal(accepted, 5, "five submissions allowed per window");
    assert.equal(limited, 2, "the rest are rate-limited");
    assert.equal(store.leads.length, 5);
  });

  test("rate limits are per source, not global", async () => {
    const store = createFakeStore();

    for (let i = 0; i < 5; i++) {
      await submitLead(validInput, context, store, fakeResolveServiceName);
    }

    const other = await submitLead(
      validInput,
      { ...context, ipHash: "hash-b" },
      store,
      fakeResolveServiceName,
    );

    assert.equal(other.ok, true, "a different visitor is unaffected");
  });

  test("reports a storage failure instead of claiming success", async () => {
    const store = createFakeStore();
    store.create = () => {
      throw new Error("disk full");
    };

    const outcome = await submitLead(validInput, context, store, fakeResolveServiceName);

    assert.equal(outcome.ok, false);
    if (!outcome.ok) assert.equal(outcome.reason, "storage");
  });
});
