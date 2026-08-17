import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { CtaPair } from "@/components/cta/CtaButtons";
import { getServices } from "@/server/content/read";

/** 404 page. Routes the visitor somewhere useful instead of dead-ending. */
export default function NotFound() {
  return (
    <Container size="narrow">
      <div className="py-24 sm:py-32">
        <p className="eyebrow text-flame-600">Error 404</p>
        <h1 className="mt-4 text-4xl text-ink-950 sm:text-5xl">
          That page is not here
        </h1>
        <p className="mt-4 max-w-lg text-lg leading-relaxed text-ink-700">
          The link may be out of date. Here is where most people are heading —
          or call and we will point you in the right direction.
        </p>

        <CtaPair className="mt-8" />

        <h2 className="mt-14 font-display text-sm font-bold uppercase tracking-wider text-ink-600">
          Popular services
        </h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {getServices().slice(0, 6).map((service) => (
            <li key={service.slug}>
              <Link
                href={`/services/${service.slug}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-ink-900/8 bg-white px-4 py-3 shadow-card transition-shadow hover:shadow-card-hover"
              >
                <span className="flex items-center gap-3">
                  <Icon
                    name={service.icon}
                    size={20}
                    className="text-flame-500"
                  />
                  <span className="font-display font-semibold text-ink-900">
                    {service.name}
                  </span>
                </span>
                <Icon name="arrow-right" size={16} className="text-ink-400" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Container>
  );
}
