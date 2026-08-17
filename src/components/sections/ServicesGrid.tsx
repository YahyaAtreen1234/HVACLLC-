import { Container, Section } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ServiceCard } from "@/components/cards/ServiceCard";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import type { Service } from "@/types";

/** Responsive grid of service cards, used on the home page and services index. */
export function ServicesGrid({
  services,
  eyebrow = "What we do",
  title = "HVAC work, start to finish",
  lead,
  showAllLink = false,
  tone = "light",
}: {
  services: Service[];
  eyebrow?: string;
  title?: string;
  lead?: string;
  showAllLink?: boolean;
  tone?: "light" | "muted";
}) {
  return (
    <Section tone={tone} id="services">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow={eyebrow} title={title} lead={lead} />
          {showAllLink ? (
            <Button href="/services" variant="ghost" iconRight="arrow-right">
              All services
            </Button>
          ) : null}
        </div>

        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <Reveal as="li" key={service.slug} delay={index * 60}>
              <ServiceCard service={service} />
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
