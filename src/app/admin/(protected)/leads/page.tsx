import { sqliteLeadStore } from "@/server/leads/store";
import { LEAD_STATUSES, isLeadStatus } from "@/server/leads/types";
import { updateLeadStatus } from "../../actions";
import { Badge, EmptyState, PageHeader, TableWrap, tableClasses as t } from "../../ui";

export const dynamic = "force-dynamic";

const TONE = {
  new: "warning",
  contacted: "neutral",
  scheduled: "success",
  closed: "neutral",
} as const;

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter = isLeadStatus(status) ? status : undefined;

  const leads = sqliteLeadStore.list({ status: filter, limit: 200 });
  const counts = sqliteLeadStore.countByStatus();

  return (
    <>
      <PageHeader
        title="Service requests"
        description="Everything submitted through the site, newest first."
      />

      <div className="mb-5 flex flex-wrap gap-2">
        <a
          href="/admin/leads"
          className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${
            !filter
              ? "border-flame-500 bg-flame-50 text-flame-700"
              : "border-ink-900/15 text-ink-700 hover:bg-ink-50"
          }`}
        >
          All ({Object.values(counts).reduce((a, b) => a + b, 0)})
        </a>
        {LEAD_STATUSES.map((value) => (
          <a
            key={value}
            href={`/admin/leads?status=${value}`}
            className={`rounded-lg border px-3 py-1.5 text-sm font-semibold capitalize ${
              filter === value
                ? "border-flame-500 bg-flame-50 text-flame-700"
                : "border-ink-900/15 text-ink-700 hover:bg-ink-50"
            }`}
          >
            {value} ({counts[value]})
          </a>
        ))}
      </div>

      {leads.length === 0 ? (
        <EmptyState
          title="No requests here"
          description={
            filter
              ? `Nothing with the status "${filter}" right now.`
              : "When someone submits the contact form, it will appear here — and stay here even if the notification email fails."
          }
        />
      ) : (
        <TableWrap>
          <table className={t.table}>
            <thead>
              <tr>
                <th className={t.th}>Received</th>
                <th className={t.th}>Customer</th>
                <th className={t.th}>Service</th>
                <th className={t.th}>Urgency</th>
                <th className={t.th}>Message</th>
                <th className={t.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className={t.tr}>
                  <td className={t.td}>
                    <span className="whitespace-nowrap text-ink-600">
                      {new Date(lead.receivedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    {lead.notifyError ? (
                      <span
                        title={lead.notifyError}
                        className="mt-1 block text-xs font-semibold text-red-600"
                      >
                        Notify failed
                      </span>
                    ) : null}
                  </td>

                  <td className={t.td}>
                    <p className="font-semibold text-ink-900">{lead.name}</p>
                    <a
                      href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`}
                      className="text-flame-600 hover:underline"
                    >
                      {lead.phone}
                    </a>
                    {lead.email ? (
                      <a
                        href={`mailto:${lead.email}`}
                        className="block truncate text-ink-600 hover:underline"
                      >
                        {lead.email}
                      </a>
                    ) : null}
                    <p className="text-xs text-ink-500">ZIP {lead.zip}</p>
                  </td>

                  <td className={t.td}>{lead.serviceName}</td>

                  <td className={t.td}>
                    {lead.urgency === "emergency" ? (
                      <Badge tone="danger">urgent</Badge>
                    ) : (
                      <span className="text-ink-600">{lead.urgency}</span>
                    )}
                  </td>

                  <td className={`${t.td} max-w-xs`}>
                    <p className="line-clamp-3 text-ink-700">
                      {lead.message || <span className="text-ink-400">—</span>}
                    </p>
                  </td>

                  <td className={t.td}>
                    <Badge tone={TONE[lead.status]}>{lead.status}</Badge>
                    <form action={updateLeadStatus} className="mt-2">
                      <input type="hidden" name="id" value={lead.id} />
                      <select
                        name="status"
                        defaultValue={lead.status}
                        aria-label={`Change status for ${lead.name}`}
                        className="w-full rounded border border-ink-900/15 px-2 py-1 text-xs"
                      >
                        {LEAD_STATUSES.map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="mt-1 w-full rounded bg-ink-900 px-2 py-1 text-xs font-semibold text-white hover:bg-ink-800"
                      >
                        Update
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      )}
    </>
  );
}
