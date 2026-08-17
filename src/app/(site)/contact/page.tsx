import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { Container, Section } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { ContactForm } from "@/components/forms/ContactForm";
import { EmergencyCta } from "@/components/cta/EmergencyCta";
import { FaqSection } from "@/components/sections/FaqSection";
import { MapEmbed } from "@/components/MapEmbed";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SocialLinks, getSocialProfiles } from "@/components/SocialLinks";
import { business } from "@/config/business";
import { getHoursRows } from "@/lib/hours";
import { phoneDisplay, telHref } from "@/lib/phone";
import { getFaqsByTopic, getServices } from "@/server/content/read";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact & Request Service",
  description: `Request HVAC service from ${business.name}. Call ${business.phone.display} or send the form and we will call you back to confirm a time.`,
  path: "/contact",
});

export default function ContactPage() {
  const hours = getHoursRows();
  const addressLine = [business.address.street, business.address.suite]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Request service"
        lead="Fill in the form and we will call to confirm a time. If it is urgent, calling is faster."
        crumbs={[{ name: "Contact", href: "/contact" }]}
        withCta={false}
      />

      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            {/* Contact details */}
            <div className="lg:sticky lg:top-32 lg:self-start">
              <h2 className="text-2xl text-ink-950">Reach the office</h2>

              <ul className="mt-6 space-y-5">
                <li>
                  <a
                    href={telHref}
                    data-analytics="phone-call"
                    className="group flex items-start gap-4 rounded-xl border border-ink-900/8 bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover"
                  >
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-flame-50 text-flame-600">
                      <Icon name="phone" size={22} />
                    </span>
                    <span>
                      <span className="eyebrow block text-ink-500">Phone</span>
                      <span className="mt-1 block font-display text-xl font-bold text-ink-950 group-hover:text-flame-600">
                        {phoneDisplay}
                      </span>
                    </span>
                  </a>
                </li>

                <li>
                  <a
                    href={`mailto:${business.email}`}
                    className="group flex items-start gap-4 rounded-xl border border-ink-900/8 bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover"
                  >
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-chill-100 text-chill-600">
                      <Icon name="mail" size={22} />
                    </span>
                    <span className="min-w-0">
                      <span className="eyebrow block text-ink-500">Email</span>
                      <span className="mt-1 block truncate font-display text-lg font-bold text-ink-950 group-hover:text-flame-600">
                        {business.email}
                      </span>
                    </span>
                  </a>
                </li>

                {business.address.showAddress ? (
                  <li className="flex items-start gap-4 rounded-xl border border-ink-900/8 bg-white p-5 shadow-card">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-ink-50 text-ink-700">
                      <Icon name="map-pin" size={22} />
                    </span>
                    <span>
                      <span className="eyebrow block text-ink-500">Office</span>
                      <address className="mt-1 not-italic leading-relaxed text-ink-800">
                        {addressLine}
                        <br />
                        {business.address.city}, {business.address.state}{" "}
                        {business.address.postalCode}
                      </address>
                      {business.address.mapUrl ? (
                        <a
                          href={business.address.mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1.5 font-display text-sm font-semibold text-flame-600 hover:text-flame-700"
                        >
                          Get directions
                          <Icon name="arrow-right" size={15} />
                        </a>
                      ) : null}
                    </span>
                  </li>
                ) : null}
              </ul>

              <h2 className="mt-10 text-2xl text-ink-950">Hours</h2>
              <dl className="mt-5 divide-y divide-ink-900/8 overflow-hidden rounded-xl border border-ink-900/8 bg-white shadow-card">
                {hours.map((row) => (
                  <div
                    key={row.day}
                    className="flex items-center justify-between gap-4 px-5 py-3 text-[0.95rem]"
                  >
                    <dt className="text-ink-700">{row.label}</dt>
                    <dd
                      className={
                        row.isClosed
                          ? "text-ink-500"
                          : "font-display font-semibold text-ink-950"
                      }
                    >
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>

              {getSocialProfiles().length ? (
                <>
                  <h2 className="mt-10 text-2xl text-ink-950">Follow us</h2>
                  <SocialLinks tone="light" className="mt-5" />
                </>
              ) : null}

              <EmergencyCta variant="inline" className="mt-8" />
            </div>

            {/* Form */}
            <div>
              <h2 className="sr-only">Service request form</h2>

              {/*
                Sets expectations before the form, not after it — the question
                "when will I hear back?" is the one stopping people submitting.
              */}
              <p className="mb-5 flex items-start gap-2.5 rounded-xl border border-success-500/20 bg-success-50 px-4 py-3 text-[0.9375rem] leading-relaxed text-success-700">
                <Icon name="clock" size={18} className="mt-0.5 shrink-0" />
                {business.responseTime}
              </p>

              <ContactForm services={getServices()} />
            </div>
          </div>
        </Container>
      </Section>

      {business.address.showAddress ? (
        <Section tone="muted" spacing="tight">
          <Container>
            <SectionHeading
              eyebrow="Find us"
              title="Where we are based"
              lead="Most work happens at your address — but if you need to drop by, here is where to come."
            />
            <MapEmbed className="mt-10" />
          </Container>
        </Section>
      ) : null}

      <FaqSection faqs={getFaqsByTopic("general")} />
    </>
  );
}
