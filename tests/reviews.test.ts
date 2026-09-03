import { test, describe } from "node:test";
import assert from "node:assert/strict";

/**
 * Review ratings and the average derived from them.
 *
 * The average is emitted as `aggregateRating` in the structured data, so it is
 * a public claim about the business rather than decoration. A bad rating
 * reaching the database would misstate it in search results, which is why the
 * value is clamped in the form, constrained in the schema, and clamped again
 * on the way out.
 */

/** Mirrors the clamp in `reviewFromForm`. */
const clampRating = (raw: number) =>
  Math.min(5, Math.max(1, Math.round(raw) || 5));

/** Mirrors `getAverageRating`. */
function average(ratings: number[]): number | null {
  if (!ratings.length) return null;
  const total = ratings.reduce((sum, r) => sum + r, 0);
  return Math.round((total / ratings.length) * 10) / 10;
}

describe("rating clamp", () => {
  test("keeps a valid rating exactly", () => {
    for (const value of [1, 2, 3, 4, 5]) {
      assert.equal(clampRating(value), value);
    }
  });

  test("pulls an out-of-range value back into 1-5", () => {
    assert.equal(clampRating(9), 5);
    assert.equal(clampRating(0), 5, "zero is treated as unset, not as a floor");
    assert.equal(clampRating(-3), 1);
  });

  test("rounds a fractional rating", () => {
    assert.equal(clampRating(4.4), 4);
    assert.equal(clampRating(4.6), 5);
  });

  test("falls back to five when the field arrives unparseable", () => {
    // An empty select yields NaN, and NaN would otherwise flow into the
    // average and make it NaN for every review at once.
    assert.equal(clampRating(Number.NaN), 5);
  });
});

describe("average rating", () => {
  test("is null with nothing published", () => {
    // The structured data omits aggregateRating entirely rather than claiming
    // a rating of zero, which would read as terrible rather than as absent.
    assert.equal(average([]), null);
  });

  test("rounds to one decimal", () => {
    assert.equal(average([5, 4, 4]), 4.3);
    assert.equal(average([5, 5, 4]), 4.7);
  });

  test("a single review averages to itself", () => {
    assert.equal(average([4]), 4);
  });

  test("never exceeds five for valid input", () => {
    const ratings = [5, 5, 5, 5];
    assert.ok((average(ratings) as number) <= 5);
  });
});
