import type { TeamMember } from "@/types";

/**
 * ⚠️ PLACEHOLDER PEOPLE — replace before launch.
 *
 * The roles below are typical for a residential HVAC contractor, but the names
 * and bios are stand-ins. Real people on a real website need their real names,
 * and photos they have agreed to publish.
 *
 * For each member:
 *   1. Replace `name`, `role` and `bio` with the real details.
 *   2. Drop a photo into /public/images/team/ and set `image.src`.
 *   3. Add `credentials` only for certifications the person actually holds
 *      (e.g. "NATE-certified", "EPA 608 Universal"). Leave it off otherwise.
 *   4. Set `isPlaceholder: false`.
 *
 * Delete any member you do not have — three cards is a layout choice, not a
 * requirement. The grid handles 1, 2, 3 or more.
 */
export const team: TeamMember[] = [
  {
    name: "Add owner's name",
    role: "Owner & Lead Technician",
    bio: "Runs the diagnostics on the difficult calls — the intermittent faults and the systems two other companies could not sort out.",
    image: {
      src: "",
      alt: "Portrait of the company owner in work uniform outside a customer's home",
      width: 800,
      height: 800,
    },
    isPlaceholder: true,
  },
  {
    name: "Add service manager's name",
    role: "Service Manager",
    bio: "The person who answers the phone when your heat goes out, and the one who decides whose day gets rearranged to fit you in.",
    image: {
      src: "",
      alt: "Portrait of the service manager at the dispatch desk",
      width: 800,
      height: 800,
    },
    isPlaceholder: true,
  },
  {
    name: "Add install lead's name",
    role: "Installation Lead",
    bio: "Handles replacements start to finish — load calculations, duct transitions, commissioning readings and the clean-up afterwards.",
    image: {
      src: "",
      alt: "Portrait of the installation lead beside a newly installed indoor air handler",
      width: 800,
      height: 800,
    },
    isPlaceholder: true,
  },
];

export const teamIsPlaceholder = team.some((member) => member.isPlaceholder);
