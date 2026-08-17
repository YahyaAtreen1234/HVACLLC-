import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { cta } from "@/config/site";
import { phoneDisplay, telHref } from "@/lib/phone";

/**
 * Sticky action bar pinned to the bottom of the viewport on phones.
 *
 * Mobile visitors to a contractor site are disproportionately people whose
 * system just stopped working, so the two actions that matter stay permanently
 * in thumb reach. Hidden from `lg` up, where the header CTA is always visible.
 *
 * The layout adds bottom padding on small screens so the bar never covers the
 * end of a page, and it sits inside the safe area on notched devices.
 */
export function MobileCallBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink-900/10 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden print:hidden">
      <div className="grid grid-cols-2 gap-2 p-2.5">
        <a
          href={telHref}
          data-analytics="phone-call"
          aria-label={`Call ${phoneDisplay}`}
          className="flex min-h-12 items-center justify-center gap-2 rounded-lg bg-ink-900 font-display font-semibold text-white transition-colors hover:bg-ink-800"
        >
          <Icon name="phone" size={19} />
          {cta.secondary}
        </a>
        <Link
          href="/contact"
          className="flex min-h-12 items-center justify-center gap-2 rounded-lg bg-flame-500 font-display font-semibold text-white transition-colors hover:bg-flame-600"
        >
          {cta.primary}
        </Link>
      </div>
    </div>
  );
}
