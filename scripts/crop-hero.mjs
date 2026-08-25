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

// A column counts as photographic when it holds mid-tones. Flat artwork — the
// navy headline, the orange buttons, white space — is saturated or extreme;
// a photograph of grey metal is neither.
function isPhotoColumn(x) {
  let midtones = 0;
  for (let y = 0; y < height; y += 2) {
    const [r, g, b] = at(x, y);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const grey = max - min < 40;
    const mid = max > 60 && max < 232;
    if (grey && mid) midtones++;
  }
  return midtones > height * 0.12;
}

let left = width - 1;
for (let x = width - 1; x >= 0; x--) {
  if (isPhotoColumn(x)) left = x;
  else if (left < width - 1 && width - x > width * 0.25) break;
}

// Trim blank margins around the detected region.
const isBlank = (x, y) => {
  const [r, g, b] = at(x, y);
  return r > 244 && g > 244 && b > 244;
};

let top = 0;
let bottom = height - 1;
const columnBlank = (y) => {
  for (let x = left; x < width; x += 2) if (!isBlank(x, y)) return false;
  return true;
};
while (top < height && columnBlank(top)) top++;
while (bottom > top && columnBlank(bottom)) bottom--;

const w = width - left;
const h = bottom - top + 1;

console.log(`  source            ${width}x${height}`);
console.log(`  photo begins at   x=${left}  (${Math.round((left / width) * 100)}% across)`);
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
