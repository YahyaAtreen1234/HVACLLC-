import Link from "next/link";
import { faqsStore } from "@/server/content/store";
import { seedContentIfEmpty } from "@/server/content/seed";
import { Badge, EmptyState, PageHeader, TableWrap, tableClasses as t } from "../../ui";

export const dynamic = "force-dynamic";

export default async function FaqsAdminPage() {
  await seedContentIfEmpty();
  const faqs = await faqsStore.all(true);
  const todos = faqs.filter((faq) => faq.answer.includes("TODO")).length;

  return (
    <>
      <PageHeader
        title="FAQs"
        description="Shown across the site and marked up for Google's FAQ results."
        action={{ href: "/admin/faqs/new", label: "Add question" }}
      />

      {todos > 0 ? (
        <div className="mb-5 rounded-xl border border-amber-300 bg-amber-50 p-4">
          <p className="text-sm leading-relaxed text-amber-900">
            <strong>{todos} answer{todos === 1 ? "" : "s"} still say TODO</strong>{" "}
            and are live on your site right now. Answer them or unpublish them —
            they cover things customers ask before booking, like your diagnostic
            fee.
          </p>
        </div>
      ) : null}

      {faqs.length === 0 ? (
        <EmptyState
          title="No FAQs yet"
          description="Answer the questions customers ask before booking. These also feed the FAQ markup that can appear directly in Google."
          action={{ href: "/admin/faqs/new", label: "Add question" }}
        />
      ) : (
        <TableWrap>
          <table className={t.table}>
            <thead>
              <tr>
                <th className={t.th}>Order</th>
                <th className={t.th}>Question</th>
                <th className={t.th}>Answer</th>
                <th className={t.th}>Topic</th>
                <th className={t.th}>Status</th>
                <th className={t.th} />
              </tr>
            </thead>
            <tbody>
              {faqs.map((faq) => (
                <tr key={faq.id} className={t.tr}>
                  <td className={t.td}>
                    <span className="text-ink-500">{faq.sortOrder}</span>
                  </td>
                  <td className={`${t.td} max-w-xs`}>
                    <p className="font-semibold text-ink-900">{faq.question}</p>
                  </td>
                  <td className={`${t.td} max-w-md`}>
                    <p className="line-clamp-2 text-ink-700">{faq.answer}</p>
                  </td>
                  <td className={t.td}>
                    <span className="text-ink-600">{faq.topic}</span>
                  </td>
                  <td className={t.td}>
                    {faq.answer.includes("TODO") ? (
                      <Badge tone="warning">needs answer</Badge>
                    ) : faq.published ? (
                      <Badge tone="success">live</Badge>
                    ) : (
                      <Badge>hidden</Badge>
                    )}
                  </td>
                  <td className={t.td}>
                    <Link
                      href={`/admin/faqs/${faq.id}`}
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
