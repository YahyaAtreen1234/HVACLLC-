import { PLACEHOLDER_FIELDS } from "@/config/business";

/**
 * Development-only reminder of what is still stand-in content.
 *
 * Renders nothing in production builds, so it can never reach a visitor. Its
 * job is to make sure placeholder business details are not accidentally
 * launched: clear the list in `src/config/business.ts` and it disappears.
 */
export function PlaceholderNotice() {
  if (process.env.NODE_ENV === "production") return null;
  if (!PLACEHOLDER_FIELDS.length) return null;

  return (
    <details className="border-b-2 border-amber-500/40 bg-amber-50 px-5 py-2 text-amber-900">
      <summary className="cursor-pointer text-sm font-semibold">
        Development notice: {PLACEHOLDER_FIELDS.length} groups of placeholder
        content still need real business data
      </summary>
      <ul className="mt-2 list-disc space-y-1 pl-6 text-xs">
        {PLACEHOLDER_FIELDS.map((field) => (
          <li key={field}>{field}</li>
        ))}
      </ul>
      <p className="mt-2 text-xs">
        This banner is hidden in production builds. Edit
        <code className="mx-1 rounded bg-amber-100 px-1">
          src/config/business.ts
        </code>
        to clear it.
      </p>
    </details>
  );
}
