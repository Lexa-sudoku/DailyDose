// todo ПЕРЕПИСАТЬ ЛОГИКУ УДАЛЕНИЯ сейчас даже при неподтвержденном удалении какого-то расписания оно стирается со всего журнала, аналогично с лекарствами
// при удалении курса надо предложить пользователю завершить курс или снести все записи?

// todo учитывать какое кол-во препарата принимается за раз и вычитать из общего кол-ва, сейчас вычитается по 1

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Medication,
  MedicationSchedule,
  MedicationIntake,
  DailyMedicationWithStatus,
  DayMedications,
  MedicationStats,
  MedicationAdherenceData,
} from "@/types";
import {
  format,
  parseISO,
  isBefore,
  startOfDay,
  endOfDay,
  subDays,
  isWithinInterval,
  addDays,
  isAfter,
} from "date-fns";

interface MedicationState {
  medications: Medication[];
  schedules: MedicationSchedule[];
  intakes: MedicationIntake[];

  // Medication CRUD
  addMedication: (
    medication: Omit<Medication, "id" | "createdAt" | "updatedAt">,
  ) => string;
  updateMedication: (id: string, medication: Partial<Medication>) => void;
  deleteMedication: (id: string, keepHistory?: boolean) => void;

  // Schedule CRUD
  addSchedule: (
    schedule: Omit<MedicationSchedule, "id" | "createdAt" | "updatedAt">,
  ) => string;
  updateSchedule: (id: string, schedule: Partial<MedicationSchedule>) => void;
  deleteSchedule: (id: string, keepHistory?: boolean) => void;

  // Intake management
  recordIntake: (
    scheduleId: string,
    medicationId: string,
    date: string,
    status: "taken" | "missed",
  ) => void;

  // Queries
  getMedicationById: (id: string) => Medication | undefined;
  getScheduleById: (id: string) => MedicationSchedule | undefined;
  getSchedulesForMedication: (medicationId: string) => MedicationSchedule[];
  getMedicationsByDate: (date: string) => DailyMedicationWithStatus[];
  getMedicationsForCalendar: (date: string) => DayMedications;
  getMedicationStats: (days?: number) => MedicationStats;
  getLowStockMedications: () => Medication[];
  getMedicationAdherenceByTimeRange: (
    days: number,
  ) => MedicationAdherenceData[];
  getMedicationAdherenceByDay: (
    days: number,
  ) => { date: string; adherenceRate: number }[];
  getIntakesForMedication: (
    medicationId: string,
    scheduleId?: string,
  ) => MedicationIntake[];
  getIntakesForSchedule: (scheduleId: string) => MedicationIntake[];
}

export const useMedicationStore = create<MedicationState>()(
  persist(
    (set, get) => ({
      medications: [],
      schedules: [],
      intakes: [],

      addMedication: (medicationData) => {
        const id = Date.now().toString();
        const timestamp = Date.now();

        const newMedication: Medication = {
          id,
          ...medicationData,
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        set((state) => ({
          medications: [...state.medications, newMedication],
        }));

        return id;
      },

      updateMedication: (id, medicationData) => {
        set((state) => ({
          medications: state.medications.map((med) =>
            med.id === id
              ? { ...med, ...medicationData, updatedAt: Date.now() }
              : med,
          ),
        }));
      },

      deleteMedication: (id, keepHistory = false) => {
        set((state) => {
          // Если нужно сохранить историю, удаляем только лекарство, но не приемы
          if (keepHistory) {
            return {
              medications: state.medications.filter((med) => med.id !== id),
              schedules: state.schedules.filter(
                (schedule) => schedule.medicationId !== id,
              ),
            };
          }

          // Иначе удаляем все связанные данные
          return {
            medications: state.medications.filter((med) => med.id !== id),
            schedules: state.schedules.filter(
              (schedule) => schedule.medicationId !== id,
            ),
            intakes: state.intakes.filter(
              (intake) => intake.medicationId !== id,
            ),
          };
        });
      },

      addSchedule: (scheduleData) => {
        const id = Date.now().toString();
        const timestamp = Date.now();

        const newSchedule: MedicationSchedule = {
          id,
          ...scheduleData,
          frequency: scheduleData.frequency || "daily",
          days: scheduleData.days || [],
          dates: scheduleData.dates || [],
          startDate: scheduleData.startDate || format(new Date(), "yyyy-MM-dd"),
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        set((state) => ({
          schedules: [...state.schedules, newSchedule],
        }));

        return id;
      },

      updateSchedule: (id, scheduleData) => {
        set((state) => ({
          schedules: state.schedules.map((schedule) =>
            schedule.id === id
              ? { ...schedule, ...scheduleData, updatedAt: Date.now() }
              : schedule,
          ),
        }));
      },

      deleteSchedule: (id, keepHistory = false) => {
        set((state) => {
          // Если нужно сохранить историю, удаляем только расписание, но не приемы
          if (keepHistory) {
            return {
              schedules: state.schedules.filter(
                (schedule) => schedule.id !== id,
              ),
            };
          }

          // Иначе удаляем все связанные данные
          return {
            schedules: state.schedules.filter((schedule) => schedule.id !== id),
            intakes: state.intakes.filter((intake) => intake.scheduleId !== id),
          };
        });
      },

      recordIntake: (scheduleId, medicationId, date, status) => {
        const schedule = get().schedules.find((s) => s.id === scheduleId);
        if (!schedule) return;

        const intakeId = Date.now().toString();
        const timestamp = Date.now();

        const newIntake: MedicationIntake = {
          id: intakeId,
          scheduleId,
          medicationId,
          scheduledTime: schedule.time,
          scheduledDate: date,
          status,
          takenAt: status === "taken" ? timestamp : undefined,
          createdAt: timestamp,
        };

        // Обновляем количество лекарства, если принято
        if (status === "taken") {
          const medication = get().medications.find(
            (m) => m.id === medicationId,
          );
          if (medication && medication.remainingQuantity > 0) {
            get().updateMedication(medicationId, {
              remainingQuantity: medication.remainingQuantity - 1,
            });
          }
        }

        set((state) => {
          // Проверяем, есть ли уже запись о приеме для этого расписания и даты
          const existingIntakeIndex = state.intakes.findIndex(
            (intake) =>
              intake.scheduleId === scheduleId && intake.scheduledDate === date,
          );

          if (existingIntakeIndex >= 0) {
            // Обновляем существующую запись
            const updatedIntakes = [...state.intakes];
            updatedIntakes[existingIntakeIndex] = {
              ...updatedIntakes[existingIntakeIndex],
              status,
              takenAt: status === "taken" ? timestamp : undefined,
            };
            return { intakes: updatedIntakes };
          } else {
            // Добавляем новую запись
            return { intakes: [...state.intakes, newIntake] };
          }
        });
      },

      getMedicationById: (id) => {
        return get().medications.find((med) => med.id === id);
      },

      getScheduleById: (id) => {
        return get().schedules.find((schedule) => schedule.id === id);
      },

      getSchedulesForMedication: (medicationId) => {
        return get().schedules.filter(
          (schedule) => schedule.medicationId === medicationId,
        );
      },

      getMedicationsByDate: (date) => {
        const { medications, schedules, intakes } = get();
        const dayOfWeek = new Date(date).getDay();
        const dateObj = new Date(date);

        // Получаем все расписания, которые применяются к этому дню
        const applicableSchedules = schedules.filter((schedule) => {
          // Проверяем, входит ли дата в период приема лекарства
          const startDateObj = schedule.startDate
            ? parseISO(schedule.startDate)
            : null;
          const endDateObj = schedule.endDate
            ? parseISO(schedule.endDate)
            : null;

          // Если есть startDate, проверяем, что текущая дата не раньше startDate
          if (startDateObj && isBefore(dateObj, startOfDay(startDateObj))) {
            return false;
          }

          // Если есть endDate, проверяем, что текущая дата не позже endDate
          if (endDateObj && isAfter(dateObj, endOfDay(endDateObj))) {
            return false;
          }

          // Если есть durationDays, вычисляем конечную дату и проверяем
          if (startDateObj && schedule.durationDays) {
            const calculatedEndDate = addDays(
              startDateObj,
              schedule.durationDays,
            );
            if (isAfter(dateObj, endOfDay(calculatedEndDate))) {
              return false;
            }
          }

          // Для ежедневного приема
          if (schedule.frequency === "daily") {
            return true;
          }

          // Для приема через день
          if (schedule.frequency === "every_other_day") {
            const startDate = startDateObj || new Date(2023, 0, 1); // Фиксированная дата начала, если нет startDate
            const diffTime = Math.abs(dateObj.getTime() - startDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays % 2 === 0;
          }

          // Для приема в определенные дни недели
          if (schedule.frequency === "specific_days") {
            return schedule.days.includes(dayOfWeek);
          }

          // Для приема в определенные даты
          if (schedule.frequency === "specific_dates") {
            return schedule.dates.includes(date);
          }

          return false;
        });

        // Сопоставляем расписания с лекарствами и статусом
        return applicableSchedules
          .map((schedule) => {
            const medication = medications.find(
              (med) => med.id === schedule.medicationId,
            );
            if (!medication) return null;

            // Находим запись о приеме для этого расписания и даты
            const intake = intakes.find(
              (intake) =>
                intake.scheduleId === schedule.id &&
                intake.scheduledDate === date,
            );

            return {
              id: `${date}-${schedule.id}`,
              scheduleId: schedule.id,
              medicationId: medication.id,
              name: medication.name,
              dosage: medication.dosage,
              instructions: medication.instructions,
              time: schedule.time,
              mealRelation: schedule.mealRelation,
              status: intake?.status || "pending",
              takenAt: intake?.takenAt,
              iconName: medication.iconName,
              iconColor: medication.iconColor,
            } as DailyMedicationWithStatus;
          })
          .filter(Boolean) as DailyMedicationWithStatus[];
      },

      getMedicationsForCalendar: (date) => {
        const result: DayMedications = {};
        const { getMedicationsByDate } = get();
        
        const dateObj = parseISO(date);
        const weekStart = startOfDay(subDays(dateObj, dateObj.getDay() === 0 ? 6 : dateObj.getDay() - 1)); // Понедельник
        const weekEnd = endOfDay(addDays(weekStart, 6)); // Воскресенье
      
        for (let d = new Date(weekStart); d <= weekEnd; d.setDate(d.getDate() + 1)) {
          const dateString = format(d, "yyyy-MM-dd");
          result[dateString] = getMedicationsByDate(dateString);
        }
      
        return result;
      },

      getMedicationStats: (days = 0) => {
        const { intakes } = get();
        let filteredIntakes = intakes;

        // Если указано количество дней, фильтруем по этому периоду
        if (days > 0) {
          const startDate = subDays(new Date(), days);
          filteredIntakes = intakes.filter((intake) => {
            const intakeDate = parseISO(intake.scheduledDate);
            return isWithinInterval(intakeDate, {
              start: startOfDay(startDate),
              end: endOfDay(new Date()),
            });
          });
        }

        const total = filteredIntakes.length;
        const taken = filteredIntakes.filter(
          (intake) => intake.status === "taken",
        ).length;
        const missed = filteredIntakes.filter(
          (intake) => intake.status === "missed",
        ).length;
        const adherenceRate = total > 0 ? (taken / total) * 100 : 0;

        return {
          total,
          taken,
          missed,
          adherenceRate,
        };
      },

      getLowStockMedications: () => {
        return get().medications.filter(
          (med) => med.remainingQuantity <= med.lowStockThreshold,
        );
      },

      getMedicationAdherenceByTimeRange: (days) => {
        const { medications, intakes } = get();
        const startDate = subDays(new Date(), days);

        // Фильтруем приемы по указанному периоду
        const filteredIntakes = intakes.filter((intake) => {
          const intakeDate = parseISO(intake.scheduledDate);
          return isWithinInterval(intakeDate, {
            start: startOfDay(startDate),
            end: endOfDay(new Date()),
          });
        });

        // Группируем по лекарству и вычисляем соблюдение
        const medicationAdherence: Record<
          string,
          { total: number; taken: number }
        > = {};

        filteredIntakes.forEach((intake) => {
          if (!medicationAdherence[intake.medicationId]) {
            medicationAdherence[intake.medicationId] = { total: 0, taken: 0 };
          }

          medicationAdherence[intake.medicationId].total++;
          if (intake.status === "taken") {
            medicationAdherence[intake.medicationId].taken++;
          }
        });

        // Преобразуем в массив с процентами соблюдения
        return Object.entries(medicationAdherence)
          .map(([medicationId, stats]) => {
            const medication = medications.find(
              (med) => med.id === medicationId,
            );
            return {
              medicationId,
              medicationName: medication?.name || "Неизвестное лекарство",
              adherenceRate:
                stats.total > 0 ? (stats.taken / stats.total) * 100 : 0,
            };
          })
          .sort((a, b) => b.adherenceRate - a.adherenceRate);
      },

      getMedicationAdherenceByDay: (days) => {
        const { intakes } = get();
        const result: { date: string; adherenceRate: number }[] = [];

        // Создаем массив дат для указанного периода
        const dates: string[] = [];
        for (let i = days - 1; i >= 0; i--) {
          const date = format(subDays(new Date(), i), "yyyy-MM-dd");
          dates.push(date);
        }

        // Вычисляем соблюдение для каждого дня
        dates.forEach((date) => {
          const dayIntakes = intakes.filter(
            (intake) => intake.scheduledDate === date,
          );
          const total = dayIntakes.length;
          const taken = dayIntakes.filter(
            (intake) => intake.status === "taken",
          ).length;

          result.push({
            date,
            adherenceRate: total > 0 ? (taken / total) * 100 : 0,
          });
        });

        return result;
      },

      getIntakesForMedication: (medicationId, scheduleId) => {
        if (scheduleId) {
          return get().intakes.filter(
            (intake) =>
              intake.medicationId === medicationId &&
              intake.scheduleId === scheduleId,
          );
        }
        return get().intakes.filter(
          (intake) => intake.medicationId === medicationId,
        );
      },

      getIntakesForSchedule: (scheduleId) => {
        return get().intakes.filter(
          (intake) => intake.scheduleId === scheduleId,
        );
      },
    }),
    {
      name: "medication-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
