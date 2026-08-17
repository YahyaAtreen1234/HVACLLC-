import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { ReviewsSection } from "@/components/sections/ReviewsSection";
import { Container, Section } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { CtaBand } from "@/components/cta/CtaBand";
import { business } from "@/config/business";
import { hasReviews } from "@/data/reviews";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Reviews",
  description: `Customer reviews of ${business.name}, published as written.`,
  path: "/reviews",
  // Keep an empty reviews page out of the index until there is something on it.
  index: hasReviews,
});

export default function ReviewsPage() {
  const reviewUrl = business.social.google || business.social.yelp;

  return (
    <>
      <PageHero
        eyebrow="Reviews"
        title="Reviews, unedited"
        lead="Reviews are published here exactly as customers wrote them, with a link back to the original wherever the platform allows it."
        crumbs={[{ name: "Reviews", href: "/reviews" }]}
      />

      <ReviewsSection showAll tone="light" />

      <Section tone="muted" spacing="tight">
        <Container size="narrow">
          <SectionHeading
            align="center"
            eyebrow="Recently worked with us?"
            title="A review helps the next homeowner decide"
            lead="It takes a minute, and it is the main way people find a contractor they can trust."
          />
          <div className="mt-8 flex flex-col items-center gap-4">
            {reviewUrl ? (
              <Button href={reviewUrl} size="lg" iconRight="arrow-right">
                Leave a review
              </Button>
            ) : (
              <p className="rounded-xl border border-dashed border-ink-900/20 bg-white px-5 py-4 text-center text-sm text-ink-600">
                TODO: add the Google Business Profile URL to{" "}
                <code>business.social.google</code> so this becomes a working
                &ldquo;leave a review&rdquo; button.
              </p>
            )}
            <p className="flex items-center gap-2 text-sm text-ink-600">
              <Icon name="alert" size={16} className="text-flame-600" />
              We never write, edit or buy reviews.
            </p>
          </div>
        </Container>
      </Section>

      <CtaBand />
    </>
  );
}
