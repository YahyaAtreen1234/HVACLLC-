import { Container, Section } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { Alert } from "@/components/ui/Alert";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { getTeam, getTeamIsPlaceholder } from "@/server/content/read";

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
  const team = await getTeam();
  if (!team.length) return null;

  return (
    <Section tone={tone} id="team">
      <Container>
        <SectionHeading
          eyebrow="The team"
          title="Who turns up at your door"
          lead="Small enough that you will recognise the person on your doorstep, and that they will remember your system next time."
        />

        {await getTeamIsPlaceholder() ? (
          <Alert tone="info" title="Placeholder team members" className="mt-8">
            The names and bios below are stand-ins. Replace them in{" "}
            <code>src/data/team.ts</code> and add real photos to{" "}
            <code>/public/images/team/</code> — publishing invented staff on a
            page whose whole job is trust defeats the point of the page.
          </Alert>
        ) : null}

        <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((member, index) => (
            <Reveal as="li" key={member.role} delay={index * 70}>
              <article className="group h-full overflow-hidden rounded-2xl border border-ink-900/8 bg-white shadow-card transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-card-hover motion-reduce:hover:translate-y-0">
                <MediaFrame
                  image={member.image}
                  icon="shield"
                  aspect="1/1"
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                  className="rounded-none"
                />

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
