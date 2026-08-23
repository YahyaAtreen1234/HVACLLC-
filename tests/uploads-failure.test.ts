import { test, describe, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * What happens when an upload cannot be stored.
 *
 * Kept apart from uploads.test.ts because the destination is chosen once, when
 * the module first loads, and this file needs a destination that cannot work.
 * The test runner gives each file its own process, so the two settings do not
 * collide.
 *
 * The case matters because it is the one that reached production: on a
 * read-only serverless filesystem every write fails, and the failure has to
 * arrive as a message the site owner can act on rather than as a crash.
 */

const dir = mkdtempSync(join(tmpdir(), "hvac-upload-fail-"));

// A regular file standing where a directory is expected. Creating anything
// beneath it fails with ENOTDIR on Windows and POSIX alike — the closest
// portable stand-in for a read-only filesystem.
const blocker = join(dir, "blocker");
writeFileSync(blocker, "not a directory");
process.env.UPLOADS_PATH = join(blocker, "uploads");
process.env.BLOB_READ_WRITE_TOKEN = "";

const { saveUpload } = await import("../src/server/content/uploads");

after(() => {
  rmSync(dir, { recursive: true, force: true });
});

const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

describe("when the destination cannot be written", () => {
  test("reports a failure instead of throwing", async () => {
    const file = new File([PNG as unknown as BlobPart], "photo.png", {
      type: "image/png",
    });

    // Must not reject. A throw here becomes Next's generic error screen, which
    // loses the reason and discards everything typed into the form.
    const result = await saveUpload(file, "team");

    assert.equal(result.ok, false, "a failed write reported success");
  });

  test("explains the cause and names the fix", async () => {
    const file = new File([PNG as unknown as BlobPart], "photo.png", {
      type: "image/png",
    });
    const result = await saveUpload(file, "team");

    assert.equal(result.ok, false);
    if (result.ok) return;

    // The old wording blamed disk space, which is wrong on a host that has no
    // writable disk by design and sends the reader somewhere useless.
    assert.doesNotMatch(result.error, /disk space/i);
    assert.match(result.error, /read-only/i);
    assert.match(result.error, /BLOB_READ_WRITE_TOKEN/);
  });
});
