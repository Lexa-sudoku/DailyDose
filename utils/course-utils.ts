import { FrequencyType, MedicationSchedule } from "@/types";
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

export function getActiveScheduleIds(
  schedules: MedicationSchedule[]
): string[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return schedules
    .filter((schedule) => {
      if (!schedule.endDate) return false;
      const endDate = new Date(schedule.endDate);
      endDate.setHours(23, 59, 59, 999);
      return endDate >= today;
    })
    .map((schedule) => schedule.id);
}
