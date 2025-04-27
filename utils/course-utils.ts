import { FrequencyType } from "@/types";
import { addDays, eachDayOfInterval, isBefore, parseISO } from "date-fns";

export function getCourseActiveDates(
  frequency: FrequencyType,
  startDate: string,
  endDate?: string,
  durationDays?: number,
  days?: number[],
  specificDates?: string[]
): Date[] {
  const start = parseISO(startDate);
  const end = endDate
    ? parseISO(endDate)
    : durationDays
      ? addDays(start, durationDays)
      : addDays(start, 1);

  const interval = eachDayOfInterval({ start, end });

  switch (frequency) {
    case "daily":
      return interval;

    case "every_other_day":
      return interval.filter((_, idx) => idx % 2 === 0);

    case "specific_days":
      return interval.filter((date) => days?.includes(date.getDay()));

    case "specific_dates":
      return (specificDates || [])
        .map((d) => parseISO(d))
        .filter((d) => isBefore(d, end));

    default:
      return [];
  }
}
