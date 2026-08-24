import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { business } from "@/config/business";

/**
 * Full-width recruiting strip.
 *
 * Green rather than the brand orange on purpose. Orange is the conversion
 * colour on this site — every "get a quote" and "call now" uses it — and a
 * recruiting message is aimed at a completely different reader. Giving it the
 * same colour would put a job advert in direct competition with the button
 * that earns the business money.
 *
 * The green is the existing `success` token, not a new one. White on it
 * measures 4.92:1, clearing the 4.5:1 needed for normal text.
 *
 * Renders nothing when `business.hiring.active` is false, so switching off
 * recruiting removes it everywhere rather than leaving a strip pointing at a
 * page that says nobody is being hired.
 */
export function HiringBanner() {
  const { hiring } = business;
  if (!hiring.active) return null;

  return (
    <aside
      aria-label="Recruitment"
      className="bg-success-500 text-white"
    >
      <Container size="wide">
        <div className="flex flex-col items-start gap-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="flex items-center gap-4">
            <span
              aria-hidden="true"
              className="hidden shrink-0 rounded-lg bg-white/15 p-2.5 sm:block"
            >
              <Icon name="briefcase" size={24} />
            </span>

            <div>
              <p className="font-display text-lg font-bold tracking-tight">
                {hiring.headline}
              </p>
              {/* White at 90% still clears 4.5:1 against this green. */}
              <p className="mt-0.5 text-sm leading-relaxed text-white/90">
                {hiring.note}
              </p>
            </div>
          </div>

          <Link
            href="/careers"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border-2 border-white/70 px-5 py-2.5 font-display text-sm font-semibold tracking-wide uppercase transition-[background-color,border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-white hover:bg-white/15 active:translate-y-0 active:scale-[0.97] motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100 max-sm:w-full max-sm:justify-center"
          >
            {hiring.ctaLabel}
            <Icon name="arrow-right" size={16} />
          </Link>
        </div>
      </Container>
    </aside>
  );
}
