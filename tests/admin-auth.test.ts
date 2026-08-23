import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";

/**
 * Admin authentication.
 *
 * Everything here runs against throwaway credentials generated in-process. The
 * real ones are never read, so this suite is safe to run anywhere and cannot
 * print a secret.
 *
 * These paths had no coverage at all, which is uncomfortable for the one part
 * of the site that decides whether a stranger can edit it. The deployment
 * failure that prompted this was environment delivery rather than logic — but
 * that could only be established by confirming the logic itself was sound.
 */

const TEST_PASSWORD = "correct-horse-battery-staple";
const TEST_SECRET = "a".repeat(64);

const { hashPassword, verifyPassword } = await import(
  "../src/server/admin/password"
);

// Set before importing auth: env is read once, at module load.
process.env.ADMIN_PASSWORD_HASH = hashPassword(TEST_PASSWORD);
process.env.ADMIN_USERNAME = "test-owner";
process.env.ADMIN_SESSION_SECRET = TEST_SECRET;

const {
  createSessionToken,
  verifySessionToken,
  isAdminConfigured,
  adminEnvReport,
  sessionCookieOptions,
} = await import("../src/server/admin/auth");

describe("password verification", () => {
  test("accepts the correct password", () => {
    assert.equal(verifyPassword(TEST_PASSWORD, hashPassword(TEST_PASSWORD)), true);
  });

  test("rejects a wrong password", () => {
    const stored = hashPassword(TEST_PASSWORD);
    assert.equal(verifyPassword("not-the-password", stored), false);
    assert.equal(verifyPassword(TEST_PASSWORD.toUpperCase(), stored), false);
    assert.equal(verifyPassword("", stored), false);
  });

  test("a fresh hash of the same password differs each time", () => {
    // Random salt per hash. Two identical passwords must not produce identical
    // stored values, or one leaked hash would expose every account reusing it.
    assert.notEqual(hashPassword(TEST_PASSWORD), hashPassword(TEST_PASSWORD));
  });

  test("survives a malformed stored value instead of throwing", () => {
    for (const junk of ["", "nocolon", ":", "abc:", ":def", "a:b:c"]) {
      assert.equal(verifyPassword(TEST_PASSWORD, junk), false, `junk: ${junk}`);
    }
  });
});

describe("configuration detection", () => {
  test("a well-formed hash counts as configured", () => {
    assert.equal(isAdminConfigured(), true);
  });

  test("reports every variable as present", () => {
    const { checks } = adminEnvReport();
    for (const check of checks) {
      assert.equal(check.ok, true, `${check.key} reported as not ok`);
    }
  });

  test("never includes a secret value in its report", () => {
    const { checks, context } = adminEnvReport();
    const text = JSON.stringify({ checks, context });

    assert.ok(
      !text.includes(TEST_SECRET),
      "the session secret appeared in the diagnostic output",
    );
    assert.ok(
      !text.includes(process.env.ADMIN_PASSWORD_HASH!),
      "the password hash appeared in the diagnostic output",
    );
  });
});

describe("session tokens", () => {
  test("a freshly issued token verifies", () => {
    assert.equal(verifySessionToken(createSessionToken()), true);
  });

  test("rejects nothing, junk and a missing signature", () => {
    assert.equal(verifySessionToken(undefined), false);
    assert.equal(verifySessionToken(null), false);
    assert.equal(verifySessionToken(""), false);
    assert.equal(verifySessionToken("garbage"), false);
    assert.equal(verifySessionToken(`${Date.now() + 10_000}`), false);
  });

  test("rejects a token whose signature has been altered", () => {
    const token = createSessionToken();
    const cut = token.lastIndexOf(".");
    const payload = token.slice(0, cut);
    const signature = token.slice(cut + 1);

    const flipped =
      (signature[0] === "a" ? "b" : "a") + signature.slice(1);

    assert.equal(verifySessionToken(`${payload}.${flipped}`), false);
  });

  test("rejects an extended expiry — the whole point of signing it", () => {
    const token = createSessionToken();
    const signature = token.slice(token.lastIndexOf(".") + 1);
    const farFuture = Date.now() + 365 * 24 * 60 * 60 * 1000;

    // Re-using a valid signature over a different payload must not pass.
    assert.equal(verifySessionToken(`${farFuture}.${signature}`), false);
  });

  test("rejects an expired token", () => {
    // Signed with the real secret, but already past its expiry.
    const past = String(Date.now() - 1000);
    const signature = createHmac("sha256", TEST_SECRET).update(past).digest("hex");

    assert.equal(verifySessionToken(`${past}.${signature}`), false);
  });
});

describe("session cookie", () => {
  test("is httpOnly and same-site, so script cannot read it", () => {
    const options = sessionCookieOptions();
    assert.equal(options.httpOnly, true);
    assert.equal(options.sameSite, "lax");
    assert.equal(options.path, "/");
    assert.ok(options.maxAge > 0);
  });
});
