import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import type { Service } from "@/types";

/**
 * Service card used on the home page and the services index.
 *
 * The whole card is clickable via a stretched link on the heading, so there is
 * one link per card for assistive tech and one big target for thumbs.
 */
export function ServiceCard({
  service,
  className,
}: {
  service: Service;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col rounded-2xl border border-ink-900/8 bg-white p-6 shadow-card",
        "transition-[transform,box-shadow,border-color] duration-300 ease-out",
        "hover:-translate-y-1 hover:border-flame-500/30 hover:shadow-card-hover",
        "motion-reduce:hover:translate-y-0",
        "focus-within:border-flame-500/40",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "flex size-12 items-center justify-center rounded-xl transition-[colors,transform] duration-300 ease-out",
          "group-hover:scale-110 motion-reduce:group-hover:scale-100",
          service.category === "heating"
            ? "bg-flame-50 text-flame-600 group-hover:bg-flame-700 group-hover:text-white"
            : "bg-chill-100 text-chill-600 group-hover:bg-chill-500 group-hover:text-white",
        )}
      >
        <Icon name={service.icon} size={24} />
      </span>

      <h3 className="mt-5 text-xl text-ink-950">
        <Link
          href={`/services/${service.slug}`}
          className="after:absolute after:inset-0 after:content-['']"
        >
          {service.name}
        </Link>
      </h3>

      <p className="mt-2.5 grow text-[0.95rem] leading-relaxed text-ink-700">
        {service.summary}
      </p>

      <span className="mt-5 inline-flex items-center gap-2 font-display text-sm font-semibold text-flame-600">
        Learn more
        <Icon
          name="arrow-right"
          size={16}
          className="transition-transform duration-300 group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0"
        />
      </span>
    </article>
  );
}
