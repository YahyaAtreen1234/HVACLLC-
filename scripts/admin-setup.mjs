#!/usr/bin/env node
import { randomBytes, scryptSync } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

/**
 * Generates admin credentials and writes them to .env.local.
 *
 * Run with: npm run admin:setup
 *
 * The password is never stored — only a scrypt hash of it, which cannot be
 * reversed. If you forget the password, run this again to set a new one.
 */

const ENV_FILE = ".env.local";

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function upsert(contents, key, value) {
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key}=.*$`, "m");
  if (pattern.test(contents)) return contents.replace(pattern, line);
  return `${contents.trimEnd()}\n${line}\n`;
}

const rl = createInterface({ input: stdin, output: stdout });

console.log("\n  Admin account setup\n  ───────────────────\n");

const username =
  (await rl.question("  Username [admin]: ")).trim() || "admin";

const password = (await rl.question("  Password (min 12 chars): ")).trim();

if (password.length < 12) {
  console.error(
    "\n  ✗ Too short. A 12+ character passphrase is the single biggest\n" +
      "    protection this panel has — it is reachable from the internet.\n",
  );
  rl.close();
  process.exit(1);
}

rl.close();

let contents = existsSync(ENV_FILE) ? readFileSync(ENV_FILE, "utf8") : "";

contents = upsert(contents, "ADMIN_USERNAME", username);
contents = upsert(contents, "ADMIN_PASSWORD_HASH", hashPassword(password));

// Only generate a session secret if there isn't one — regenerating it would
// log out every existing session.
if (!/^ADMIN_SESSION_SECRET=.+$/m.test(contents)) {
  contents = upsert(
    contents,
    "ADMIN_SESSION_SECRET",
    randomBytes(32).toString("hex"),
  );
}

writeFileSync(ENV_FILE, contents);

// Quoted, so a space or trailing character in the username is visible. Typing
// it back wrong is otherwise indistinguishable from a wrong password.
const spaceWarning = /\s/.test(username)
  ? "\n    ⚠️  That username contains a space — type it exactly as shown.\n"
  : "";

console.log(`
  ✓ Saved to ${ENV_FILE}

    Username: "${username}"
    Password: (hashed — not stored in readable form)
${spaceWarning}
  ⚠️  RESTART THE DEV SERVER. Credentials are read once at startup, so a
      server that is already running will keep rejecting the new password.

      Stop it with Ctrl+C, then:  npm run dev

  Then sign in at http://localhost:3000/admin

  For production, copy ADMIN_USERNAME, ADMIN_PASSWORD_HASH and
  ADMIN_SESSION_SECRET into your host's environment variables.
`);
