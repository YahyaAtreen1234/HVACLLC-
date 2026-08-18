import Link from "next/link";
import { teamStore } from "@/server/content/store";
import { seedContentIfEmpty } from "@/server/content/seed";
import { Badge, EmptyState, PageHeader, TableWrap, tableClasses as t } from "../../ui";

export const dynamic = "force-dynamic";

export default async function TeamAdminPage() {
  await seedContentIfEmpty();
  const members = await teamStore.all(true);
  const placeholders = members.filter((m) => /^add /i.test(m.name)).length;

  return (
    <>
      <PageHeader
        title="Team"
        description="The people shown on your About page."
        action={{ href: "/admin/team/new", label: "Add member" }}
      />

      {placeholders > 0 ? (
        <div className="mb-5 rounded-xl border border-amber-300 bg-amber-50 p-4">
          <p className="text-sm leading-relaxed text-amber-900">
            <strong>{placeholders} placeholder{placeholders === 1 ? "" : "s"}</strong>{" "}
            still showing on your live About page. Replace the names and photos
            with real people — that page exists to build trust, and invented
            staff defeats the point of it.
          </p>
        </div>
      ) : null}

      {members.length === 0 ? (
        <EmptyState
          title="No team members"
          description="Add the people who turn up at customers' doors. Photos and real names are the strongest trust signal you have."
          action={{ href: "/admin/team/new", label: "Add member" }}
        />
      ) : (
        <TableWrap>
          <table className={t.table}>
            <thead>
              <tr>
                <th className={t.th}>Order</th>
                <th className={t.th}>Name</th>
                <th className={t.th}>Role</th>
                <th className={t.th}>Bio</th>
                <th className={t.th}>Status</th>
                <th className={t.th} />
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className={t.tr}>
                  <td className={t.td}>
                    <span className="text-ink-500">{member.sortOrder}</span>
                  </td>
                  <td className={t.td}>
                    <p className="font-semibold text-ink-900">{member.name}</p>
                    {!member.imageSrc ? (
                      <p className="text-xs text-ink-500">No photo</p>
                    ) : null}
                  </td>
                  <td className={t.td}>{member.role}</td>
                  <td className={`${t.td} max-w-md`}>
                    <p className="line-clamp-2 text-ink-700">{member.bio}</p>
                  </td>
                  <td className={t.td}>
                    {/^add /i.test(member.name) ? (
                      <Badge tone="warning">placeholder</Badge>
                    ) : member.published ? (
                      <Badge tone="success">live</Badge>
                    ) : (
                      <Badge>hidden</Badge>
                    )}
                  </td>
                  <td className={t.td}>
                    <Link
                      href={`/admin/team/${member.id}`}
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
