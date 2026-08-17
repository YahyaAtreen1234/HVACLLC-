import { cn } from "@/lib/utils";

/**
 * Shared section header: small eyebrow label, heading, optional lead paragraph.
 *
 * `as` controls the heading level so pages keep a valid outline (one h1 per
 * page, sections use h2) without changing the visual size.
 */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  as: Tag = "h2",
  align = "left",
  tone = "light",
  size = "md",
  className,
  id,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  as?: "h1" | "h2" | "h3";
  align?: "left" | "center";
  tone?: "light" | "dark";
  size?: "md" | "lg";
  className?: string;
  id?: string;
}) {
  const dark = tone === "dark";

  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow ? (
        <p
          className={cn(
            "eyebrow mb-3 flex items-center gap-3",
            align === "center" && "justify-center",
            dark ? "text-chill-300" : "text-flame-600",
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "h-px w-8",
              dark ? "bg-chill-300/60" : "bg-flame-500/50",
            )}
          />
          {eyebrow}
        </p>
      ) : null}

      <Tag
        id={id}
        className={cn(
          "text-balance",
          size === "md"
            ? "text-3xl leading-[1.1] sm:text-4xl lg:text-[2.75rem]"
            : "text-4xl leading-[1.05] sm:text-5xl lg:text-6xl",
          dark ? "text-white" : "text-ink-950",
        )}
      >
        {title}
      </Tag>

      {lead ? (
        <p
          className={cn(
            "mt-5 text-lg leading-relaxed",
            dark ? "text-ink-200" : "text-ink-700",
          )}
        >
          {lead}
        </p>
      ) : null}
    </div>
  );
}
