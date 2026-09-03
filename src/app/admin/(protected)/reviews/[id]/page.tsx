import { notFound } from "next/navigation";
import { reviewsStore } from "@/server/content/store";
import { PageHeader } from "../../../ui";
import { DeleteReviewForm, ReviewForm } from "../ReviewForm";

export const dynamic = "force-dynamic";

export default async function EditReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const review = await reviewsStore.byId(id);

  if (!review) notFound();

  return (
    <>
      <PageHeader
        title="Edit review"
        description={`${review.author} · ${review.source} · ${review.reviewDate}`}
      />
      <ReviewForm review={review} />
      <DeleteReviewForm id={review.id} />
    </>
  );
}
