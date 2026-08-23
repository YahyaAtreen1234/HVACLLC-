import { existsSync } from "node:fs";
import { join } from "node:path";

/**
 * Returns a `public/` path only if the file is actually there, otherwise "".
 *
 * `next/image` renders a broken-image icon for a missing file, and it fails at
 * request time rather than at build — so nothing catches it before a visitor
 * does. Components that take an image already treat an empty `src` as "no
 * photo yet" and draw a labelled placeholder instead, which is a far better
 * thing to show than a broken icon.
 *
 * The practical effect: a photograph can be dropped into `public/` and appears
 * on the next request, with no code change and no redeploy.
 *
 * Server-only — it touches the filesystem.
 */

const cache = new Map<string, boolean>();

export function publicAsset(path: string): string {
  const cached = cache.get(path);
  if (cached !== undefined) return cached ? path : "";

  // `turbopackIgnore` because the path is composed at runtime; without it the
  // bundler traces the whole project into every function that renders an image.
  const full = join(/*turbopackIgnore: true*/ process.cwd(), "public", path);
  const exists = existsSync(full);

  cache.set(path, exists);
  return exists ? path : "";
}
