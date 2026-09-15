import { Alert } from "./Alert";

/**
 * An editorial note addressed to whoever is building the site — never to a
 * visitor. **It cannot render in production.**
 *
 * These notes name the file to edit, the field to fill and the reason it
 * matters, which is exactly right for the person who can act on them and
 * exactly wrong for a homeowner comparing contractors. Written as plain
 * `<Alert>`s they shipped: the About page told customers to "replace this
 * block in src/app/about/page.tsx", both legal pages announced themselves as
 * templates that "need review before launch", and the pricing and financing
 * pages published the paths of the data files behind them.
 *
 * The guard lives here rather than at each call site because the failure is
 * silent — nothing looks wrong in development, where the note is supposed to
 * show, and the leak is only visible on the live site. One component that
 * returns null in production makes the whole class impossible rather than
 * something to remember nine times.
 *
 * What this does and does not do: the component returns null, so nothing is
 * rendered into the HTML a visitor receives — no element, no text, nothing to
 * reveal with devtools or a stylesheet. The note's wording does still sit in
 * the JavaScript chunk, because JSX evaluates a component's children at the
 * call site before the component itself runs, and no bundler can prove those
 * strings are unused. That is fine for build notes, which are reminders rather
 * than secrets. It would not be fine for anything confidential — a credential
 * or an unannounced price does not become private by being wrapped in this.
 *
 * When a visitor genuinely needs to know something — that financing is not
 * published, that prices are on request — say it to them in their own words,
 * outside this component. A missing section is not automatically a silent one.
 */
export function BuildNote({
  title,
  children,
  className,
}: {
  title?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  if (process.env.NODE_ENV === "production") return null;

  return (
    <Alert tone="info" title={title} className={className}>
      {children}
    </Alert>
  );
}
