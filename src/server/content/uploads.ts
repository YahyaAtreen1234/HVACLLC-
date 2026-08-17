import { randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { extname, join, resolve, sep } from "node:path";
import { env } from "../env";

/**
 * Image uploads for the admin panel.
 *
 * ## Why not just write into `public/`?
 *
 * Next copies `public/` into the build output once, at build time. A file
 * dropped in there while the server is running is **not** served in
 * production — it would appear to work in `next dev` and then 404 on the live
 * site, which is the worst kind of bug: invisible until a customer sees it.
 *
 * So uploads live next to the SQLite database instead and are served by a
 * route handler (`src/app/uploads/[...path]/route.ts`). That gives them the
 * same persistence story as the leads database, which is already documented:
 * fine on a VPS or container with a mounted volume, needs object storage
 * (S3/R2/Blob) on a host with an ephemeral filesystem.
 */

/** Where uploaded files are written. Defaults alongside the database. */
export function uploadsDir(): string {
  return resolve(process.cwd(), env.uploadsPath);
}

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

/**
 * Accepted formats, keyed by the magic bytes that actually prove the type.
 *
 * The browser-supplied MIME type is attacker-controlled — anyone can POST a
 * script with `Content-Type: image/png`. Sniffing the leading bytes is what
 * makes the check real.
 */
const SIGNATURES: Array<{
  ext: string;
  mime: string;
  test: (bytes: Uint8Array) => boolean;
}> = [
  {
    ext: ".jpg",
    mime: "image/jpeg",
    test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    ext: ".png",
    mime: "image/png",
    test: (b) =>
      b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  },
  {
    ext: ".webp",
    mime: "image/webp",
    test: (b) =>
      // "RIFF" .... "WEBP"
      b[0] === 0x52 &&
      b[1] === 0x49 &&
      b[2] === 0x46 &&
      b[3] === 0x46 &&
      b[8] === 0x57 &&
      b[9] === 0x45 &&
      b[10] === 0x42 &&
      b[11] === 0x50,
  },
  {
    ext: ".avif",
    mime: "image/avif",
    test: (b) =>
      // "ftyp" at offset 4, then a brand starting "avi"
      b[4] === 0x66 &&
      b[5] === 0x74 &&
      b[6] === 0x79 &&
      b[7] === 0x70 &&
      b[8] === 0x61 &&
      b[9] === 0x76 &&
      b[10] === 0x69,
  },
];

export type UploadResult =
  | { ok: true; path: string }
  | { ok: false; error: string };

/**
 * Saves an uploaded image and returns the public path to store on the record.
 *
 * The client's filename is never used — it is attacker-controlled and a
 * classic path-traversal vector (`../../.env`). A UUID plus the extension
 * proven by the magic bytes is generated instead.
 */
export async function saveUpload(
  file: File,
  folder: "team" | "services" | "general",
): Promise<UploadResult> {
  if (!file || file.size === 0) return { ok: false, error: "No file received." };

  if (file.size > MAX_BYTES) {
    return {
      ok: false,
      error: `That image is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is 8 MB — resize it and try again.`,
    };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const match = SIGNATURES.find((sig) => sig.test(bytes));

  if (!match) {
    return {
      ok: false,
      error:
        "That file is not a JPEG, PNG, WebP or AVIF image. Check the file and try again.",
    };
  }

  const name = `${randomUUID()}${match.ext}`;
  const dir = join(uploadsDir(), folder);

  try {
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, name), bytes);
  } catch {
    return {
      ok: false,
      error: "The image could not be saved on the server. Check disk space.",
    };
  }

  return { ok: true, path: `/uploads/${folder}/${name}` };
}

/** Content type for a stored file, from its extension. */
export function contentTypeFor(filePath: string): string | null {
  const ext = extname(filePath).toLowerCase();
  return SIGNATURES.find((sig) => sig.ext === ext)?.mime ?? null;
}

/**
 * Reads a stored upload for the serving route.
 *
 * Resolves the path and confirms it is still inside the uploads directory, so
 * a crafted URL (`/uploads/../../.env.local`) cannot escape it.
 */
export function readUpload(
  segments: string[],
): { bytes: Buffer; contentType: string } | null {
  const base = uploadsDir();
  const target = resolve(base, ...segments);

  if (target !== base && !target.startsWith(base + sep)) return null;
  if (!existsSync(target)) return null;

  const contentType = contentTypeFor(target);
  if (!contentType) return null;

  try {
    return { bytes: readFileSync(target), contentType };
  } catch {
    return null;
  }
}

/** True for paths this app serves itself (as opposed to /images/... in public). */
export function isUploadPath(path: string): boolean {
  return path.startsWith("/uploads/");
}
