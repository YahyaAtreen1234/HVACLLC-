import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  nextScrollState,
  ALWAYS_VISIBLE_ABOVE,
  DIRECTION_THRESHOLD,
  type ScrollState,
} from "../src/lib/hide-on-scroll";

/**
 * The sticky header hides when the page is scrolled down and comes back when
 * it is scrolled up.
 *
 * The behaviour is a state machine over a sequence of scroll positions, and
 * the failures are all sequence-shaped: a header that flickers on trackpad
 * jitter, one that stays hidden after the reader scrolls back up, one that
 * vanishes while a keyboard user is tabbing through it. Those are miserable to
 * reproduce by hand and cheap to pin here.
 */

/** Replays a run of scroll positions and reports the visibility at each step. */
function replay(positions: number[], opts: { locked?: boolean } = {}) {
  let state: ScrollState = { hidden: false, lastY: 0 };
  return positions.map((y) => {
    state = nextScrollState(state, y, opts);
    return state.hidden;
  });
}

describe("scrolling down and back up", () => {
  test("hides once the reader moves down the page", () => {
    const seen = replay([0, 200, 400]);
    assert.deepEqual(seen, [false, true, true]);
  });

  test("comes back the moment the reader scrolls up", () => {
    // The whole point: the nav should be reachable without scrolling all the
    // way to the top first.
    const seen = replay([0, 400, 800, 700]);
    assert.equal(seen.at(-1), false);
  });

  test("stays visible at the top of the page", () => {
    const seen = replay([0, 20, 60]);
    assert.deepEqual(seen, [false, false, false]);
  });

  test("reappears on returning to the top after being hidden", () => {
    const seen = replay([0, 600, 0]);
    assert.deepEqual(seen, [false, true, false]);
  });
});

describe("things that should not move it", () => {
  test("ignores jitter smaller than the direction threshold", () => {
    // A trackpad emits small changes in both directions while the reader is
    // holding still. Reacting to those makes the header flicker.
    const jitter = [300, 302, 300, 303, 301];
    const seen = replay([0, 300, ...jitter]);
    const afterFirstHide = seen.slice(2);

    assert.ok(
      afterFirstHide.every((h) => h === afterFirstHide[0]),
      `visibility changed during jitter: ${JSON.stringify(seen)}`,
    );
  });

  test("a movement one pixel under the threshold does nothing", () => {
    const state = { hidden: false, lastY: 300 };
    const next = nextScrollState(state, 300 + DIRECTION_THRESHOLD - 1);
    assert.equal(next.hidden, false);
    // lastY is held too, so a slow drift accumulates rather than being lost a
    // pixel at a time and never reaching the threshold.
    assert.equal(next.lastY, 300);
  });

  test("a movement at the threshold does act", () => {
    const state = { hidden: false, lastY: 300 };
    const next = nextScrollState(state, 300 + DIRECTION_THRESHOLD);
    assert.equal(next.hidden, true);
  });

  test("never hides above the always-visible band", () => {
    const state = { hidden: true, lastY: 0 };
    const next = nextScrollState(state, ALWAYS_VISIBLE_ABOVE - 1);
    assert.equal(next.hidden, false);
  });
});

describe("when hiding would take something away", () => {
  test("stays put while locked, however far the page moves", () => {
    // Keyboard focus inside the header, or an open menu whose trigger is up
    // there. Sliding it off-screen would remove the control being used.
    const seen = replay([0, 400, 900], { locked: true });
    assert.deepEqual(seen, [false, false, false]);
  });

  test("still tracks position while locked, so releasing does not snap", () => {
    let state: ScrollState = { hidden: false, lastY: 0 };
    state = nextScrollState(state, 600, { locked: true });
    assert.equal(state.lastY, 600, "position was not recorded while locked");

    // Released, and continuing downward from there — not treated as a huge
    // jump from wherever it was last unlocked.
    state = nextScrollState(state, 620);
    assert.equal(state.hidden, true);
  });
});

describe("odd inputs", () => {
  test("treats rubber-banding past the top as the top", () => {
    // iOS reports negative offsets when the page is dragged past its start.
    const state = { hidden: true, lastY: 300 };
    const next = nextScrollState(state, -120);
    assert.equal(next.hidden, false);
    assert.equal(next.lastY, 0);
  });
});
