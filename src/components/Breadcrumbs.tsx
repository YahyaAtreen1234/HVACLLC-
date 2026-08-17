import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/lib/seo";
import { cn } from "@/lib/utils";

export interface Crumb {
  name: string;
  href: string;
}

/**
 * Breadcrumb trail. Emits BreadcrumbList structured data alongside the visible
 * markup so the same path shows up in search results.
 *
 * The current page is the last crumb: rendered as text with `aria-current`,
 * never as a link back to itself.
 */
export function Breadcrumbs({
  items,
  tone = "light",
  className,
}: {
  /** Ordered trail, excluding Home — it is prepended automatically. */
  items: Crumb[];
  tone?: "light" | "dark";
  className?: string;
}) {
  const trail: Crumb[] = [{ name: "Home", href: "/" }, ...items];
  const dark = tone === "dark";

  return (
    <>
      <nav aria-label="Breadcrumb" className={className}>
        <ol
          className={cn(
            "flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm",
            dark ? "text-ink-300" : "text-ink-600",
          )}
        >
          {trail.map((crumb, index) => {
            const isLast = index === trail.length - 1;
            return (
              <li key={crumb.href} className="flex items-center gap-1.5">
                {index > 0 ? (
                  <Icon
                    name="chevron-down"
                    size={14}
                    className="-rotate-90 opacity-50"
                  />
                ) : null}

                {isLast ? (
                  <span
                    aria-current="page"
                    className={cn(
                      "font-medium",
                      dark ? "text-white" : "text-ink-900",
                    )}
                  >
                    {crumb.name}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className={cn(
                      "rounded transition-colors",
                      dark ? "hover:text-white" : "hover:text-flame-600",
                    )}
                  >
                    {crumb.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <JsonLd data={breadcrumbSchema(trail)} />
    </>
  );
}
