/** Tiny class-name joiner. Falsy values are dropped; later strings win by order. */
export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

/** "1" -> "01" */
export function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
