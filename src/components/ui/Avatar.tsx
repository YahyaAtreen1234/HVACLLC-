import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { initialsOf, isPrompt } from "@/lib/initials";

/**
 * Stand-in for a team photo that has not been supplied yet.
 *
 * A team page exists to show customers who will be knocking on their door, so
 * an empty slot undercuts the whole point of the section. Initials on a brand
 * colour read as deliberate rather than broken, and cost no image request.
 *
 * Two states, because a name is not always a name yet: a real name gets its
 * initials, while a name still holding an editing prompt ("Add owner's name")
 * gets a neutral mark — "AO" would look like a person rather than an
 * unfinished field. The shield matches the icon the team placeholder already
 * used, rather than introducing a new one.
 */

/** Alternates the two brand colours, stably per person rather than at random. */
function toneFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return Math.abs(hash) % 2 === 0 ? "bg-ink-900" : "bg-flame-500";
}

export function Avatar({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const prompt = isPrompt(name);
  const initials = initialsOf(name);

  return (
    <div
      className={cn(
        "flex aspect-square w-full items-center justify-center",
        prompt ? "bg-ink-100" : toneFor(name),
        className,
      )}
      // Decorative: the name is already in the heading directly beneath, so
      // announcing it again here would just repeat it for screen reader users.
      aria-hidden="true"
    >
      {prompt || !initials ? (
        <Icon name="shield" size={56} className="text-ink-400" />
      ) : (
        <span className="font-display text-5xl font-bold tracking-tight text-white">
          {initials}
        </span>
      )}
    </div>
  );
}
