/**
 * Name helpers for the placeholder avatar.
 *
 * Kept in a `.ts` file rather than beside the component: the test runner
 * strips types from `.ts` but cannot compile the JSX in a `.tsx`, so logic
 * that deserves tests has to live outside the component file to be reachable.
 */

/** Initials for an avatar: first and last, ignoring anything in between. */
export function initialsOf(name: string): string {
  const words = name
    .trim()
    .split(/\s+/)
    .filter((word) => /^[A-Za-z]/.test(word));

  if (!words.length) return "";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

/**
 * True when the "name" is still an instruction to the site owner rather than a
 * person — the seeded entries read "Add owner's name" until replaced.
 *
 * Anchored to the start on purpose: someone surnamed Addison, or named Adam,
 * must not be mistaken for an unfinished field.
 */
export const isPrompt = (name: string) =>
  /^(add|your|placeholder|tbd)\b/i.test(name.trim());
