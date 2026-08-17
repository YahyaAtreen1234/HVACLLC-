import Link from "next/link";
import { areasStore } from "@/server/content/store";
import { seedContentIfEmpty } from "@/server/content/seed";
import { Badge, EmptyState, PageHeader, TableWrap, tableClasses as t } from "../../ui";

export const dynamic = "force-dynamic";

const isPlaceholder = (city: string) => /^(primary|second|third) city$/i.test(city);

export default function AreasAdminPage() {
  seedContentIfEmpty();
  const areas = areasStore.all(true);
  const placeholders = areas.filter((area) => isPlaceholder(area.city)).length;

  return (
    <>
      <PageHeader
        title="Service areas"
        description="Where you work. These feed the footer, the service-areas page and your local search listing."
        action={{ href: "/admin/areas/new", label: "Add area" }}
      />

      {placeholders > 0 ? (
        <div className="mb-5 rounded-xl border border-amber-300 bg-amber-50 p-4">
          <p className="text-sm leading-relaxed text-amber-900">
            <strong>{placeholders} placeholder cit{placeholders === 1 ? "y is" : "ies are"} live.</strong>{" "}
            Replace them with the towns you actually cover — this is the data
            Google uses to decide which local searches you show up in.
          </p>
        </div>
      ) : null}

      {areas.length === 0 ? (
        <EmptyState
          title="No service areas"
          description="Add the towns and cities you cover so customers and search engines know where you work."
          action={{ href: "/admin/areas/new", label: "Add area" }}
        />
      ) : (
        <TableWrap>
          <table className={t.table}>
            <thead>
              <tr>
                <th className={t.th}>Order</th>
                <th className={t.th}>City</th>
                <th className={t.th}>Neighbourhoods</th>
                <th className={t.th}>Status</th>
                <th className={t.th} />
              </tr>
            </thead>
            <tbody>
              {areas.map((area) => (
                <tr key={area.id} className={t.tr}>
                  <td className={t.td}>
                    <span className="text-ink-500">{area.sortOrder}</span>
                  </td>
                  <td className={t.td}>
                    <p className="font-semibold text-ink-900">
                      {area.city}, {area.state}
                    </p>
                  </td>
                  <td className={`${t.td} max-w-md`}>
                    <p className="line-clamp-2 text-ink-700">
                      {area.neighborhoods.join(", ") || (
                        <span className="text-ink-400">—</span>
                      )}
                    </p>
                  </td>
                  <td className={t.td}>
                    {isPlaceholder(area.city) ? (
                      <Badge tone="warning">placeholder</Badge>
                    ) : area.published ? (
                      <Badge tone="success">live</Badge>
                    ) : (
                      <Badge>hidden</Badge>
                    )}
                  </td>
                  <td className={t.td}>
                    <Link
                      href={`/admin/areas/${area.id}`}
                      className="font-semibold text-flame-600 hover:underline"
                    >
                      Edit
                    </Link>
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
