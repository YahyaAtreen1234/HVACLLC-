/**
 * Decides whether a sticky header should be off-screen.
 *
 * Kept as a pure function so the behaviour can be tested without a browser —
 * the awkward cases here are all about *sequences* of scroll positions, which
 * is exactly what is tedious to reproduce by hand and easy to get subtly
 * wrong.
 */

export interface ScrollState {
  hidden: boolean;
  lastY: number;
}

/** Above this, the header is always shown, whichever way the page is moving. */
export const ALWAYS_VISIBLE_ABOVE = 80;

/**
 * Movement smaller than this is ignored.
 *
 * A trackpad or a phone's momentum emits a stream of one- and two-pixel
 * changes, some in the opposite direction to the gesture. Reacting to those
 * makes the header flicker in and out while the reader is holding still.
 */
export const DIRECTION_THRESHOLD = 6;

export function nextScrollState(
  previous: ScrollState,
  rawY: number,
  { locked = false }: { locked?: boolean } = {},
): ScrollState {
  // iOS rubber-banding reports negative offsets past the top of the document.
  const y = Math.max(0, rawY);
  const delta = y - previous.lastY;

  // `locked` covers the cases where hiding would take something away that is
  // in use: an open menu whose trigger lives up here, or keyboard focus inside
  // the header. The position is still recorded, so releasing the lock resumes
  // from where the reader actually is rather than snapping.
  if (locked) return { hidden: false, lastY: y };

  if (y <= ALWAYS_VISIBLE_ABOVE) return { hidden: false, lastY: y };

  if (Math.abs(delta) < DIRECTION_THRESHOLD) {
    return { hidden: previous.hidden, lastY: previous.lastY };
  }

  return { hidden: delta > 0, lastY: y };
}
