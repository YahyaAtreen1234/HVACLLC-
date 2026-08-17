import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { LegalDocument } from "@/components/sections/LegalDocument";
import { business } from "@/config/business";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Terms & Conditions",
  description: `The terms that apply to use of the ${business.name} website and to service requests submitted through it.`,
  path: "/terms-conditions",
});

export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Terms & Conditions"
        lead="The terms that apply to this website and to requests submitted through it."
        crumbs={[{ name: "Terms & Conditions", href: "/terms-conditions" }]}
        withCta={false}
      />

      <LegalDocument
        // TODO: update this date whenever the terms change.
        updated="2026-01-01"
        intro={`These terms apply to your use of this website, operated by ${business.legalName}. By using the site you agree to them. Work performed at your property is governed by the written estimate and invoice for that job, not by this page.`}
        sections={[
          {
            heading: "Information on this site",
            paragraphs: [
              "The content here is general information about heating, ventilation and air conditioning. It is not a diagnosis of your specific system, and it is not a substitute for an inspection by a qualified technician.",
              "We try to keep the site accurate and current, but we do not warrant that every detail is complete or error-free.",
            ],
          },
          {
            heading: "Service requests",
            paragraphs: [
              "Submitting a form on this site is a request, not a booking. An appointment exists once we have confirmed it with you directly.",
              "Nothing on this website is an offer of a fixed price. Pricing is provided in a written estimate for your specific job after the system and site conditions have been assessed.",
            ],
          },
          {
            heading: "Estimates and work performed",
            paragraphs: [
              "TODO: state the business's actual terms for estimates, deposits, cancellations, change orders and payment, and make sure they match the paperwork customers sign.",
            ],
          },
          {
            heading: "Warranties",
            paragraphs: [
              "TODO: state the labour warranty the business actually offers, if any, and explain that equipment warranties are provided by the manufacturer and subject to their terms and registration requirements. Do not publish a warranty the business does not honour.",
            ],
          },
          {
            heading: "Emergencies and safety",
            paragraphs: [
              "If you smell gas, leave the building immediately and call your gas utility's emergency line or 911 from outside. Do not use switches, appliances or phones inside the building.",
              "If a carbon monoxide alarm sounds, get everyone outside into fresh air and call 911.",
            ],
          },
          {
            heading: "Intellectual property",
            paragraphs: [
              `The text, layout, graphics and code on this site belong to ${business.legalName} or its licensors and may not be copied or reused without permission.`,
            ],
          },
          {
            heading: "Limitation of liability",
            paragraphs: [
              "To the extent permitted by law, we are not liable for indirect or consequential losses arising from use of this website.",
              "TODO: have an attorney set the limitation and indemnity language appropriate to the state the business operates in.",
            ],
          },
          {
            heading: "Links to other sites",
            paragraphs: [
              "Where this site links to a third party — a manufacturer, a lender, a review platform — we do not control that site and are not responsible for its content or its terms.",
            ],
          },
          {
            heading: "Governing law",
            paragraphs: [
              `TODO: name the governing state, e.g. "These terms are governed by the laws of the State of ${business.address.state}."`,
            ],
          },
          {
            heading: "Contact",
            paragraphs: [
              `Questions about these terms: ${business.email} or ${business.phone.display}.`,
            ],
          },
        ]}
      />
    </>
  );
}
