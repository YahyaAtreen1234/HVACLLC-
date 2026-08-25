import sharp from "sharp";
import { existsSync } from "node:fs";

/**
 * Cuts the equipment photograph out of the designed banner.
 *
 * The banner has the headline, the buttons and the trust badges baked into the
 * pixels. The hero already renders all three as live HTML beside the photo, so
 * dropping the whole banner in would print every one of them twice — and the
 * baked copies cannot be read by search engines or screen readers, cannot
 * reflow on a phone, and need a designer to change a word.
 *
 * So only the photograph is taken. The text sits on the left, the equipment on
 * the right, and the split is found by scanning for the first column from the
 * right that holds photographic content rather than assuming a fixed pixel.
 *
 * Run with:  npm run brand:hero
 */

const SRC = process.argv[2] ?? "public/brand/hero-banner.png";
const OUT = process.argv[3] ?? "public/brand/hero.jpg";

if (!existsSync(SRC)) {
  console.error(`
  Cannot find ${SRC}

  Save the banner image there first, then run this again.
`);
  process.exit(1);
}

const { data, info } = await sharp(SRC)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;

const at = (x, y) => {
  const i = (y * width + x) * channels;
  return [data[i], data[i + 1], data[i + 2]];
};

const isBlank = (x, y) => {
  const [r, g, b] = at(x, y);
  return r > 244 && g > 244 && b > 244;
};

/*
 * The gutter between the text and the photograph gives the left edge.
 *
 * Judging columns by their content instead — looking for the mid-grey of metal
 * — cut into the machine: a condenser's fins are near-black, so its leftmost
 * columns failed the test and the unit lost its side. The blank gap the
 * designer left is unambiguous, and is the same signal used below to find the
 * bottom edge.
 *
 * Measured over the upper part of the image only, so the badge strip running
 * the full width underneath cannot fill the gutter in.
 */
const upper = Math.round(height * 0.6);
const columnBlank = (x) => {
  for (let y = 0; y < upper; y += 2) if (!isBlank(x, y)) return false;
  return true;
};

const gutters = [];
let open = null;
for (let x = 0; x < width; x++) {
  if (columnBlank(x)) {
    if (open === null) open = x;
  } else if (open !== null) {
    gutters.push([open, x - 1]);
    open = null;
  }
}
if (open !== null) gutters.push([open, width - 1]);

// The widest gap that is not the outer margin.
const interior = gutters.filter(
  ([a, b]) => a > 0 && b < width - 1 && b - a >= 12,
);
interior.sort((p, q) => q[1] - q[0] - (p[1] - p[0]));

const left = interior.length ? interior[0][1] + 1 : 0;

// Trailing margin, so the photo is not letterboxed against empty canvas.
let right = width - 1;
while (right > left && columnBlank(right)) right--;

const rowBlank = (y) => {
  for (let x = left; x <= right; x += 2) if (!isBlank(x, y)) return false;
  return true;
};

let top = 0;
while (top < height && rowBlank(top)) top++;

/*
 * Cut at the gap below the equipment, not at the last ink on the page.
 *
 * These banners carry a row of badges and service icons beneath the
 * photograph. Trimming to the final non-blank row swept those in — and they
 * are the very text the page already renders as HTML, so they would appear
 * twice.
 *
 * The equipment and the badges are separated by a band of blank rows, so the
 * widest such band below the photograph marks the real bottom edge.
 */
let lastInk = height - 1;
while (lastInk > top && rowBlank(lastInk)) lastInk--;

const bands = [];
let runStart = null;
for (let y = top; y <= lastInk; y++) {
  if (rowBlank(y)) {
    if (runStart === null) runStart = y;
  } else if (runStart !== null) {
    bands.push([runStart, y - 1]);
    runStart = null;
  }
}

// Only bands past the halfway mark, and only ones thick enough to be a
// deliberate gap rather than a light row inside the photograph itself.
const minGap = Math.round(height * 0.02);
const separators = bands.filter(
  ([a, b]) => a > top + (lastInk - top) * 0.45 && b - a >= minGap,
);
separators.sort((p, q) => q[1] - q[0] - (p[1] - p[0]));

const bottom = separators.length ? separators[0][0] - 1 : lastInk;

if (separators.length) {
  console.log(
    `  gap below photo   y ${separators[0][0]}-${separators[0][1]}  (badges cropped off)`,
  );
}

const w = right - left + 1;
const h = bottom - top + 1;

console.log(`  source            ${width}x${height}`);
console.log(`  photo spans       x ${left}-${right}`);
console.log(`  vertical extent   y ${top}-${bottom}`);
console.log(`  extracted         ${w}x${h}`);

// The hero frame is 4:3. Fitting inside it on white keeps the equipment whole
// rather than cropping the top off a tall unit.
await sharp(SRC)
  .extract({ left, top, width: w, height: h })
  .resize(1600, 1200, { fit: "contain", background: "#ffffff" })
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile(OUT);

console.log(`  wrote             ${OUT}  (1600x1200)`);
console.log(`\n  Check it looks right, then commit it.\n`);
