/**
 * Reads the exact brand colours out of the logo file.
 *
 * Run with:  npm run brand:colors
 *
 * Guessing hex values from a screenshot gets you close and wrong — close enough
 * to look right beside the logo and wrong enough that a printer, a sign maker
 * and the website all end up slightly different shades. This samples the actual
 * pixels instead, and prints a full tint/shade scale in the shape the theme
 * expects, ready to paste into src/app/globals.css.
 */

import sharp from "sharp";
import { existsSync } from "node:fs";

const FILE = process.argv[2] ?? "public/brand/logo.png";

if (!existsSync(FILE)) {
  console.error(`
  Could not find ${FILE}

  Save the logo there first — see public/brand/README.md for the filenames.
`);
  process.exit(1);
}

const { data, info } = await sharp(FILE)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const counts = new Map();

for (let i = 0; i < data.length; i += info.channels) {
  const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];

  if (a < 250) continue; // transparent edges

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  // Skip near-white and near-black: the background and any drop shadow are the
  // most common pixels in the file but say nothing about the brand.
  if (max > 240 && min > 240) continue;
  if (max < 18) continue;

  // Quantise so anti-aliased edges collapse into the colour they belong to.
  const key = [r, g, b].map((c) => Math.round(c / 8) * 8).join(",");
  counts.set(key, (counts.get(key) ?? 0) + 1);
}

const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
const hex = ([r, g, b]) =>
  "#" + [r, g, b].map((c) => Math.max(0, Math.min(255, c)).toString(16).padStart(2, "0")).join("");

/** Perceived brightness, for telling the dark mark from the bright accent. */
const luma = ([r, g, b]) => 0.299 * r + 0.587 * g + 0.114 * b;
/** How colourful — separates a true navy from a neutral grey. */
const chroma = ([r, g, b]) => Math.max(r, g, b) - Math.min(r, g, b);

const top = ranked.slice(0, 24).map(([key, n]) => {
  const rgb = key.split(",").map(Number);
  return { rgb, n, luma: luma(rgb), chroma: chroma(rgb) };
});

const dark = top.filter((c) => c.luma < 110).sort((a, b) => b.n - a.n)[0];
const accent = top
  .filter((c) => c.luma >= 110 && c.chroma > 60)
  .sort((a, b) => b.n - a.n)[0];

console.log(`\n  Sampled ${FILE} (${info.width}×${info.height})\n`);
console.log("  Most common brand colours:");
for (const c of top.slice(0, 6)) {
  const share = ((c.n / [...counts.values()].reduce((a, b) => a + b, 0)) * 100).toFixed(1);
  console.log(`    ${hex(c.rgb).padEnd(9)} ${share.padStart(5)}%`);
}

if (!dark || !accent) {
  console.log(
    "\n  Could not identify both a dark and an accent colour with confidence.\n" +
      "  Check the list above and set them by hand.\n",
  );
  process.exit(0);
}

/** Mixes toward white (t>0) or black (t<0), which is how a tint scale is built. */
function shift([r, g, b], t) {
  const target = t > 0 ? 255 : 0;
  const amount = Math.abs(t);
  return [r, g, b].map((c) => Math.round(c + (target - c) * amount));
}

/**
 * Each scale needs its own step table because they are anchored differently.
 * The navy is the *darkest* colour in its ramp, so it sits at 900 and every
 * lighter step mixes toward white. The orange sits in the middle at 500, with
 * tints above and shades below. Using one table for both is what produced a
 * row of pure white where ink-50 to ink-400 should have been.
 */
const INK_STEPS = [
  [50, 0.97], [100, 0.93], [200, 0.85], [300, 0.72], [400, 0.56],
  [500, 0.44], [600, 0.34], [700, 0.24], [800, 0.14], [900, 0], [950, -0.28],
];

const FLAME_STEPS = [
  [50, 0.94], [100, 0.86], [200, 0.7], [300, 0.5], [400, 0.26],
  [500, 0], [600, -0.16], [700, -0.32], [800, -0.48], [900, -0.62], [950, -0.74],
];

function scale(name, base, steps) {
  console.log(`\n  /* ${name} — sampled from the logo */`);
  for (const [step, t] of steps) {
    console.log(`  --color-${name}-${step}: ${hex(t === 0 ? base : shift(base, t))};`);
  }
}

console.log("\n  ── Paste into src/app/globals.css ─────────────────────────");
// The navy anchors the dark end of the ink ramp; the orange anchors the middle
// of the flame ramp, matching how the theme already uses them.
scale("ink", dark.rgb, INK_STEPS);
scale("flame", accent.rgb, FLAME_STEPS);
console.log("\n  Brand core:");
console.log(`    navy   ${hex(dark.rgb)}`);
console.log(`    orange ${hex(accent.rgb)}\n`);
