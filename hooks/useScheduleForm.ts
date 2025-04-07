import { useState } from "react";
import { MedicationSchedule, MealRelation } from "@/types";

type FrequencyType = "daily" | "every_other_day" | "specific_days" | "specific_dates";

export const useScheduleForm = (initialSchedule: MedicationSchedule) => {
  const [schedule, setSchedule] = useState<MedicationSchedule>(initialSchedule);
  

  const updateTime = (time: string) => {
    setSchedule((prev) => ({ ...prev, time }));
  };

  const updateFrequency = (frequency: FrequencyType) => {
    setSchedule((prev) => ({ ...prev, frequency }));
  };

  const updateDays = (days: number[]) => {
    setSchedule((prev) => ({ ...prev, days }));
  };

  const updateDates = (dates: string[]) => {
    setSchedule((prev) => ({ ...prev, dates }));
  };

  const updateMealRelation = (mealRelation: MealRelation) => {
    setSchedule((prev) => ({ ...prev, mealRelation }));
  };

  const updateStartDate = (startDate: string) => {
    setSchedule((prev) => ({ ...prev, startDate }));
  };

  const updateEndDate = (endDate: string) => {
    setSchedule((prev) => ({ ...prev, endDate }));
  };

  const updateDurationDays = (durationDays: number) => {
    setSchedule((prev) => ({ ...prev, durationDays }));
  };

  return {
    schedule,
    setSchedule,
    updateTime,
    updateFrequency,
    updateDays,
    updateDates,
    updateMealRelation,
    updateStartDate,
    updateEndDate,
    updateDurationDays,
  };
};
