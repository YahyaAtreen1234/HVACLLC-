import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import type { IconName } from "@/types";
import { business } from "@/config/business";

type Pillar = {
  icon: IconName;
  title: string;
  note: string;
};

/**
 * The four-up reassurance strip that sits directly under the hero.
 *
 * Each item is gated on something real in the business config rather than
 * hard-coded. "Licensed & Insured" only appears once a licence number exists,
 * and the emergency item follows the same 24/7 rule as the rest of the site —
 * a strip like this is exactly where unearned claims tend to creep in.
 */
function pillars(): Pillar[] {
  const items: Pillar[] = [];
  const { credentials, emergency } = business;

  if (credentials.licenseNumber || credentials.insured) {
    items.push({
      icon: "shield",
      title: "Licensed & Insured",
      note: "Your safety is our priority",
    });
  }

  items.push({
    icon: "check",
    title: "Expert Technicians",
    note: "Trained on every major brand",
  });

  if (emergency.offered) {
    items.push({
      icon: "clock",
      title: emergency.available247 ? "24/7 Service" : "Emergency Service",
      note: emergency.available247
        ? "We are here when you need us"
        : "Call the main line for urgent work",
    });
  }

  items.push({
    icon: "star",
    title: "Satisfaction Guaranteed",
    note: "Quality work, every time",
  });

  return items;
}

export function TrustStrip() {
  const items = pillars();
  if (!items.length) return null;

  return (
    <section className="border-b border-ink-900/8 bg-white">
      <Container size="wide">
        <ul className="grid divide-y divide-ink-900/8 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
          {items.map((item) => (
            <li
              key={item.title}
              className="flex items-center gap-4 px-1 py-6 lg:px-7"
            >
              <span
                aria-hidden="true"
                className="grid size-11 shrink-0 place-items-center rounded-full bg-flame-50 text-flame-600 ring-1 ring-flame-500/20"
              >
                <Icon name={item.icon} size={21} />
              </span>
              <span>
                <span className="block font-display text-sm font-bold tracking-wide text-ink-950 uppercase">
                  {item.title}
                </span>
                <span className="mt-0.5 block text-sm text-ink-600">
                  {item.note}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
