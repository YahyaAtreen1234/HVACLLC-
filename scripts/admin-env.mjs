/**
 * Prints the admin variables in the format hosting dashboards accept as a
 * bulk paste, so they do not have to be copied one field at a time.
 *
 * Run with:  npm run admin:env
 *
 * Reads .env.local (or a path given as the first argument). Nothing is sent
 * anywhere — it only reformats what is already on this machine.
 */

import { readFileSync, writeFileSync } from "node:fs";

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

/**
 * Written to a file as well as printed.
 *
 * Vercel's environment page has an "Import .env" button, and pointing it at a
 * file avoids copying altogether — which matters because a selection that
 * catches one stray character makes the whole paste fail with a complaint
 * about invalid characters in the variable *name*, giving no clue that the
 * problem is the copy rather than the value.
 */
const OUT_FILE = ".env.vercel";

const block = NEEDED.map(({ key }) => `${key}=${values.get(key) ?? ""}`).join(
  "\n",
);

writeFileSync(OUT_FILE, `${block}\n`);

console.log(`
  Two ways to get these into Vercel
  ─────────────────────────────────

  Easiest — no copying:
    Settings -> Environment Variables -> "Import .env"
    Choose the file just written:  ${OUT_FILE}

  Or copy the three lines below. Select from the first character of
  ADMIN_USERNAME to the end of the last line and nothing else — no leading
  spaces, no blank line above.

  Either way: tick Production, Preview AND Development, then redeploy.
  Variables do not reach a build that already happened.
`);

// Printed flush to the left margin and undecorated, so an over-eager selection
// picks up nothing that Vercel would reject as part of a variable name.
console.log(block);
console.log("");

if (missing.length) {
  console.log("  Missing, and why each matters:");
  for (const { key, why } of missing) console.log(`    ${key} — ${why}`);
  console.log("");
}

console.log(
  `  ${OUT_FILE} holds live secrets. It is git-ignored, and worth deleting\n` +
    `  once Vercel has them:  del ${OUT_FILE}\n\n` +
    `  Keep these off screen-shares and out of chat: ADMIN_SESSION_SECRET can\n` +
    `  mint a valid session cookie for anyone holding it.\n`,
);
