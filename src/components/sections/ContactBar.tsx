import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { business } from "@/config/business";
import { getWeekdaySummary } from "@/lib/hours";

/**
 * The navy detail bar: where we are, how to reach us, when we answer.
 *
 * Every item is conditional. A service-area business with no public street
 * address shows its city instead, and the email item disappears rather than
 * printing the placeholder inbox — an unmonitored address on a contact bar is
 * worse than none at all.
 */
export function ContactBar() {
  const { address, phone, email } = business;
  const hasRealEmail = Boolean(email) && !email.endsWith("@example.com");

  const location = address.showAddress && address.street
    ? `${address.street}, ${address.city}, ${address.state}`
    : `${address.city}, ${address.state}`;

  return (
    <section className="on-dark bg-ink-950 text-white">
      <Container size="wide">
        <ul className="grid gap-x-8 gap-y-5 py-6 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <li className="flex items-center gap-3">
            <Icon
              name="map-pin"
              size={18}
              className="shrink-0 text-flame-400"
            />
            <span className="text-ink-100">{location}</span>
          </li>

          <li className="flex items-center gap-3">
            <Icon name="phone" size={18} className="shrink-0 text-flame-400" />
            <a
              href={`tel:${phone.e164}`}
              className="text-ink-100 transition-colors hover:text-white"
            >
              {phone.display}
            </a>
          </li>

          {hasRealEmail ? (
            <li className="flex items-center gap-3">
              <Icon name="mail" size={18} className="shrink-0 text-flame-400" />
              <a
                href={`mailto:${email}`}
                className="truncate text-ink-100 transition-colors hover:text-white"
              >
                {email}
              </a>
            </li>
          ) : null}

          <li className="flex items-center gap-3">
            <Icon name="clock" size={18} className="shrink-0 text-flame-400" />
            <span className="text-ink-100">{getWeekdaySummary()}</span>
          </li>
        </ul>
      </Container>
    </section>
  );
}
