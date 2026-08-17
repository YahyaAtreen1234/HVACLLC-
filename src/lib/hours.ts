import { business, type WeekDay } from "@/config/business";

const DAY_ORDER: WeekDay[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const DAY_LABEL: Record<WeekDay, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

/** Schema.org day codes, used by the LocalBusiness structured data. */
const DAY_SCHEMA: Record<WeekDay, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

/** "08:00" -> "8:00 AM" */
export function formatTime(value: string): string {
  const [hourStr, minute] = value.split(":");
  const hour = Number(hourStr);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${minute} ${suffix}`;
}

export interface HoursRow {
  day: WeekDay;
  label: string;
  /** "8:00 AM – 5:00 PM" or "Closed". */
  value: string;
  isClosed: boolean;
}

export function getHoursRows(): HoursRow[] {
  return DAY_ORDER.map((day) => {
    const { open, close } = business.hours[day];
    const isClosed = !open || !close;
    return {
      day,
      label: DAY_LABEL[day],
      value: isClosed ? "Closed" : `${formatTime(open)} – ${formatTime(close)}`,
      isClosed,
    };
  });
}

/** Compact summary for the footer, e.g. "Mon–Fri 8:00 AM – 5:00 PM". */
export function getWeekdaySummary(): string {
  const monday = business.hours.monday;
  if (!monday.open || !monday.close) return "See full hours";
  return `Mon–Fri ${formatTime(monday.open)} – ${formatTime(monday.close)}`;
}

/** openingHours strings for schema.org, e.g. "Mo-Fr 08:00-17:00" style rows. */
export function getSchemaOpeningHours() {
  return DAY_ORDER.filter((day) => business.hours[day].open).map((day) => ({
    "@type": "OpeningHoursSpecification" as const,
    dayOfWeek: DAY_SCHEMA[day],
    opens: business.hours[day].open,
    closes: business.hours[day].close,
  }));
}
