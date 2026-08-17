"use client";

import { useId, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import type { Faq } from "@/types";

/**
 * Accessible FAQ accordion.
 *
 * Each question is a real <button> with `aria-expanded` and `aria-controls`,
 * and the answer panel keeps its content in the DOM (hidden) so it stays
 * available to search engines and to in-page find. Arrow keys move between
 * questions, matching the WAI-ARIA accordion pattern.
 */
export function FaqAccordion({
  faqs,
  /** Index of the item open on first render, or null for all closed. */
  defaultOpen = 0,
  /** When false, opening one item closes the others. */
  allowMultiple = false,
  className,
}: {
  faqs: Faq[];
  defaultOpen?: number | null;
  allowMultiple?: boolean;
  className?: string;
}) {
  const baseId = useId();
  const [open, setOpen] = useState<number[]>(
    defaultOpen === null ? [] : [defaultOpen],
  );

  function toggle(index: number) {
    setOpen((current) => {
      const isOpen = current.includes(index);
      if (allowMultiple) {
        return isOpen
          ? current.filter((i) => i !== index)
          : [...current, index];
      }
      return isOpen ? [] : [index];
    });
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    const keys: Record<string, number> = {
      ArrowDown: (index + 1) % faqs.length,
      ArrowUp: (index - 1 + faqs.length) % faqs.length,
      Home: 0,
      End: faqs.length - 1,
    };
    const next = keys[event.key];
    if (next === undefined) return;
    event.preventDefault();
    document.getElementById(`${baseId}-trigger-${next}`)?.focus();
  }

  if (!faqs.length) return null;

  return (
    <div className={cn("divide-y divide-ink-900/10 border-y border-ink-900/10", className)}>
      {faqs.map((faq, index) => {
        const isOpen = open.includes(index);
        const triggerId = `${baseId}-trigger-${index}`;
        const panelId = `${baseId}-panel-${index}`;

        return (
          <div key={faq.question}>
            <h3>
              <button
                type="button"
                id={triggerId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(index)}
                onKeyDown={(event) => onKeyDown(event, index)}
                className={cn(
                  "flex w-full items-start justify-between gap-6 py-5 text-left transition-colors",
                  "hover:text-flame-600",
                  isOpen ? "text-flame-700" : "text-ink-950",
                )}
              >
                <span className="font-display text-lg font-semibold leading-snug">
                  {faq.question}
                </span>
                <span
                  className={cn(
                    "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border transition-transform duration-300",
                    isOpen
                      ? "rotate-180 border-flame-500/30 bg-flame-50 text-flame-600"
                      : "border-ink-900/12 text-ink-600",
                  )}
                >
                  <Icon name="chevron-down" size={18} />
                </span>
              </button>
            </h3>

            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              hidden={!isOpen}
              className="pb-6 pr-12"
            >
              <p className="text-[0.95rem] leading-relaxed text-ink-700">
                {faq.answer}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
