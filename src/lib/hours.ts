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

/**
 * A day recorded as 00:00–23:59 means around the clock.
 *
 * That span is how schema.org expresses a 24-hour day, so it is what the
 * config holds — but printing it literally gives "12:00 AM – 11:59 PM", which
 * reads like a mistake rather than like being open all night.
 */
const isAllDay = (open: string | null, close: string | null) =>
  open === "00:00" && close === "23:59";

/** True when every day of the week is open around the clock. */
export function isAlwaysOpen(): boolean {
  return DAY_ORDER.every((day) =>
    isAllDay(business.hours[day].open, business.hours[day].close),
  );
}

export function getHoursRows(): HoursRow[] {
  return DAY_ORDER.map((day) => {
    const { open, close } = business.hours[day];
    const isClosed = !open || !close;

    const value = isClosed
      ? "Closed"
      : isAllDay(open, close)
        ? "Open 24 hours"
        : `${formatTime(open)} – ${formatTime(close)}`;

    return { day, label: DAY_LABEL[day], value, isClosed };
  });
}

/**
 * Compact summary for the header strip and footer.
 *
 * Derived rather than written, so it cannot drift from the hours themselves —
 * the previous version hard-coded "Mon–Fri", which would have kept saying so
 * however the week was configured.
 */
export function getWeekdaySummary(): string {
  if (isAlwaysOpen()) return "Open 24 hours, 7 days a week";

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
