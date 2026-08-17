import { Icon } from "@/components/ui/Icon";
import { getTrustBadges } from "@/data/trust";
import { cn } from "@/lib/utils";
import type { TrustBadgeItem } from "@/types";

export function TrustBadge({
  badge,
  tone = "light",
  className,
}: {
  badge: TrustBadgeItem;
  tone?: "light" | "dark";
  className?: string;
}) {
  const dark = tone === "dark";

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border px-4 py-3",
        dark
          ? "border-white/12 bg-white/5 text-white"
          : "border-ink-900/8 bg-white text-ink-950 shadow-card",
        className,
      )}
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg",
          dark ? "bg-chill-500/15 text-chill-300" : "bg-flame-50 text-flame-600",
        )}
      >
        <Icon name={badge.icon} size={18} />
      </span>
      <div className="min-w-0">
        <p className="font-display text-sm font-bold leading-tight">
          {badge.label}
        </p>
        <p
          className={cn(
            "mt-0.5 truncate text-xs",
            dark ? "text-ink-300" : "text-ink-600",
          )}
        >
          {badge.detail}
        </p>
      </div>
    </div>
  );
}

/**
 * Row of trust badges. Because badges are derived from the business config,
 * this renders nothing at all when no verifiable credential has been entered —
 * an empty strip is better than an invented one.
 */
export function TrustBadgeRow({
  tone = "light",
  limit,
  className,
}: {
  tone?: "light" | "dark";
  limit?: number;
  className?: string;
}) {
  const badges = getTrustBadges();
  if (!badges.length) return null;

  const shown = limit ? badges.slice(0, limit) : badges;

  return (
    <ul
      className={cn(
        "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4",
        className,
      )}
    >
      {shown.map((badge) => (
        <li key={badge.label}>
          <TrustBadge badge={badge} tone={tone} />
        </li>
      ))}
    </ul>
  );
}
