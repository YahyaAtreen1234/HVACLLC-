import { PageHeader } from "../../../ui";
import { ReviewForm } from "../ReviewForm";

export const dynamic = "force-dynamic";

export default function NewReviewPage() {
  return (
    <>
      <PageHeader
        title="Add a review"
        description="Copy a review a customer has already published. Paste their wording unchanged."
      />
      <ReviewForm />
    </>
  );
}
