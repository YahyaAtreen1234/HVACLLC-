import type { Metadata } from "next";
import { business } from "@/config/business";
import { site } from "@/config/site";
import { getSchemaOpeningHours } from "./hours";
import { getServiceAreas, getServices } from "@/server/content/read";

interface PageMetaInput {
  title: string;
  description: string;
  /** Path with leading slash, e.g. "/services/ac-repair". */
  path: string;
  /** Set false for thin/duplicate pages that should stay out of the index. */
  index?: boolean;
}

/** Builds consistent per-page metadata (canonical URL, OG and Twitter cards). */
export function pageMetadata({
  title,
  description,
  path,
  index = true,
}: PageMetaInput): Metadata {
  const url = `${site.url}${path === "/" ? "" : path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: index ? undefined : { index: false, follow: true },
    openGraph: {
      title: `${title} | ${business.name}`,
      description,
      url,
      siteName: business.name,
      locale: site.locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${business.name}`,
      description,
    },
  };
}

const postalAddress = {
  "@type": "PostalAddress",
  streetAddress: business.address.showAddress
    ? [business.address.street, business.address.suite]
        .filter(Boolean)
        .join(", ")
    : undefined,
  addressLocality: business.address.city,
  addressRegion: business.address.state,
  postalCode: business.address.postalCode,
  addressCountry: business.address.country,
};

/**
 * LocalBusiness / HVACBusiness structured data.
 * Only facts present in the config are emitted — no ratings, awards or
 * certifications are fabricated, and `aggregateRating` is deliberately absent
 * until there are real reviews to aggregate.
 */
export async function localBusinessSchema() {
  const sameAs = Object.values(business.social).filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "HVACBusiness",
    "@id": `${site.url}/#business`,
    name: business.name,
    legalName: business.legalName,
    description: business.description,
    url: site.url,
    telephone: business.phone.e164,
    email: business.email,
    address: postalAddress,
    openingHoursSpecification: getSchemaOpeningHours(),
    areaServed: (await getServiceAreas()).map((area) => ({
      "@type": "City",
      name: `${area.city}, ${area.state}`,
    })),
    ...(sameAs.length ? { sameAs } : {}),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "HVAC Services",
      itemListElement: (await getServices()).map((service) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: service.name },
      })),
    },
  };
}

export function breadcrumbSchema(items: Array<{ name: string; href: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${site.url}${item.href === "/" ? "" : item.href}`,
    })),
  };
}

export function faqSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

export async function serviceSchema(input: {
  name: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: input.name,
    description: input.description,
    serviceType: input.name,
    url: `${site.url}${input.path}`,
    provider: { "@id": `${site.url}/#business` },
    areaServed: (await getServiceAreas()).map((area) => ({
      "@type": "City",
      name: `${area.city}, ${area.state}`,
    })),
  };
}
