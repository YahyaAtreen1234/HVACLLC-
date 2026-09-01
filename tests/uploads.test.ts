import { test, describe, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, existsSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Image upload validation and storage routing.
 *
 * Uploads are the one place the admin panel accepts an arbitrary file from a
 * browser, so the checks that decide what is accepted are worth pinning down:
 * the declared content type is attacker-controlled and only the leading bytes
 * prove what a file really is.
 *
 * Storage has two branches — object storage when a blob token is present, the
 * local filesystem otherwise. Only the filesystem branch is exercised here;
 * the blob branch needs a real token and a network, and faking the client
 * would only test the fake.
 */

const dir = mkdtempSync(join(tmpdir(), "hvac-uploads-"));
process.env.UPLOADS_PATH = dir;
process.env.BLOB_READ_WRITE_TOKEN = "";

const { saveUpload, contentTypeFor, isPrivateStoreError, blobPathFor } =
  await import("../src/server/content/uploads");

after(() => {
  rmSync(dir, { recursive: true, force: true });
});

/** Smallest byte sequences that carry each format's real signature. */
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);

function asFile(bytes: Uint8Array, name: string, type: string): File {
  return new File([bytes as unknown as BlobPart], name, { type });
}

describe("what gets accepted", () => {
  test("stores a real PNG", async () => {
    const result = await saveUpload(asFile(PNG, "photo.png", "image/png"), "team");

    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.match(result.path, /^\/uploads\/team\/[0-9a-f-]{36}\.png$/);
  });

  test("stores a real JPEG", async () => {
    const result = await saveUpload(asFile(JPEG, "photo.jpg", "image/jpeg"), "team");
    assert.equal(result.ok, true);
  });

  test("rejects a script that merely claims to be an image", async () => {
    // The exact attack the signature check exists for: correct extension,
    // correct declared type, contents that are not an image at all.
    const script = new TextEncoder().encode("<?php system($_GET['c']); ?>");
    const result = await saveUpload(asFile(script, "photo.png", "image/png"), "team");

    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.match(result.error, /not a JPEG, PNG, WebP or AVIF/);
  });

  test("rejects an empty file", async () => {
    const result = await saveUpload(asFile(new Uint8Array(), "e.png", "image/png"), "team");
    assert.equal(result.ok, false);
  });

  test("rejects anything over the size limit", async () => {
    const huge = new Uint8Array(9 * 1024 * 1024);
    huge.set(PNG);
    const result = await saveUpload(asFile(huge, "big.png", "image/png"), "team");

    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.match(result.error, /limit is 8 MB/);
  });
});

describe("how it is stored", () => {
  test("discards the client filename entirely", async () => {
    // A traversal attempt in the filename must not influence the stored path.
    const result = await saveUpload(
      asFile(PNG, "../../../etc/passwd.png", "image/png"),
      "team",
    );

    assert.equal(result.ok, true);
    if (!result.ok) return;

    assert.ok(!result.path.includes(".."), "path escaped the uploads folder");
    assert.ok(!result.path.includes("passwd"), "client filename was reused");
    assert.match(result.path, /^\/uploads\/team\/[0-9a-f-]{36}\.png$/);
  });

  test("two uploads of the same image never collide", async () => {
    const a = await saveUpload(asFile(PNG, "same.png", "image/png"), "services");
    const b = await saveUpload(asFile(PNG, "same.png", "image/png"), "services");

    assert.equal(a.ok && b.ok, true);
    if (!a.ok || !b.ok) return;
    assert.notEqual(a.path, b.path);
  });

  test("the file really lands on disk in the right folder", async () => {
    const result = await saveUpload(asFile(PNG, "x.png", "image/png"), "general");
    assert.equal(result.ok, true);
    if (!result.ok) return;

    const name = result.path.split("/").pop()!;
    assert.ok(
      existsSync(join(dir, "general", name)),
      "upload reported success but no file was written",
    );
    assert.ok(readdirSync(join(dir, "general")).includes(name));
  });
});

describe("content types", () => {
  test("maps extensions to the type actually served", () => {
    assert.equal(contentTypeFor("/uploads/team/a.png"), "image/png");
    assert.equal(contentTypeFor("/uploads/team/a.jpg"), "image/jpeg");
    assert.equal(contentTypeFor("/uploads/team/a.webp"), "image/webp");
  });

  test("refuses to serve anything that is not an image", () => {
    assert.equal(contentTypeFor("/uploads/team/a.html"), null);
    assert.equal(contentTypeFor("/uploads/team/a.js"), null);
    assert.equal(contentTypeFor("/uploads/team/a"), null);
  });
});

/**
 * A Blob store is created as either public or private and cannot serve the
 * other kind. The store connected to this project is private, which rejected
 * every upload with "Cannot use public access on a private store" — aborting
 * the whole save, so no photo could ever be attached.
 *
 * The rejection is matched on its message, which is brittle enough to be worth
 * pinning: if it stops matching, uploads fail loudly rather than silently
 * retrying in the wrong mode.
 */
describe("recognising a private Blob store", () => {
  test("matches the rejection the store actually returns", () => {
    const real = new Error(
      "Vercel Blob: Cannot use public access on a private store. The store is configured with private access.",
    );
    assert.equal(isPrivateStoreError(real), true);
  });

  test("does not swallow unrelated blob failures", () => {
    // These must keep throwing. Treating any of them as a store-access problem
    // would retry privately, appear to work, and bury a real fault.
    for (const message of [
      "Vercel Blob: This store does not exist",
      "Vercel Blob: Access denied, please provide a valid token",
      "Vercel Blob: File is too large",
      "fetch failed",
    ]) {
      assert.equal(
        isPrivateStoreError(new Error(message)),
        false,
        `should not be treated as a private-store error: ${message}`,
      );
    }
  });

  test("survives a thrown non-Error", () => {
    assert.equal(isPrivateStoreError("something odd"), false);
    assert.equal(isPrivateStoreError(undefined), false);
  });
});

describe("where a private blob is read back from", () => {
  test("points at this site's own image route", () => {
    // A private blob has no publicly fetchable URL, so the stored record has
    // to point at the route that can read it back with the token.
    assert.equal(blobPathFor("team/abc.jpg"), "/uploads/team/abc.jpg");
  });

  test("keeps the folder, so the read resolves to the same blob", () => {
    assert.equal(blobPathFor("services/9f2.webp"), "/uploads/services/9f2.webp");
  });
});
