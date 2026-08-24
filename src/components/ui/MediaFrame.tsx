import { FadeImage } from "@/components/ui/FadeImage";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";
import type { IconName, SiteImage } from "@/types";

/**
 * Renders a photo through `next/image` (automatic AVIF/WebP, correct sizing,
 * lazy loading) — or, when no photograph has been supplied yet, a clearly
 * marked placeholder that states the shot the page needs.
 *
 * No stock photography is bundled: inventing imagery for a real business is
 * how sites end up with a competitor's van in the hero.
 */
export function MediaFrame({
  image,
  icon = "wind",
  priority = false,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  aspect = "4/3",
  className,
  overlay = false,
}: {
  image: SiteImage;
  /** Icon shown in the placeholder state. */
  icon?: IconName;
  /** Set on the LCP image only (usually the hero). */
  priority?: boolean;
  sizes?: string;
  aspect?: "4/3" | "16/9" | "3/4" | "1/1";
  className?: string;
  /** Adds a navy gradient wash, for images used behind text. */
  overlay?: boolean;
}) {
  const aspectClass =
    aspect === "16/9"
      ? "aspect-video"
      : aspect === "3/4"
        ? "aspect-3/4"
        : aspect === "1/1"
          ? "aspect-square"
          : "aspect-4/3";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-ink-900",
        aspectClass,
        className,
      )}
    >
      {image.src ? (
        <FadeImage
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      ) : (
        <PlaceholderPhoto brief={image.alt} icon={icon} />
      )}

      {overlay ? (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-t from-ink-950/85 via-ink-950/25 to-transparent"
        />
      ) : null}
    </div>
  );
}

/**
 * The stand-in shown until a real photo exists. It deliberately looks like a
 * placeholder — nobody should be able to mistake it for finished artwork.
 */
function PlaceholderPhoto({
  brief,
  icon,
}: {
  brief: string;
  icon: IconName;
}) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-linear-135 from-ink-800 via-ink-900 to-ink-950 p-6 text-center">
      <div
        aria-hidden="true"
        className="absolute inset-0 hairline-grid opacity-60"
      />
      <div className="relative flex size-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-chill-300">
        <Icon name={icon} size={26} />
      </div>
      <div className="relative max-w-xs">
        <p className="eyebrow text-chill-300">Photo placeholder</p>
        <p className="mt-2 text-sm leading-relaxed text-ink-200">{brief}</p>
      </div>
    </div>
  );
}
