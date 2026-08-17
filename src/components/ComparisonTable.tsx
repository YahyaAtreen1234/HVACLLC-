import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import type { ComparisonRow } from "@/types";

/**
 * Two-option comparison table.
 *
 * A real <table> with scoped headers, so screen readers announce "System age,
 * Lean toward repair, under about 10 years" rather than reading loose text.
 *
 * On narrow screens the table scrolls inside its own container rather than
 * squashing or forcing the page sideways. The container is focusable with
 * `tabIndex={0}` so it can be scrolled from the keyboard, which is required
 * whenever a scrollable region holds content.
 */
export function ComparisonTable({
  rows,
  caption,
  optionALabel,
  optionBLabel,
  criterionLabel = "What to look at",
  className,
}: {
  rows: ComparisonRow[];
  /** Describes the table for assistive tech; visually hidden. */
  caption: string;
  optionALabel: string;
  optionBLabel: string;
  criterionLabel?: string;
  className?: string;
}) {
  if (!rows.length) return null;

  return (
    <div
      tabIndex={0}
      role="region"
      aria-label={caption}
      className={cn(
        "overflow-x-auto rounded-2xl border border-ink-900/8 bg-white shadow-card",
        className,
      )}
    >
      <table className="w-full min-w-[46rem] border-collapse text-left">
        <caption className="sr-only">{caption}</caption>

        <thead>
          <tr className="border-b border-ink-900/10">
            <th
              scope="col"
              className="px-5 py-4 font-display text-sm font-bold uppercase tracking-wider text-ink-600"
            >
              {criterionLabel}
            </th>
            <th
              scope="col"
              className="border-l border-ink-900/8 bg-chill-100/40 px-5 py-4"
            >
              <span className="flex items-center gap-2 font-display text-base font-bold text-ink-950">
                <Icon name="wrench" size={18} className="text-chill-600" />
                {optionALabel}
              </span>
            </th>
            <th
              scope="col"
              className="border-l border-ink-900/8 bg-flame-50 px-5 py-4"
            >
              <span className="flex items-center gap-2 font-display text-base font-bold text-ink-950">
                <Icon name="heat-pump" size={18} className="text-flame-600" />
                {optionBLabel}
              </span>
            </th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr
              key={row.criterion}
              className="border-b border-ink-900/8 last:border-b-0 even:bg-sand-50/60"
            >
              <th
                scope="row"
                className="px-5 py-4 font-display text-[0.9375rem] font-semibold text-ink-900"
              >
                {row.criterion}
              </th>
              <td className="border-l border-ink-900/8 px-5 py-4 text-[0.9375rem] leading-relaxed text-ink-700">
                {row.optionA}
              </td>
              <td className="border-l border-ink-900/8 px-5 py-4 text-[0.9375rem] leading-relaxed text-ink-700">
                {row.optionB}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
