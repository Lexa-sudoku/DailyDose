import { useState } from "react";
import { MedicationSchedule, MealRelation, FrequencyType } from "@/types";

export const useScheduleForm = (initialSchedule: MedicationSchedule) => {
  const [schedule, setSchedule] = useState<MedicationSchedule>(initialSchedule);


  const addTime = () => {
    setSchedule((prev) => ({
      ...prev!,
      times: [...prev!.times, { time: "", dosage: "", unit: "" }],
    }));
  };

  const updateTime = (index: number, time: string) => {
    setSchedule((prev) => ({
      ...prev!,
      times: prev!.times.map((t, i) => (i === index ? { ...t, time } : t)),
    }));
  };

  const updateDosage = (index: number, dosage: string) => {
    setSchedule((prev) => ({
      ...prev!,
      times: prev!.times.map((t, i) => (i === index ? { ...t, dosage } : t)),
    }));
  };

  const updateUnit = (index: number, unit: string) => {
    setSchedule((prev) => ({
      ...prev!,
      times: prev!.times.map((t, i) => (i === index ? { ...t, unit } : t)),
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
    updateDosage,
    updateUnit,
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
