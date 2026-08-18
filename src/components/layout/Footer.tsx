import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "./Logo";
import { business } from "@/config/business";
import { legalNav, companyNav } from "@/config/navigation";
import { getServices, getServiceAreas } from "@/server/content/read";
import { getHoursRows } from "@/lib/hours";
import { phoneDisplay, telHref } from "@/lib/phone";
import { SocialLinks } from "@/components/SocialLinks";

export function Footer() {
  const hours = getHoursRows();

  const addressLine = [
    business.address.street,
    business.address.suite,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <footer className="on-dark bg-ink-950 text-ink-300">
      <Container size="wide">
        <div className="grid gap-12 py-14 sm:py-16 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:gap-10">
          {/* Identity */}
          <div>
            <Logo tone="dark" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed">
              {business.description}
            </p>

            <SocialLinks tone="dark" className="mt-6" />
          </div>

          {/* Services */}
          <nav aria-labelledby="footer-services">
            <h2 id="footer-services" className="font-display text-sm font-bold uppercase tracking-wider text-white">
              Services
            </h2>
            <ul className="mt-5 space-y-2.5 text-sm">
              {getServices().map((service) => (
                <li key={service.slug}>
                  <Link
                    href={`/services/${service.slug}`}
                    className="transition-colors hover:text-white"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Service areas + site links */}
          <nav aria-labelledby="footer-areas">
            <h2 id="footer-areas" className="font-display text-sm font-bold uppercase tracking-wider text-white">
              Service Areas
            </h2>
            <ul className="mt-5 space-y-2.5 text-sm">
              {getServiceAreas().map((area) => (
                <li key={area.slug}>
                  <Link
                    href={`/service-areas/${area.slug}`}
                    className="transition-colors hover:text-white"
                  >
                    {area.city}, {area.state}
                  </Link>
                </li>
              ))}
            </ul>

            <h2 className="mt-8 font-display text-sm font-bold uppercase tracking-wider text-white">
              Company
            </h2>
            <ul className="mt-5 space-y-2.5 text-sm">
              {[{ label: "About", href: "/about" }, ...companyNav].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="transition-colors hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact + hours */}
          <div>
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-white">
              Contact
            </h2>

            <ul className="mt-5 space-y-3.5 text-sm">
              <li>
                <a
                  href={telHref}
                  data-analytics="phone-call"
                  className="flex items-start gap-3 transition-colors hover:text-white"
                >
                  <Icon name="phone" size={18} className="mt-0.5 text-chill-400" />
                  <span className="font-display text-base font-bold text-white">
                    {phoneDisplay}
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${business.email}`}
                  className="flex items-start gap-3 transition-colors hover:text-white"
                >
                  <Icon name="mail" size={18} className="mt-0.5 text-chill-400" />
                  {business.email}
                </a>
              </li>
              {business.address.showAddress ? (
                <li className="flex items-start gap-3">
                  <Icon name="map-pin" size={18} className="mt-0.5 text-chill-400" />
                  <address className="not-italic">
                    {addressLine}
                    <br />
                    {business.address.city}, {business.address.state}{" "}
                    {business.address.postalCode}
                  </address>
                </li>
              ) : null}
            </ul>

            <h2 className="mt-8 font-display text-sm font-bold uppercase tracking-wider text-white">
              Hours
            </h2>
            <dl className="mt-5 space-y-1.5 text-sm">
              {hours.map((row) => (
                <div key={row.day} className="flex justify-between gap-4">
                  <dt>{row.label}</dt>
                  <dd className={row.isClosed ? "text-ink-500" : "text-ink-100"}>
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Legal strip */}
        <div className="flex flex-col gap-4 border-t border-white/10 py-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {business.legalName}. All rights
            reserved.
          </p>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {legalNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition-colors hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              {/* Static XML file, not a route — plain anchor rather than Link. */}
              <a href="/sitemap.xml" className="transition-colors hover:text-white">
                Sitemap
              </a>
            </li>
          </ul>
        </div>
      </Container>
    </footer>
  );
}
