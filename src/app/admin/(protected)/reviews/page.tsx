import Link from "next/link";
import { reviewsStore } from "@/server/content/store";
import { seedContentIfEmpty } from "@/server/content/seed";
import { business } from "@/config/business";
import {
  Badge,
  EmptyState,
  PageHeader,
  TableWrap,
  tableClasses as t,
} from "../../ui";

export const dynamic = "force-dynamic";

export default async function ReviewsAdminPage() {
  await seedContentIfEmpty();
  const reviews = await reviewsStore.all(true);

  const published = reviews.filter((review) => review.published);
  const average = published.length
    ? Math.round(
        (published.reduce((sum, r) => sum + r.rating, 0) / published.length) *
          10,
      ) / 10
    : null;

  return (
    <>
      <PageHeader
        title="Reviews"
        description="Published exactly as customers wrote them. Copy the text across without editing it."
        action={{ href: "/admin/reviews/new", label: "Add review" }}
      />

      {/*
        The average is a published claim — it goes into the structured data
        Google reads — so it is shown here rather than left to be discovered on
        the live site.
      */}
      {average !== null ? (
        <div className="mb-5 rounded-xl border border-ink-900/10 bg-white p-4">
          <p className="text-sm leading-relaxed text-ink-700">
            <strong className="text-ink-900">
              Averaging {average} out of 5
            </strong>{" "}
            across {published.length} published review
            {published.length === 1 ? "" : "s"}. This figure is published in
            your search listing, so it follows whatever is live here.
          </p>
        </div>
      ) : null}

      {reviews.length === 0 ? (
        <EmptyState
          title="No reviews yet"
          description={
            business.social.google
              ? "Paste in what customers have already written on Google. Copy the wording exactly — an edited review is no longer the customer's."
              : "Paste in reviews customers have already left elsewhere. Copy the wording exactly, and add your Google Business Profile URL in the config so visitors can leave new ones."
          }
          action={{ href: "/admin/reviews/new", label: "Add review" }}
        />
      ) : (
        <TableWrap>
          <table className={t.table}>
            <thead>
              <tr>
                <th className={t.th}>Order</th>
                <th className={t.th}>Author</th>
                <th className={t.th}>Rating</th>
                <th className={t.th}>Review</th>
                <th className={t.th}>Source</th>
                <th className={t.th}>Date</th>
                <th className={t.th}>Status</th>
                <th className={t.th} />
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review.id} className={t.tr}>
                  <td className={t.td}>
                    <span className="text-ink-500">{review.sortOrder}</span>
                  </td>
                  <td className={t.td}>
                    <p className="font-semibold text-ink-900">
                      {review.author}
                    </p>
                    {review.location ? (
                      <p className="text-xs text-ink-500">{review.location}</p>
                    ) : null}
                  </td>
                  <td className={t.td}>
                    <span
                      aria-label={`${review.rating} out of 5`}
                      className="whitespace-nowrap text-flame-600"
                    >
                      {"★".repeat(review.rating)}
                      <span className="text-ink-300">
                        {"★".repeat(5 - review.rating)}
                      </span>
                    </span>
                  </td>
                  <td className={`${t.td} max-w-md`}>
                    <p className="line-clamp-2 text-ink-700">{review.quote}</p>
                  </td>
                  <td className={t.td}>
                    <span className="text-ink-600">{review.source}</span>
                  </td>
                  <td className={t.td}>
                    <span className="whitespace-nowrap text-ink-600">
                      {review.reviewDate}
                    </span>
                  </td>
                  <td className={t.td}>
                    {review.published ? (
                      <Badge tone="success">live</Badge>
                    ) : (
                      <Badge>hidden</Badge>
                    )}
                  </td>
                  <td className={t.td}>
                    <Link
                      href={`/admin/reviews/${review.id}`}
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
