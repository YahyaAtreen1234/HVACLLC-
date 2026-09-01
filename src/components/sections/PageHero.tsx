import Image from "next/image";

import { Container } from "@/components/ui/Container";
import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { CtaPair } from "@/components/cta/CtaButtons";

/**
 * Shared header band for inner pages: breadcrumbs, H1 and an optional CTA pair.
 * Using one component keeps every page's heading rhythm and spacing identical.
 *
 * ## Background photographs
 *
 * Pass `image` to put a photograph behind the band:
 *
 *     <PageHero image="/images/areas/phoenix-street.jpg" ... />
 *
 * It is layered under a navy scrim heavy enough to hold white text at the
 * contrast the rest of the site meets, so the heading stays readable over a
 * bright sky or a pale wall. That does mean the photograph reads as texture
 * rather than as a subject — which is what a header band wants, and why a busy
 * image with its own text or logos in it works badly here. A wide, simple
 * scene with room to be darkened is the shot to use.
 */
export function PageHero({
  eyebrow,
  title,
  lead,
  crumbs,
  image,
  imageAlt,
  withCta = true,
  children,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  crumbs: Crumb[];
  /** Path under /public. Omit for the plain navy band. */
  image?: string;
  /**
   * Left empty by default: a decorative backdrop behind a heading that already
   * states the page's subject has nothing to add for a screen reader, and
   * describing it would only repeat the H1.
   */
  imageAlt?: string;
  withCta?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <section className="on-dark relative overflow-hidden bg-ink-950 text-white">
      {image ? (
        <>
          <Image
            src={image}
            alt={imageAlt ?? ""}
            fill
            // Full-bleed at every breakpoint, so the browser is told to fetch
            // a viewport-width file rather than guessing at the layout default.
            sizes="100vw"
            priority
            className="object-cover"
          />
          {/*
            Two layers rather than one flat wash: a near-solid navy on the left
            where the text sits, easing off to the right so the photograph is
            still visible, plus a light overall darkening to catch anything
            bright at the edges. A single uniform overlay heavy enough for the
            text would flatten the whole image to mud.
          */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-linear-to-r from-ink-950 via-ink-950/90 to-ink-950/70"
          />
          <div aria-hidden="true" className="absolute inset-0 bg-ink-950/40" />
        </>
      ) : null}

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
