export interface User {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  instructions: string;
  totalQuantity: number;
  remainingQuantity: number;
  lowStockThreshold: number;
  iconName?: string;
  iconColor?: string;
  createdAt: number;
  updatedAt: number;
}

export type MealRelation =
  | "before_meal"
  | "after_meal"
  | "with_meal"
  | "no_relation";

export interface MedicationSchedule {
  id: string;
  medicationId: string;
  times: string[]; // HH:MM format
  dosageByTime: string;
  frequency: "daily" | "every_other_day" | "specific_days" | "specific_dates";
  days: number[]; // 1-7 (Monday-Sunday)
  dates: string[]; // YYYY-MM-DD format
  mealRelation: MealRelation;
  startDate: string;
  endDate?: string;
  durationDays?: number;
  createdAt: number;
  updatedAt: number;
}

export interface MedicationIntake {
  dosageByTime: string;
  id: string;
  scheduleId: string;
  medicationId: string;
  scheduledTime: string; // HH:MM format
  scheduledDate: string; // YYYY-MM-DD format
  status: "taken" | "missed" | "pending";
  takenAt?: number;
  createdAt: number;
  medicationName: string;
  mealRelation: MealRelation;
  dosage: string;
  instructions: string;
}

export interface DailyMedicationWithStatus {
  id: string;
  scheduleId: string;
  medicationId: string;
  name: string;
  dosage: string;
  dosageByTime: string;
  instructions: string;
  times: string[];
  time: string;
  mealRelation: MealRelation;
  status: "taken" | "missed" | "pending";
  takenAt?: number;
  iconName?: string;
  iconColor?: string;
}

export interface DayMedications {
  [date: string]: DailyMedicationWithStatus[];
}

export interface MedicationStats {
  total: number;
  taken: number;
  missed: number;
  adherenceRate: number;
}

export interface NotificationSettings {
  medicationRemindersEnabled: boolean;
  reminderTime: number; // minutes before scheduled time
  lowStockRemindersEnabled: boolean;
}

export interface TimeRange {
  label: string;
  value: "7days" | "30days" | "3months" | "allTime";
}

export interface AdherenceData {
  date: string;
  adherenceRate: number;
}

export interface MedicationAdherenceData {
  medicationId: string;
  medicationName: string;
  adherenceRate: number;
}
