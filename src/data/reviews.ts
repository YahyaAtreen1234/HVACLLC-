import type { Review } from "@/types";

/**
 * ⚠️ INTENTIONALLY EMPTY.
 *
 * No reviews have been invented. Testimonials are a legal and reputational
 * risk when fabricated (the FTC treats fake reviews as deceptive advertising),
 * so this array stays empty until real, attributable reviews are pasted in.
 *
 * How to add one:
 *   1. Copy the review text exactly as the customer wrote it — no editing.
 *   2. Use the reviewer's name as published on the source platform.
 *   3. Link back to the original review where the platform allows it.
 *
 * Example shape (delete this comment block once real reviews exist):
 *   {
 *     author: "Jane D.",
 *     rating: 5,
 *     quote: "…",
 *     source: "Google",
 *     sourceUrl: "https://…",
 *     date: "2026-04-18",
 *     location: "Primary City, ST",
 *     service: "ac-repair",
 *   }
 *
 * Every reviews surface on the site renders a proper empty state while this is
 * empty, so the design does not break — it simply invites the first review.
 */
export const reviews: Review[] = [];

export const hasReviews = reviews.length > 0;

/**
 * Average rating, or null when there is nothing to average.
 * Never hard-code a star rating: it must be derived from real reviews, and the
 * structured data deliberately omits `aggregateRating` while this is null.
 */
export function getAverageRating(): number | null {
  if (!reviews.length) return null;
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return Math.round((total / reviews.length) * 10) / 10;
}

export function getFeaturedReviews(limit = 3): Review[] {
  return reviews.slice(0, limit);
}
