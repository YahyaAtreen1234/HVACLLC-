import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/**
 * Password hashing with scrypt.
 *
 * scrypt is deliberately slow and memory-hard, which is what you want for a
 * password: it makes brute-forcing a stolen hash expensive. A plain SHA-256
 * would be fast enough to test billions of guesses per second.
 *
 * Stored format: `salt:hash`, both hex.
 */

const KEY_LENGTH = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;

  try {
    const candidate = scryptSync(password, salt, KEY_LENGTH);
    const expected = Buffer.from(hash, "hex");

    if (candidate.length !== expected.length) return false;
    return timingSafeEqual(candidate, expected);
  } catch {
    return false;
  }
}
