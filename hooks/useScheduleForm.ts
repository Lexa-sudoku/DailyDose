import { useState } from "react";
import { MedicationSchedule, MealRelation } from "@/types";

type FrequencyType =
  | "daily"
  | "every_other_day"
  | "specific_days"
  | "specific_dates";

export const useScheduleForm = (initialSchedule: MedicationSchedule) => {
  const [schedule, setSchedule] = useState<MedicationSchedule>(initialSchedule);

  const addTime = () => {
    setSchedule((prev) => ({
      ...prev!,
      times: [...prev!.times, ""],
    }));
  };

  const updateTime = (index: number, time: string) => {
    setSchedule((prev) => ({
      ...prev!,
      times: prev!.times.map((t, i) => (i === index ? time : t)),
    }));
  };

  const removeTime = (index: number) => {
    setSchedule((prev) => ({
      ...prev!,
      times: prev!.times.filter((_, i) => i !== index),
    }));
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

  const updateDosageByTime = (dosageByTime: string) => {
    setSchedule((prev) => ({ ...prev, dosageByTime }));
  };

  return {
    schedule,
    setSchedule,
    addTime,
    updateTime,
    removeTime,
    updateFrequency,
    updateDays,
    updateDates,
    updateMealRelation,
    updateStartDate,
    updateEndDate,
    updateDurationDays,
    updateDosageByTime,
  };
};
