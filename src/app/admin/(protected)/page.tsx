import Link from "next/link";
import { postgresLeadStore } from "@/server/leads/store";
import {
  areasStore,
  faqsStore,
  servicesStore,
  teamStore,
} from "@/server/content/store";
import { seedContentIfEmpty } from "@/server/content/seed";
import { configuredChannels } from "@/server/env";
import { Card, PageHeader, StatCard, Badge } from "../ui";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  await seedContentIfEmpty();

  const counts = await postgresLeadStore.countByStatus();
  const recent = await postgresLeadStore.list({ limit: 5 });
  const channels = configuredChannels();

  return (
    <>
      <PageHeader
        title="Overview"
        description="What is happening on your site right now."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="New leads" value={counts.new} hint="Awaiting a call" />
        <StatCard label="Contacted" value={counts.contacted} />
        <StatCard label="Scheduled" value={counts.scheduled} />
        <StatCard label="Closed" value={counts.closed} />
      </div>

      {!channels.length ? (
        <Card className="mt-6 border-amber-300 bg-amber-50">
          <p className="font-display font-bold text-amber-900">
            Nobody is being notified about new leads
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-amber-800">
            Requests are being stored safely and appear here, but no email or
            webhook is configured, so they will only be seen if someone opens
            this page. Set <code>SERVICE_REQUEST_WEBHOOK_URL</code> or the{" "}
            <code>RESEND_*</code> variables to fix that.
          </p>
        </Card>
      ) : null}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-ink-950">
              Latest requests
            </h2>
            <Link
              href="/admin/leads"
              className="text-sm font-semibold text-flame-600 hover:underline"
            >
              View all
            </Link>
          </div>

          {recent.length ? (
            <ul className="space-y-3">
              {recent.map((lead) => (
                <li
                  key={lead.id}
                  className="flex items-start justify-between gap-3 border-b border-ink-900/8 pb-3 last:border-b-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink-900">
                      {lead.name}
                    </p>
                    <p className="truncate text-sm text-ink-600">
                      {lead.serviceName} · {lead.phone}
                    </p>
                  </div>
                  <Badge tone={lead.status === "new" ? "warning" : "neutral"}>
                    {lead.status}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-sm text-ink-500">
              No service requests yet. They will appear here as they arrive.
            </p>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 font-display text-lg font-bold text-ink-950">
            Your content
          </h2>
          <ul className="space-y-2.5 text-sm">
            {[
              { label: "Services", count: await servicesStore.count(), href: "/admin/services" },
              { label: "Team members", count: await teamStore.count(), href: "/admin/team" },
              { label: "FAQs", count: await faqsStore.count(), href: "/admin/faqs" },
              { label: "Service areas", count: await areasStore.count(), href: "/admin/areas" },
            ].map((row) => (
              <li
                key={row.label}
                className="flex items-center justify-between border-b border-ink-900/8 pb-2.5 last:border-b-0 last:pb-0"
              >
                <Link
                  href={row.href}
                  className="font-semibold text-ink-800 hover:text-flame-600"
                >
                  {row.label}
                </Link>
                <span className="text-ink-600">{row.count}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
