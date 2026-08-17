import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { business } from "@/config/business";
import { cn } from "@/lib/utils";
import type { Review } from "@/types";

/** Star row. Renders the exact rating the customer left — never a default. */
export function StarRating({
  rating,
  size = 18,
  className,
}: {
  rating: number;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("flex items-center gap-0.5 text-flame-500", className)}
      role="img"
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Icon
          key={star}
          name="star"
          size={size}
          className={star <= rating ? undefined : "text-ink-200"}
        />
      ))}
    </div>
  );
}

export function ReviewCard({
  review,
  className,
}: {
  review: Review;
  className?: string;
}) {
  const published = new Date(review.date);
  const dateLabel = Number.isNaN(published.getTime())
    ? null
    : published.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <figure
      className={cn(
        "flex h-full flex-col rounded-2xl border border-ink-900/8 bg-white p-6 shadow-card",
        className,
      )}
    >
      <Icon name="quote" size={28} className="text-flame-500/25" />
      <StarRating rating={review.rating} className="mt-4" />

      <blockquote className="mt-4 grow text-[0.95rem] leading-relaxed text-ink-800">
        {review.quote}
      </blockquote>

      <figcaption className="mt-6 border-t border-ink-900/8 pt-4 text-sm">
        <span className="font-display font-semibold text-ink-950">
          {review.author}
        </span>
        <span className="mt-0.5 block text-ink-600">
          {[review.location, dateLabel].filter(Boolean).join(" · ")}
        </span>
        <span className="mt-1 block text-xs text-ink-500">
          Review published on {review.source}
          {review.sourceUrl ? (
            <>
              {" — "}
              <a
                href={review.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-ink-800"
              >
                view original
              </a>
            </>
          ) : null}
        </span>
      </figcaption>
    </figure>
  );
}

/**
 * Shown wherever reviews would appear while `data/reviews.ts` is still empty.
 * Fabricated testimonials are a deceptive-advertising problem, so the design
 * handles "no reviews yet" as a real state instead of inviting invention.
 */
export function ReviewsEmptyState({ className }: { className?: string }) {
  const reviewUrl = business.social.google || business.social.yelp;

  return (
    <div
      className={cn(
        "rounded-2xl border-2 border-dashed border-ink-900/15 bg-white/60 p-8 text-center sm:p-12",
        className,
      )}
    >
      <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-ink-50 text-ink-500">
        <Icon name="star" size={26} />
      </span>
      <h3 className="mt-5 text-xl text-ink-950">No reviews published yet</h3>
      <p className="mx-auto mt-3 max-w-md text-[0.95rem] leading-relaxed text-ink-700">
        Customer reviews will appear here once they are collected. Nothing has
        been written on the company&rsquo;s behalf.
      </p>

      {reviewUrl ? (
        <Button href={reviewUrl} variant="secondary" size="md" className="mt-6">
          Leave a review
        </Button>
      ) : (
        <p className="mt-6 text-xs text-ink-500">
          {/* Development note for whoever finishes the build. */}
          TODO: add real reviews to <code>src/data/reviews.ts</code> and set the
          Google Business Profile URL in <code>src/config/business.ts</code>.
        </p>
      )}
    </div>
  );
}
