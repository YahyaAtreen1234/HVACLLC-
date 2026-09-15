import { Container, Section } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { Avatar } from "@/components/ui/Avatar";
import { BuildNote } from "@/components/ui/BuildNote";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import {
  getServiceAreas,
  getTeam,
  getTeamIsPlaceholder,
} from "@/server/content/read";

/**
 * Team cards.
 *
 * Putting faces on the site is one of the highest-value trust signals for a
 * contractor — people are deciding whether to let a stranger into their home.
 * Which is exactly why the names have to be real: the development-only notice
 * stays up until the placeholders are replaced.
 */
export async function TeamSection({
  tone = "muted",
}: {
  tone?: "light" | "muted";
}) {
  const everyone = await getTeam();

  /*
   * Placeholder people never reach a customer.
   *
   * This section exists to answer "who is coming into my house", so a card
   * reading "Add owner's name" does not merely look unfinished — it answers
   * that question badly, and a visitor deciding whether to trust a contractor
   * with their address reads it as a site nobody maintains. Absent beats
   * unfinished here in a way it would not on, say, a list of services.
   *
   * Filtering rather than an all-or-nothing switch means the section appears
   * the moment the first real person is added, showing only them, and grows as
   * the rest are filled in. Nothing to remember to turn on.
   *
   * In development everyone is shown, along with the notice below, so the work
   * left to do stays visible to whoever is building the site.
   */
  const team = process.env.NODE_ENV === "production"
    ? everyone.filter((member) => !member.isPlaceholder)
    : everyone;

  if (!team.length) return null;

  // Named from the service areas rather than written in, so the sentence
  // follows whatever towns are set in the admin panel instead of going stale
  // the first time coverage changes. Only confirmed areas count — listing a
  // town the office does not drive to would be a claim, not a description.
  const confirmed = (await getServiceAreas()).filter(
    (area) => !area.isPlaceholder,
  );

  const where =
    confirmed.length === 0
      ? null
      : confirmed.length === 1
        ? confirmed[0].city
        : `${confirmed
            .slice(0, -1)
            .map((area) => area.city)
            .join(", ")} and ${confirmed[confirmed.length - 1].city}`;

  return (
    <Section tone={tone} id="team">
      <Container>
        <SectionHeading
          eyebrow="Our team"
          title="Meet our team"
          lead={
            where
              ? `Get to know the people who keep ${where} comfortable year-round — small enough that you will recognise whoever turns up at your door.`
              : "Small enough that you will recognise the person on your doorstep, and that they will remember your system next time."
          }
        />

        {await getTeamIsPlaceholder() ? (
          <BuildNote title="Placeholder team members" className="mt-8">
            The names and bios below are stand-ins. Replace them in{" "}
            <code>src/data/team.ts</code> and add real photos to{" "}
            <code>/public/images/team/</code> — publishing invented staff on a
            page whose whole job is trust defeats the point of the page.
          </BuildNote>
        ) : null}

        <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((member, index) => (
            // Keyed by position rather than role: two technicians sharing a
            // job title would otherwise collide, and React would treat them as
            // the same card.
            <Reveal as="li" key={`${index}-${member.name}`} delay={index * 70}>
              <article className="group h-full overflow-hidden rounded-2xl border border-ink-900/8 bg-white shadow-card transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-card-hover motion-reduce:hover:translate-y-0">
                {/*
                  Initials on a brand colour until a photo exists. MediaFrame's
                  generic placeholder states the shot a page needs, which is
                  right for equipment but wrong here — an empty grey box where a
                  face belongs undercuts the one thing this section is for.
                */}
                {/*
                  Landscape, not square. Staff photographs on a contractor's
                  site are people at their desk or beside a van, taken on a
                  phone held sideways — a square crop takes the top off their
                  head or half the room. A studio portrait would suit 1:1, and
                  nobody has those.
                */}
                {member.image.src ? (
                  <MediaFrame
                    image={member.image}
                    icon="shield"
                    aspect="4/3"
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                    className="rounded-none"
                  />
                ) : (
                  <Avatar name={member.name} className="aspect-4/3" />
                )}

                <div className="p-6">
                  <h3 className="text-xl text-ink-950">{member.name}</h3>
                  <p className="eyebrow mt-1.5 text-flame-600">{member.role}</p>
                  <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-700">
                    {member.bio}
                  </p>

                  {member.credentials?.length ? (
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {member.credentials.map((credential) => (
                        <li
                          key={credential}
                          className="flex items-center gap-1.5 rounded-full bg-ink-50 px-3 py-1 text-xs font-semibold text-ink-700"
                        >
                          <Icon
                            name="check"
                            size={13}
                            className="text-success-500"
                          />
                          {credential}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </article>
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
