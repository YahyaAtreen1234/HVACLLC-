import { cn } from "@/lib/utils";

/**
 * Horizontal page gutter. Every section uses this so content lines up on a
 * single vertical rhythm at every breakpoint.
 *
 * Each size keeps growing past 1280px rather than stopping there. It used to
 * stop, which looked right on the 1366px laptop the site was built on — 95% of
 * the screen — and looked like a column down the middle of anything larger:
 * 67% of a 1920 display, 50% of a 2560 one. The same page, half empty, on the
 * machines most desktop visitors actually use.
 *
 * They still stop somewhere, deliberately. Width is not free: a line of body
 * text past about 80 characters is measurably harder to read, because the eye
 * loses its place on the return sweep. So the caps rise with the screen and
 * then hold, and `narrow` — the long-form reading measure — barely moves at
 * all. The goal is a page that looks composed on a large display, not one
 * stretched across it.
 */
export function Container({
  children,
  size = "default",
  className,
}: {
  children: React.ReactNode;
  /** `narrow` for long-form reading, `wide` for full-bleed grids. */
  size?: "narrow" | "default" | "wide";
  className?: string;
}) {
  return (
    <div
      className={cn(
        // The gutter grows too, so content never runs to the bezel on a big
        // screen and never wastes width on a small one.
        "mx-auto w-full px-5 sm:px-6 lg:px-8 2xl:px-10 3xl:px-12",
        // Reading measure. One step at the very top and no further: this is
        // the one place where more width makes the page worse.
        size === "narrow" && "max-w-3xl 3xl:max-w-4xl",
        size === "default" && "max-w-6xl 2xl:max-w-7xl 3xl:max-w-[1500px]",
        size === "wide" &&
          "max-w-7xl 2xl:max-w-[1500px] 3xl:max-w-[1720px] 4xl:max-w-[1880px]",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Vertical section rhythm, so spacing is never re-invented per page. */
export function Section({
  children,
  className,
  tone = "light",
  id,
  spacing = "default",
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
  /** `dark` flips text colours and enables the on-dark focus ring. */
  tone?: "light" | "muted" | "dark";
  id?: string;
  spacing?: "tight" | "default" | "loose";
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <section
      id={id}
      className={cn(
        "relative",
        spacing === "tight" && "py-12 sm:py-16",
        spacing === "default" && "py-16 sm:py-20 lg:py-24",
        spacing === "loose" && "py-20 sm:py-28 lg:py-32",
        tone === "muted" && "bg-sand-100",
        tone === "dark" && "on-dark bg-ink-950 text-ink-100",
        className,
      )}
      {...rest}
    >
      {children}
    </section>
  );
}
