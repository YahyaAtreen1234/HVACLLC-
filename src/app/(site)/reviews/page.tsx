import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { ReviewsSection } from "@/components/sections/ReviewsSection";
import { Container, Section } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { CtaBand } from "@/components/cta/CtaBand";
import { business } from "@/config/business";
import { getReviews } from "@/server/content/read";
import { pageMetadata } from "@/lib/seo";

/**
 * Generated rather than a constant, because whether the page should be indexed
 * now depends on the database. An empty reviews page ranking for the company
 * name shows a searcher nothing, so it stays out of the index until there is
 * something on it — and lets itself in as soon as there is.
 */
export async function generateMetadata(): Promise<Metadata> {
  const reviews = await getReviews();

  return pageMetadata({
    title: "Reviews",
    description: `Customer reviews of ${business.name}, published as written.`,
    path: "/reviews",
    index: reviews.length > 0,
  });
}

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
            ) : process.env.NODE_ENV !== "production" ? (
              /*
                Development only. This was rendering live under a heading
                asking customers to leave a review, so the one thing on screen
                where the button belonged was a note addressed to a developer.
              */
              <p className="rounded-xl border border-dashed border-ink-900/20 bg-white px-5 py-4 text-center text-sm text-ink-600">
                Set <code>business.social.google</code> to turn this into a
                working &ldquo;leave a review&rdquo; button.
              </p>
            ) : (
              // Without a link there is nothing to click, so the invitation
              // points at the phone instead of leaving a dead heading.
              <Button href="/contact" size="lg" iconRight="arrow-right">
                Get in touch
              </Button>
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
