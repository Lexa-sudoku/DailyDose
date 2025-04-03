import {
  format,
  parseISO,
  isBefore,
  isAfter,
  startOfDay,
  addDays,
} from "date-fns";
import { ru } from "date-fns/locale";
import { translations } from "@/constants/translations";

export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, "yyyy-MM-dd");
};

export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(":");
  const date = new Date();
  date.setHours(parseInt(hours, 10));
  date.setMinutes(parseInt(minutes, 10));

  return format(date, "HH:mm");
};

export const formatDateTime = (date: string, time: string): Date => {
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);

  return new Date(year, month - 1, day, hours, minutes);
};

export const isTimeInPast = (date: string, time: string): boolean => {
  const dateTime = formatDateTime(date, time);
  return isBefore(dateTime, new Date());
};

export const isTimeInFuture = (date: string, time: string): boolean => {
  const dateTime = formatDateTime(date, time);
  return isAfter(dateTime, new Date());
};

export const getCurrentDate = (): string => {
  return format(new Date(), "yyyy-MM-dd");
};

export const getCurrentTime = (): string => {
  return format(new Date(), "HH:mm");
};

export const getMealRelationText = (relation: string): string => {
  switch (relation) {
    case "before_meal":
      return translations.beforeMeal;
    case "after_meal":
      return translations.afterMeal;
    case "with_meal":
      return translations.withMeal;
    case "no_relation":
      return translations.noMealRelation;
    default:
      return "";
  }
};

export const getMonthName = (month: number): string => {
  const monthNames = [
    translations.january,
    translations.february,
    translations.march,
    translations.april,
    translations.may,
    translations.june,
    translations.july,
    translations.august,
    translations.september,
    translations.october,
    translations.november,
    translations.december,
  ];

  return monthNames[month];
};

export const getDayName = (day: number, short = true): string => {
  const dayNames = [
    translations.mon,
    translations.tue,
    translations.wed,
    translations.thu,
    translations.fri,
    translations.sat,
    translations.sun,
  ];

  // Преобразуем из 0-6 (воскресенье-суббота) в 0-6 (понедельник-воскресенье)
  const adjustedDay = (day + 6) % 7;

  return dayNames[adjustedDay];
};

export const formatDateToRussian = (date: Date): string => {
  return format(date, "d MMMM yyyy", { locale: ru });
};

export const getWeekDays = (startDate: Date): Date[] => {
  // Начинаем с понедельника
  const monday = startOfDay(startDate);
  while (monday.getDay() !== 1) {
    // 1 - понедельник
    monday.setDate(monday.getDate() - 1);
  }

  // Создаем массив дней недели
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
};
