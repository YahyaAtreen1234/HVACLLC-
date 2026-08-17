/**
 * Renders a JSON-LD structured-data block.
 *
 * `JSON.stringify` output is escaped so a `<` inside any string value cannot
 * close the script tag early — the standard XSS guard for inline JSON-LD.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
