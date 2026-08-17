import type { Faq } from "@/types";

/**
 * FAQ content. Answers here are general HVAC information that is true
 * regardless of the company. Anything company-specific (pricing, fees,
 * warranty terms, response times) is marked TODO rather than guessed — an FAQ
 * that promises something the business does not do is worse than no FAQ.
 *
 * These also power FAQPage structured data, so keep answers self-contained.
 */
export const faqs: Faq[] = [
  {
    topic: "general",
    question: "How soon can someone come out?",
    answer:
      "It depends on the day, the season and where you are. The fastest way to get a real answer is to call — we can tell you the next available window while you are on the phone, rather than making you wait for a callback.",
    // TODO: if the business commits to a specific response window, state it here.
  },
  {
    topic: "general",
    question: "Do you charge for a diagnostic visit?",
    answer:
      "TODO — confirm the diagnostic fee, whether it is waived when the repair is approved, and any after-hours difference, then replace this answer. Please do not publish a number that has not been confirmed.",
  },
  {
    topic: "general",
    question: "What information should I have ready when I call?",
    answer:
      "The brand and approximate age of the system, what it is doing (or not doing), when it started, and whether the thermostat has power. If you can reach the outdoor unit safely, note whether the fan is spinning. That is usually enough to bring the right parts on the first visit.",
  },
  {
    topic: "cooling",
    question: "Why is my air conditioner blowing warm air?",
    answer:
      "The most common causes are a tripped breaker, a dirty air filter that has frozen the indoor coil, a failed run capacitor in the outdoor unit, or low refrigerant from a leak. Check the filter and the breaker first. If the indoor coil has iced over, switch the system to fan-only for an hour to thaw it before anyone works on it.",
  },
  {
    topic: "cooling",
    question: "How often does an AC need refrigerant?",
    answer:
      "It should never need it. Refrigerant is not consumed the way fuel is — it circulates in a sealed loop. A system that needs topping up has a leak, and adding refrigerant without finding the leak just pays for the same repair every season.",
  },
  {
    topic: "cooling",
    question: "What temperature should I set in summer?",
    answer:
      "Comfort depends on humidity as much as temperature. Many homes are comfortable around 75–78°F once indoor humidity is in the 45–50% range, and each degree higher reduces run time. If your home only feels comfortable at very low settings, humidity or airflow is usually the underlying problem.",
  },
  {
    topic: "heating",
    question: "Why does my furnace keep shutting off after a few minutes?",
    answer:
      "That pattern — called short-cycling — usually means the furnace is overheating and tripping its limit switch, most often because of a clogged filter or restricted return air, or that the flame sensor is dirty and the burner is dropping out shortly after ignition. Replace the filter first, then have the sensor and airflow checked.",
  },
  {
    topic: "heating",
    question: "Is it normal for a heat pump to blow cool air in winter?",
    answer:
      "Heat pump supply air is cooler than furnace air — typically around 90–100°F, which is below body temperature and can feel cool at the register even though it is heating the house. Periodic defrost cycles, where the outdoor unit steams and the indoor fan pauses, are also normal in cold, damp weather.",
  },
  {
    topic: "maintenance",
    question: "How often should HVAC equipment be serviced?",
    answer:
      "Once a year for a single-function system (cooling or heating), and twice a year for a heat pump or a system that does both, since it runs year-round. Manufacturers commonly require documented annual maintenance for warranty coverage — check the paperwork for your equipment.",
  },
  {
    topic: "maintenance",
    question: "How often should I change my air filter?",
    answer:
      "A one-inch filter typically needs replacing every 1–3 months, sooner with pets or during heavy use. Thicker four- or five-inch media filters usually last 6–12 months. A filter that is dark across its whole surface is overdue, and a restricted filter costs you capacity and efficiency immediately.",
  },
  {
    topic: "maintenance",
    question: "Repair or replace — how do I decide?",
    answer:
      "Age, repair history and the cost of the specific repair drive the decision. A system past 12–15 years with a major component failure (compressor, heat exchanger) is usually worth replacing; a newer system with a failed capacitor or contactor is worth repairing. You should always be given both numbers and left to choose.",
  },
  {
    topic: "billing",
    question: "What payment methods do you accept?",
    answer:
      "TODO — list the payment methods the business actually accepts (card, check, ACH, financing) and replace this answer.",
  },
  {
    topic: "billing",
    question: "Do you offer financing on new systems?",
    answer:
      "TODO — confirm whether financing is offered, through which lender, and what the qualification process is. Do not publish rates or terms that have not been confirmed in writing by the lender.",
  },
];

export function getFaqsByTopic(topic: Faq["topic"]): Faq[] {
  return faqs.filter((faq) => faq.topic === topic);
}

/** A short mixed set for the home page. */
export const homeFaqs: Faq[] = [
  faqs[0],
  faqs[3],
  faqs[6],
  faqs[8],
  faqs[9],
  faqs[10],
].filter(Boolean);
