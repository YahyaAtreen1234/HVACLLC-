import { Container, Section } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { TrustBadgeRow } from "@/components/cards/TrustBadge";
import { differentiators } from "@/data/trust";

/**
 * "Why us" section. Every claim here is about method — how the work is done —
 * rather than credentials, because credentials are rendered separately from
 * verified data in the business config.
 */
export function WhyUs() {
  return (
    <Section>
      <Container>
        <div className="grid items-start gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div className="lg:sticky lg:top-32">
            <SectionHeading
              eyebrow="Why homeowners call us back"
              title="Measured, explained, then fixed"
              lead="Guesswork is what makes HVAC expensive. Every visit starts with readings, and you see them before you approve anything."
            />
            <MediaFrame
              image={{
                src: "",
                alt: "Technician writing measured system readings on a service report at a customer's home",
                width: 1000,
                height: 750,
              }}
              icon="wrench"
              aspect="4/3"
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="mt-8"
            />
          </div>

          <div>
            <ul className="grid gap-6 sm:grid-cols-2">
              {differentiators.map((item, index) => (
                <Reveal as="li" key={item.title} delay={index * 70}>
                  <div className="h-full rounded-2xl border border-ink-900/8 bg-white p-6 shadow-card">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-ink-950 text-chill-300">
                      <Icon name={item.icon} size={22} />
                    </span>
                    <h3 className="mt-4 text-lg text-ink-950">{item.title}</h3>
                    <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-700">
                      {item.body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </ul>

            {/* Renders only when real credentials exist in the config. */}
            <TrustBadgeRow className="mt-6 lg:grid-cols-2" />
          </div>
        </div>
      </Container>
    </Section>
  );
}
