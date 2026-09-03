import { deleteReview, saveReview } from "../../actions";
import { FormShell } from "../../FormShell";
import { Card, Checkbox, Field, Select, SubmitRow, TextArea } from "../../ui";
import type { DbReview } from "@/server/content/store";

const SOURCES = ["Google", "Facebook", "Yelp", "Nextdoor", "Angi", "Direct"];

const RATINGS = [5, 4, 3, 2, 1];

export function ReviewForm({ review }: { review?: DbReview }) {
  const editing = Boolean(review);

  return (
    <FormShell action={saveReview} className="space-y-6">
      {review ? <input type="hidden" name="id" value={review.id} /> : null}

      <Card className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Reviewer name"
            name="author"
            required
            defaultValue={review?.author}
            placeholder="Dana R."
            hint="Exactly as it appears on the review. Do not expand an initial into a full name."
          />
          <Select
            label="Rating"
            name="rating"
            defaultValue={String(review?.rating ?? 5)}
            options={RATINGS.map((value) => ({
              value: String(value),
              label: `${value} star${value === 1 ? "" : "s"}`,
            }))}
            hint="The rating the customer actually left."
          />
        </div>

        <TextArea
          label="Review"
          name="quote"
          required
          rows={6}
          defaultValue={review?.quote}
          hint="Paste the customer's words unchanged — no tidying of spelling, grammar or length. An edited review is no longer theirs, and rewriting one is the line between a testimonial and a fabricated claim."
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Select
            label="Source"
            name="source"
            defaultValue={review?.source ?? "Google"}
            options={SOURCES.map((value) => ({ value, label: value }))}
            hint="Where the customer published it."
          />
          <Field
            label="Link to the original"
            name="sourceUrl"
            type="url"
            defaultValue={review?.sourceUrl}
            placeholder="https://…"
            hint="Optional, and worth adding: a review a reader can go and check is worth several they cannot."
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Date left"
            name="reviewDate"
            type="date"
            required
            defaultValue={review?.reviewDate}
            hint="The date on the original review, not today."
          />
          <Field
            label="Customer's town"
            name="location"
            defaultValue={review?.location}
            placeholder="Phoenix, AZ"
            hint="Optional. Helps a local reader recognise their own area."
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <Field
            label="Service slug"
            name="service"
            defaultValue={review?.service}
            placeholder="ac-repair"
            hint="Optional. Shows the review beside that service."
          />
          <Field
            label="Sort order"
            name="sortOrder"
            type="number"
            defaultValue={review?.sortOrder ?? 0}
          />
          <div className="flex items-end pb-2.5">
            <Checkbox
              label="Published"
              name="published"
              defaultChecked={review?.published ?? true}
            />
          </div>
        </div>
      </Card>

      <SubmitRow
        cancelHref="/admin/reviews"
        label={editing ? "Save changes" : "Add review"}
      />
    </FormShell>
  );
}

export function DeleteReviewForm({ id }: { id: string }) {
  return (
    <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-5">
      <p className="font-display font-bold text-red-900">Delete this review</p>
      <p className="mt-1 text-sm leading-relaxed text-red-800">
        Consider unpublishing instead. Removing a genuine review changes the
        average shown in your search listing.
      </p>
      <form action={deleteReview} className="mt-3">
        <input type="hidden" name="id" value={id} />
        <button
          type="submit"
          className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100"
        >
          Delete review
        </button>
      </form>
    </div>
  );
}
