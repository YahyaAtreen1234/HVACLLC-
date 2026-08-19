/**
 * Prints the admin variables in the format hosting dashboards accept as a
 * bulk paste, so they do not have to be copied one field at a time.
 *
 * Run with:  npm run admin:env
 *
 * Reads .env.local (or a path given as the first argument). Nothing is sent
 * anywhere — it only reformats what is already on this machine.
 */

import { readFileSync } from "node:fs";

const FILE = process.argv[2] ?? ".env.local";

const NEEDED = [
  {
    key: "ADMIN_USERNAME",
    why: "the name you type into the sign-in form",
  },
  {
    key: "ADMIN_PASSWORD_HASH",
    why: "scrypt hash of your password — the password itself is never stored",
  },
  {
    key: "ADMIN_SESSION_SECRET",
    why: "signs the session cookie; without it you sign in and get bounced straight back",
  },
];

let contents;
try {
  contents = readFileSync(FILE, "utf8");
} catch {
  console.error(`
  Could not read ${FILE}.

  Run \`npm run admin:setup\` first — it creates the credentials.
`);
  process.exit(1);
}

const values = new Map();
for (const line of contents.split(/\r?\n/)) {
  const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line);
  if (match) values.set(match[1], match[2].trim().replace(/^["']|["']$/g, ""));
}

const missing = NEEDED.filter(({ key }) => !values.get(key));

if (missing.length === NEEDED.length) {
  console.error(`
  ${FILE} has none of the admin variables.

  Run \`npm run admin:setup\` to create them.
`);
  process.exit(1);
}

console.log(`
  Paste this into your host's environment variables
  ─────────────────────────────────────────────────
  Vercel: Settings -> Environment Variables -> paste into the key field;
  it accepts a whole .env block at once.

  Tick Production, Preview AND Development. A variable set only for
  Production leaves preview URLs — the ones with a random suffix, which is
  what you get from a branch deploy — still broken.

  Then redeploy. Variables do not reach a build that already happened.
`);

console.log("  ┌─────────────────────────────────────────────────────────");
for (const { key } of NEEDED) {
  const value = values.get(key);
  console.log(`  │ ${key}=${value ?? "  *** MISSING — run npm run admin:setup ***"}`);
}
console.log("  └─────────────────────────────────────────────────────────\n");

if (missing.length) {
  console.log("  Missing, and why each matters:");
  for (const { key, why } of missing) console.log(`    ${key} — ${why}`);
  console.log("");
}

console.log(
  `  Keep these off screen-shares and out of chat: ADMIN_SESSION_SECRET can\n` +
    `  mint a valid session cookie for anyone holding it.\n`,
);
