/**
 * Builds the theme ramps from the brand's exact colours and checks the
 * contrast of every pairing the site actually renders.
 *
 * Run with:  npm run brand:palette
 *
 * Picking a brand colour and trusting it is how sites end up with pale orange
 * button labels nobody outside the design review can read. WCAG puts the bar
 * at 4.5:1 for normal text and 3:1 for large text and interface furniture, so
 * the pairings are measured rather than eyeballed.
 */

const NAVY = process.argv[2] ?? "#001C41";
const ORANGE = process.argv[3] ?? "#EE600C";
const WHITE = "#FFFFFF";

const rgb = (hex) => {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const hex = ([r, g, b]) =>
  "#" + [r, g, b].map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0")).join("");

/** Mix toward white for t > 0, toward black for t < 0. */
const shift = ([r, g, b], t) =>
  t >= 0
    ? [r + (255 - r) * t, g + (255 - g) * t, b + (255 - b) * t]
    : [r * (1 + t), g * (1 + t), b * (1 + t)];

/** WCAG relative luminance. */
function luminance([r, g, b]) {
  const f = (v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrast(a, b) {
  const [hi, lo] = [luminance(rgb(a)), luminance(rgb(b))].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// The navy anchors the darkest step, because bg-ink-950 is what the footer,
// the dark bands and the admin chrome actually paint with — that is where the
// brand colour has to land exactly.
const INK_STEPS = [
  [50, 0.975], [100, 0.94], [200, 0.86], [300, 0.74], [400, 0.58],
  [500, 0.46], [600, 0.36], [700, 0.26], [800, 0.16], [900, 0.07], [950, 0],
];

const FLAME_STEPS = [
  [50, 0.95], [100, 0.88], [200, 0.72], [300, 0.52], [400, 0.27],
  [500, 0], [600, -0.17], [700, -0.34], [800, -0.5], [900, -0.64], [950, -0.76],
];

function ramp(name, base, steps) {
  const out = [];
  for (const [step, t] of steps) {
    out.push([`--color-${name}-${step}`, t === 0 ? base.toLowerCase() : hex(shift(rgb(base), t))]);
  }
  return out;
}

const ink = ramp("ink", NAVY, INK_STEPS);
const flame = ramp("flame", ORANGE, FLAME_STEPS);

const get = (list, step) => list.find(([k]) => k.endsWith(`-${step}`))[1];

console.log(`\n  Brand palette\n  ─────────────`);
console.log(`  navy   ${NAVY}`);
console.log(`  orange ${ORANGE}`);
console.log(`  white  ${WHITE}\n`);

for (const [key, value] of [...ink, ...flame]) {
  console.log(`  ${key}: ${value};`);
}

// ---------------------------------------------------------------------------
// Contrast
// ---------------------------------------------------------------------------

const AA_TEXT = 4.5;
const AA_LARGE = 3;

const pairs = [
  ["navy text on white", NAVY, WHITE, AA_TEXT],
  ["white text on navy", WHITE, NAVY, AA_TEXT],
  ["white text on orange 500", WHITE, ORANGE, AA_TEXT],
  ["navy text on orange 500", NAVY, ORANGE, AA_TEXT],
  ["white text on orange 600", WHITE, get(flame, 600), AA_TEXT],
  ["white text on orange 700", WHITE, get(flame, 700), AA_TEXT],
  ["orange 500 text on white", ORANGE, WHITE, AA_TEXT],
  ["orange 600 text on white", get(flame, 600), WHITE, AA_TEXT],
  ["orange 700 text on white", get(flame, 700), WHITE, AA_TEXT],
  ["orange 400 text on navy", get(flame, 400), NAVY, AA_TEXT],
  ["orange 500 as a border/icon on white", ORANGE, WHITE, AA_LARGE],
  ["ink-600 body text on white", get(ink, 600), WHITE, AA_TEXT],
  ["ink-700 body text on white", get(ink, 700), WHITE, AA_TEXT],
  ["ink-300 text on navy", get(ink, 300), NAVY, AA_TEXT],
];

console.log(`\n  Contrast (WCAG AA: 4.5:1 normal text, 3:1 large text and UI)\n  ${"─".repeat(58)}`);

let failures = 0;
for (const [label, fg, bg, need] of pairs) {
  const ratio = contrast(fg, bg);
  const ok = ratio >= need;
  if (!ok) failures++;
  console.log(
    `  ${ok ? "PASS" : "FAIL"}  ${ratio.toFixed(2).padStart(5)}:1  (needs ${need})  ${label}`,
  );
}

console.log(
  failures
    ? `\n  ${failures} pairing(s) below the bar — do not use those combinations for text.\n`
    : `\n  All pairings pass.\n`,
);
