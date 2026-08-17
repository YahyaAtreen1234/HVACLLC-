import { Container, Section } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ReviewCard, ReviewsEmptyState } from "@/components/cards/ReviewCard";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { getAverageRating, getFeaturedReviews, hasReviews, reviews } from "@/data/reviews";

/**
 * Reviews section.
 *
 * When `data/reviews.ts` is empty — which it is until real reviews are added —
 * this renders an honest empty state instead of invented testimonials, and the
 * rating summary is omitted entirely rather than defaulted to five stars.
 */
export function ReviewsSection({
  limit = 3,
  showAll = false,
  tone = "muted",
}: {
  limit?: number;
  showAll?: boolean;
  tone?: "light" | "muted";
}) {
  const shown = showAll ? reviews : getFeaturedReviews(limit);
  const average = getAverageRating();

  return (
    <Section tone={tone} id="reviews">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Reviews"
            title="What customers say"
            lead={
              average
                ? `Averaging ${average} out of 5 across ${reviews.length} published reviews.`
                : "Reviews are published here exactly as customers write them."
            }
          />
          {hasReviews && !showAll ? (
            <Button href="/reviews" variant="ghost" iconRight="arrow-right">
              All reviews
            </Button>
          ) : null}
        </div>

        {hasReviews ? (
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((review, index) => (
              <Reveal as="li" key={`${review.author}-${review.date}`} delay={index * 60}>
                <ReviewCard review={review} />
              </Reveal>
            ))}
          </ul>
        ) : (
          <ReviewsEmptyState className="mt-12" />
        )}
      </Container>
    </Section>
  );
}
