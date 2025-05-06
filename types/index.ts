import { MedicationForm } from "@/constants/medication";

export interface User {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
}

export interface Medication {
  id: string;
  name: string;
  form: MedicationForm;
  dosagePerUnit?: string;
  unit: string;
  instructions: string;
  totalQuantity: number;
  remainingQuantity: number;
  lowStockThreshold: number;
  trackStock: boolean;
  iconName: string;
  iconColor: string;
  createdAt: number;
  updatedAt: number;
}

export type MealRelation =
  | "before_meal"
  | "after_meal"
  | "with_meal"
  | "no_relation";

export type FrequencyType =
  | "daily"
  | "every_other_day"
  | "specific_days"
  | "specific_dates";

export type ScheduleTimeItem = {
  time: string;
  dosage: string;
  unit: string;
};

export type Status = "taken" | "missed" | "pending";

export interface MedicationSchedule {
  id: string;
  medicationId: string;
  times: ScheduleTimeItem[]; // { HH:MM, dosage, unit }
  frequency: FrequencyType;
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
  id: string;
  scheduleId: string;
  medicationId: string;
  scheduledTime: string; // HH:MM format
  scheduledDate: string; // YYYY-MM-DD format
  status: Status;
  takenAt?: number;
  createdAt: number;
  updatedAt: number;
  medicationName: string;
  mealRelation: MealRelation;
  dosagePerUnit?: string;
  instructions: string;
  dosageByTime: string;
  unit: string;
  iconName: string;
  iconColor: string;
}

export interface DailyMedicationGroup {
  id: string;
  scheduleId: string;
  medicationId: string;
  name: string;
  dosagePerUnit?: string;
  instructions: string;
  times: ScheduleTimeItem[];
  mealRelation: MealRelation;
  takenAt?: number;
  iconName: string;
  iconColor: string;
}

export interface DailyMedicationWithStatus {
  id: string;
  scheduleId: string;
  medicationId: string;
  name: string;
  dosagePerUnit?: string;
  dosageByTime: string;
  unit: string;
  instructions: string;
  time: string;
  mealRelation: MealRelation;
  status: Status;
  takenAt?: number;
  iconName: string;
  iconColor: string;
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
  id: string;
  medicationRemindersEnabled: boolean;
  minutesBeforeScheduledTime: number;
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

export type CourseNotificationMap = {
  [scheduleId: string]: string[]; // { [ID курса]: массив идентификаторов уведомлений }
};
