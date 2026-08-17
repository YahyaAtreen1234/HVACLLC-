import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { LegalDocument } from "@/components/sections/LegalDocument";
import { business } from "@/config/business";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description: `How ${business.name} collects, uses and protects the information you provide through this website.`,
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        lead="What we collect when you contact us, why we collect it, and what we do not do with it."
        crumbs={[{ name: "Privacy Policy", href: "/privacy-policy" }]}
        withCta={false}
      />

      <LegalDocument
        // TODO: update this date whenever the policy changes.
        updated="2026-01-01"
        intro={`This policy explains how ${business.legalName} ("we", "us") handles information collected through this website. If you have a question about it, email ${business.email} or call ${business.phone.display}.`}
        sections={[
          {
            heading: "Information you give us",
            paragraphs: [
              "When you submit a service request or contact form, we collect the details you enter so we can respond and schedule work.",
            ],
            bullets: [
              "Your name",
              "Your phone number",
              "Your email address, if you provide one",
              "Your ZIP code and, when you supply it, your service address",
              "What you tell us about your heating or cooling system",
            ],
          },
          {
            heading: "How we use it",
            paragraphs: [
              "We use your information to contact you about your request, schedule and perform the work, provide estimates and invoices, and keep records of service performed on your equipment.",
              "We may contact you by phone, text message or email about a request you submitted. Standard message and data rates may apply to text messages.",
              // TODO: if you send marketing email or SMS, describe it here and add a working opt-out.
              "TODO: if the business sends marketing messages, describe them here along with how to opt out.",
            ],
          },
          {
            heading: "What we do not do",
            paragraphs: [
              "We do not sell your personal information. We do not share it with third parties for their own marketing.",
            ],
          },
          {
            heading: "Service providers",
            paragraphs: [
              "We use third-party services to run the website and the business — for example website hosting, scheduling or CRM software, and payment processing. These providers may process your information on our behalf, only as needed to provide their service.",
              "TODO: list the actual providers in use (hosting, analytics, CRM, payment processor, call tracking) and link to their privacy policies.",
            ],
          },
          {
            heading: "Analytics and cookies",
            paragraphs: [
              "TODO: describe the analytics or advertising tools this site uses, what they store, and how visitors can opt out. If no analytics or tracking cookies are installed, state that plainly instead — this site ships with none.",
            ],
          },
          {
            heading: "Data retention",
            paragraphs: [
              "We keep service records for as long as needed to service your equipment, honour warranties and meet legal, tax and insurance obligations.",
              "TODO: confirm the retention period the business actually applies.",
            ],
          },
          {
            heading: "Your choices",
            paragraphs: [
              `You can ask us what information we hold about you, ask us to correct it, or ask us to delete it where we are not required to keep it. Contact ${business.email} or call ${business.phone.display}.`,
              "TODO: add any state-specific rights that apply (for example the California Consumer Privacy Act), based on where the business operates and who its customers are.",
            ],
          },
          {
            heading: "Children",
            paragraphs: [
              "This website is not directed at children, and we do not knowingly collect information from children under 13.",
            ],
          },
          {
            heading: "Changes to this policy",
            paragraphs: [
              "If this policy changes, the updated version will be posted on this page with a new date at the top.",
            ],
          },
        ]}
      />
    </>
  );
}
