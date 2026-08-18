import Link from "next/link";
import { servicesStore } from "@/server/content/store";
import { seedContentIfEmpty } from "@/server/content/seed";
import { Badge, EmptyState, PageHeader, TableWrap, tableClasses as t } from "../../ui";

export const dynamic = "force-dynamic";

export default async function ServicesAdminPage() {
  await seedContentIfEmpty();
  const services = await servicesStore.all(true);

  return (
    <>
      <PageHeader
        title="Services"
        description="Each service creates its own page, a card on the site, a footer link and an option in the contact form."
        action={{ href: "/admin/services/new", label: "Add service" }}
      />

      {services.length === 0 ? (
        <EmptyState
          title="No services yet"
          description="Add your first service and it will appear across the site automatically."
          action={{ href: "/admin/services/new", label: "Add service" }}
        />
      ) : (
        <TableWrap>
          <table className={t.table}>
            <thead>
              <tr>
                <th className={t.th}>Order</th>
                <th className={t.th}>Name</th>
                <th className={t.th}>Summary</th>
                <th className={t.th}>Status</th>
                <th className={t.th} />
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id} className={t.tr}>
                  <td className={t.td}>
                    <span className="text-ink-500">{service.sortOrder}</span>
                  </td>
                  <td className={t.td}>
                    <p className="font-semibold text-ink-900">{service.name}</p>
                    <p className="text-xs text-ink-500">/services/{service.slug}</p>
                  </td>
                  <td className={`${t.td} max-w-md`}>
                    <p className="line-clamp-2 text-ink-700">{service.summary}</p>
                  </td>
                  <td className={t.td}>
                    <div className="flex flex-wrap gap-1.5">
                      {service.published ? (
                        <Badge tone="success">live</Badge>
                      ) : (
                        <Badge tone="warning">hidden</Badge>
                      )}
                      {service.featured ? <Badge>featured</Badge> : null}
                    </div>
                  </td>
                  <td className={t.td}>
                    <Link
                      href={`/admin/services/${service.id}`}
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
