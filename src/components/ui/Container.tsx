import { cn } from "@/lib/utils";

/**
 * Horizontal page gutter. Every section uses this so content lines up on a
 * single vertical rhythm at every breakpoint.
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
        "mx-auto w-full px-5 sm:px-6 lg:px-8",
        size === "narrow" && "max-w-3xl",
        size === "default" && "max-w-6xl",
        size === "wide" && "max-w-7xl",
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
