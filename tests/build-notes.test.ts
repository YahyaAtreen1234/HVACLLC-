import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Editorial build notes must never reach a visitor.
 *
 * Nine of them shipped. The About page told customers to "replace this block
 * in src/app/about/page.tsx"; both legal pages announced themselves as
 * templates that "need review before launch"; the pricing and financing pages
 * printed the paths of their own data files. Four were live on the public site
 * and the other five were one data change away from joining them.
 *
 * The failure is invisible where it is written: in development the note is
 * supposed to show, so nothing looks wrong until the live site is read. Worse,
 * the About note named a path that did not exist — `src/app/about/page.tsx`
 * rather than `src/app/(site)/about/page.tsx` — and following it created a
 * second definition of /about that broke the build.
 *
 * `BuildNote` returns null in production, so the guard is structural. This
 * test is the other half: it fails if a developer-facing note is ever written
 * as a plain `<Alert>` again, which would render for everyone.
 */

const SRC = join(import.meta.dirname, "..", "src");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory()
      ? walk(full)
      : /\.tsx$/.test(full)
        ? [full]
        : [];
  });
}

/** Phrases that address whoever is building the site, not whoever is reading it. */
const DEVELOPER_MARKERS = [
  /<code>src\//,
  /<code>\/admin\//,
  /before launch/i,
  /replace this block/i,
  /\bset real figures\b/i,
];

/** Every `<Alert ...>` … `</Alert>` region in a file. */
function alertBlocks(source: string): string[] {
  const blocks: string[] = [];
  const open = /<Alert\b/g;
  let match: RegExpExecArray | null;

  while ((match = open.exec(source))) {
    const end = source.indexOf("</Alert>", match.index);
    blocks.push(source.slice(match.index, end === -1 ? source.length : end));
  }

  return blocks;
}

describe("build notes never ship to visitors", () => {
  const files = walk(SRC);

  test("finds the components it is meant to be checking", () => {
    assert.ok(files.length > 20, `only ${files.length} tsx files found — is SRC right?`);
    assert.ok(
      files.some((f) => f.endsWith("BuildNote.tsx")),
      "BuildNote.tsx is missing; the production guard is gone",
    );
  });

  test("BuildNote refuses to render in production", () => {
    const source = readFileSync(join(SRC, "components", "ui", "BuildNote.tsx"), "utf8");
    assert.match(
      source,
      /process\.env\.NODE_ENV\s*===\s*"production"[\s\S]{0,40}return null/,
      "BuildNote must return null in production — that is the whole point of it",
    );
  });

  test("no developer-facing note is written as a plain <Alert>", () => {
    const offenders: string[] = [];

    for (const file of files) {
      if (file.endsWith("BuildNote.tsx")) continue;

      for (const block of alertBlocks(readFileSync(file, "utf8"))) {
        const marker = DEVELOPER_MARKERS.find((pattern) => pattern.test(block));
        if (marker) {
          offenders.push(`${file.replace(SRC, "src")} — matched ${marker}`);
        }
      }
    }

    assert.deepEqual(
      offenders,
      [],
      `These <Alert>s carry developer-only wording and render for everyone.\n` +
        `Use <BuildNote> instead:\n  ${offenders.join("\n  ")}`,
    );
  });

  test("no build note points at a route path that does not exist", () => {
    // The About note named src/app/about/page.tsx. Creating that file defines
    // /about twice, because the real page lives under the (site) route group.
    const referenced = new Set<string>();

    for (const file of files) {
      for (const m of readFileSync(file, "utf8").matchAll(
        /<code>(src\/app\/[^<]+\.tsx)<\/code>/g,
      )) {
        referenced.add(m[1]);
      }
    }

    const missing = [...referenced].filter(
      (path) => !files.some((f) => f.replace(/\\/g, "/").endsWith(path.replace("src/", ""))),
    );

    assert.deepEqual(
      missing,
      [],
      `A note names a file that does not exist, so following it creates one: ${missing.join(", ")}`,
    );
  });
});
