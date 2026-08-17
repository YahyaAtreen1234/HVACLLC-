import { Container } from "@/components/ui/Container";
import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { CtaPair } from "@/components/cta/CtaButtons";

/**
 * Shared header band for inner pages: breadcrumbs, H1 and an optional CTA pair.
 * Using one component keeps every page's heading rhythm and spacing identical.
 */
export function PageHero({
  eyebrow,
  title,
  lead,
  crumbs,
  withCta = true,
  children,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  crumbs: Crumb[];
  withCta?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <section className="on-dark relative overflow-hidden bg-ink-950 text-white">
      <div aria-hidden="true" className="absolute inset-0 hairline-grid opacity-60" />
      <div
        aria-hidden="true"
        className="absolute -top-32 -left-24 size-[30rem] rounded-full bg-flame-500/12 blur-3xl"
      />

      <Container className="relative">
        <div className="py-10 sm:py-14 lg:py-16">
          <Breadcrumbs items={crumbs} tone="dark" />

          <div className="mt-6 max-w-3xl">
            {eyebrow ? (
              <p className="eyebrow flex items-center gap-3 text-chill-300">
                <span aria-hidden="true" className="h-px w-8 bg-chill-300/60" />
                {eyebrow}
              </p>
            ) : null}

            <h1 className="mt-4 text-4xl leading-[1.05] text-balance sm:text-5xl">
              {title}
            </h1>

            {lead ? (
              <p className="mt-5 text-lg leading-relaxed text-ink-200">{lead}</p>
            ) : null}
          </div>

          {children}

          {withCta ? <CtaPair tone="dark" className="mt-8" /> : null}
        </div>
      </Container>
    </section>
  );
}
