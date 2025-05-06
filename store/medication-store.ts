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
  DailyMedicationGroup,
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
import { convertUnit } from "@/utils/medication-utils";
import { translations } from "@/constants/translations";
import { scheduleLowStockReminder } from "@/utils/notification-utils";
import { useSettingsStore } from "./settings-store";
import { getUnitDisplayFromRaw } from "@/constants/medication";
import { medicationApi } from "@/api/medication-api";

interface MedicationState {
  medications: Medication[];
  schedules: MedicationSchedule[];
  intakes: MedicationIntake[];
  draftSchedules: Record<string, MedicationSchedule>;

  // Загрузка данных
  loadMedications: () => Promise<void>;
  loadSchedules: () => Promise<void>;
  loadIntakes: () => Promise<void>;

  // Medication CRUD
  addMedication: (
    medication: Omit<Medication, "id" | "createdAt" | "updatedAt">
  ) => Promise<string>;
  updateMedication: (
    id: string,
    medication: Partial<Medication>
  ) => Promise<void>;
  deleteMedication: (id: string, keepHistory?: boolean) => Promise<void>;

  // Schedule CRUD
  addSchedule: (
    schedule: Omit<MedicationSchedule, "id" | "createdAt" | "updatedAt">
  ) => Promise<string>;
  updateSchedule: (
    id: string,
    schedule: Partial<MedicationSchedule>
  ) => Promise<void>;
  deleteSchedule: (id: string, keepHistory?: boolean) => Promise<void>;

  // Intake management
  recordIntake: (
    scheduleId: string,
    medicationId: string,
    date: string,
    time: string,
    status: "taken" | "missed",
    dosage: string,
    unit: string
  ) => Promise<void>;

  // Drafts CRUD
  addDraftSchedule: (draftSchedule: MedicationSchedule) => string;
  updateDraftSchedule: (id: string, data: Partial<MedicationSchedule>) => void;
  deleteDraftSchedule: (id: string) => void;

  // Queries
  getMedicationById: (id: string) => Medication | undefined;
  getScheduleById: (id: string) => MedicationSchedule | undefined;
  getSchedulesForMedication: (medicationId: string) => MedicationSchedule[];
  getMedicationsByDate: (date: string) => DailyMedicationGroup[];
  getMedicationsByDateSlplittedByTime: (
    date: string
  ) => DailyMedicationWithStatus[];
  getMedicationsForCalendar: (date: string) => DayMedications;
  getMedicationStats: (days?: number) => MedicationStats;
  getLowStockMedications: () => Medication[];
  getMedicationAdherenceByTimeRange: (
    days: number
  ) => MedicationAdherenceData[];
  getMedicationAdherenceByDay: (
    days: number
  ) => { date: string; adherenceRate: number }[];
  getIntakesForMedication: (
    medicationId: string,
    scheduleId?: string
  ) => MedicationIntake[];
  getIntakesForSchedule: (scheduleId: string) => MedicationIntake[];
  getDraftScheduleById: (id: string) => MedicationSchedule | undefined;
}

export const useMedicationStore = create<MedicationState>()(
  persist(
    (set, get) => ({
      medications: [],
      schedules: [],
      intakes: [],
      draftSchedules: {},

      loadMedications: async () => {
        try {
          const token = await AsyncStorage.getItem("auth_token");
          if (!token) throw new Error("Not authenticated");

          const medications = await medicationApi.getMedications(token);
          set({ medications });
        } catch (error) {
          console.error("Failed to load medications", error);
        }
      },

      loadSchedules: async () => {
        try {
          const token = await AsyncStorage.getItem("auth_token");
          if (!token) throw new Error("Not authenticated");

          const schedules = await medicationApi.getSchedules(token);
          set({ schedules });
        } catch (error) {
          console.error("Failed to load schedules", error);
        }
      },

      loadIntakes: async () => {
        try {
          const token = await AsyncStorage.getItem("auth_token");
          if (!token) throw new Error("Not authenticated");

          const intakes = await medicationApi.getIntakes(token);
          set({ intakes });
        } catch (error) {
          console.error("Failed to load intakes", error);
        }
      },

      addMedication: async (medicationData) => {
        try {
          const id = Date.now().toString();
          const timestamp = Date.now();

          const token = await AsyncStorage.getItem("auth_token");
          if (!token) throw new Error("Not authenticated");

          const newMedication: Medication = {
            id,
            ...medicationData,
            createdAt: timestamp,
            updatedAt: timestamp,
          };

          await medicationApi.createMedication(newMedication, token);

          set((state) => ({
            medications: [...state.medications, newMedication],
          }));

          return id;
        } catch (error) {
          console.error("Failed to add medication", error);
          throw error;
        }
      },

      updateMedication: async (id, medicationData) => {
        try {
          const token = await AsyncStorage.getItem("auth_token");
          if (!token) throw new Error("Not authenticated");

          const updatedMedication = await medicationApi.updateMedication(
            id,
            { ...medicationData, updatedAt: Date.now() },
            token
          );
          set((state) => ({
            medications: state.medications.map((med) =>
              med.id === id ? updatedMedication : med
            ),
          }));
        } catch (error) {
          console.error("Failed to update medication", error);
          throw error;
        }
      },

      deleteMedication: async (id, keepHistory = true) => {
        try {
          const token = await AsyncStorage.getItem("auth_token");
          if (!token) throw new Error("Not authenticated");

          // Получаем все связанные расписания перед удалением
          const schedulesToDelete = get().schedules.filter(
            (schedule) => schedule.medicationId === id
          );

          // Массовое удаление расписаний с сервера
          await Promise.all(
            schedulesToDelete.map((schedule) =>
              medicationApi
                .deleteSchedule(schedule.id, token)
                .catch(console.error)
            )
          );

          await medicationApi.deleteMedication(id, token);
          // Если нужно сохранить историю, удаляем только лекарство, но не приемы
          if (keepHistory) {
            set((state) => ({
              medications: state.medications.filter((med) => med.id !== id),
              schedules: state.schedules.filter(
                (schedule) => schedule.medicationId !== id
              ),
            }));
          } else {
            // Иначе удаляем все связанные данные
            const intakesToDelete = get().intakes.filter(
              (intake) => intake.medicationId === id
            );

            // Массовое удаление приемов с сервера
            await Promise.all(
              intakesToDelete.map((intake) =>
                medicationApi
                  .deleteIntake(intake.id, token)
                  .catch(console.error)
              )
            );

            set((state) => ({
              medications: state.medications.filter((med) => med.id !== id),
              schedules: state.schedules.filter(
                (schedule) => schedule.medicationId !== id
              ),
              intakes: state.intakes.filter(
                (intake) => intake.medicationId !== id
              ),
            }));
          }
        } catch (error) {
          console.error("Failed to delete medication", error);
          throw error;
        }
      },

      addSchedule: async (scheduleData) => {
        try {
          const id = Date.now().toString();
          const timestamp = Date.now();

          const token = await AsyncStorage.getItem("auth_token");
          if (!token) throw new Error("Not authenticated");

          const newSchedule: MedicationSchedule = {
            id,
            ...scheduleData,
            createdAt: timestamp,
            updatedAt: timestamp,
          };

          await medicationApi.createSchedule(newSchedule, token);

          set((state) => ({
            schedules: [...state.schedules, newSchedule],
          }));

          return id;
        } catch (error) {
          console.error("Failed to add schedule", error);
          throw error;
        }
      },

      updateSchedule: async (id, scheduleData) => {
        try {
          const token = await AsyncStorage.getItem("auth_token");
          if (!token) throw new Error("Not authenticated");

          const updatedSchedule = await medicationApi.updateSchedule(
            id,
            { ...scheduleData, updatedAt: Date.now() },
            token
          );

          set((state) => ({
            schedules: state.schedules.map((schedule) =>
              schedule.id === id ? updatedSchedule : schedule
            ),
          }));
        } catch (error) {
          console.error("Failed to update schedule", error);
          throw error;
        }
      },

      deleteSchedule: async (id, keepHistory = true) => {
        try {
          const token = await AsyncStorage.getItem("auth_token");
          if (!token) throw new Error("Not authenticated");

          await medicationApi.deleteSchedule(id, token);

          // Если нужно сохранить историю, удаляем только расписание, но не приемы
          if (keepHistory) {
            set((state) => ({
              schedules: state.schedules.filter(
                (schedule) => schedule.id !== id
              ),
            }));
          } else {
            // Иначе удаляем все связанные приемы
            const intakesToDelete = get().intakes.filter(
              (intake) => intake.scheduleId === id
            );

            // Массовое удаление приемов с сервера
            await Promise.all(
              intakesToDelete.map((intake) =>
                medicationApi
                  .deleteIntake(intake.id, token)
                  .catch(console.error)
              )
            );

            set((state) => ({
              schedules: state.schedules.filter(
                (schedule) => schedule.id !== id
              ),
              intakes: state.intakes.filter(
                (intake) => intake.scheduleId !== id
              ),
            }));
          }
        } catch (error) {
          console.error("Failed to delete schedule", error);
          throw error;
        }
      },

      recordIntake: async (
        scheduleId,
        medicationId,
        date,
        time,
        status,
        dosageByTime,
        unit
      ) => {
        try {
          const token = await AsyncStorage.getItem("auth_token");
          if (!token) throw new Error("Not authenticated");

          const medication = get().getMedicationById(medicationId);
          const schedule = get().getScheduleById(scheduleId);
          if (!schedule || !medication) return;

          const intakeId = Date.now().toString();
          const timestamp = Date.now();

          const newIntake: MedicationIntake = {
            id: intakeId,
            scheduleId,
            medicationId,
            scheduledTime: time,
            scheduledDate: date,
            status,
            takenAt: status === "taken" ? timestamp : undefined,
            createdAt: timestamp,
            updatedAt: timestamp,
            medicationName: medication.name,
            mealRelation: schedule.mealRelation,
            dosagePerUnit: medication.dosagePerUnit,
            dosageByTime,
            unit,
            instructions: medication.instructions,
            iconColor: medication.iconColor,
            iconName: medication.iconName,
          };

          await medicationApi.createIntake(newIntake, token);

          // Обновляем количество лекарства, если принято
          if (status === "taken") {
            const { notificationSettings } = useSettingsStore.getState();
            if (medication && medication.remainingQuantity > 0) {
              const dosageByTimeFloat = parseFloat(dosageByTime);

              const usedAmount = medication.dosagePerUnit
                ? convertUnit(
                    medication.form,
                    dosageByTimeFloat,
                    unit,
                    medication.dosagePerUnit
                  )
                : convertUnit(medication.form, dosageByTimeFloat, unit);

              const resultQuantity = Math.max(
                0,
                medication.remainingQuantity -
                  Math.round(usedAmount * 1000) / 1000
              );

              if (
                notificationSettings.lowStockRemindersEnabled &&
                resultQuantity <= medication.lowStockThreshold
              ) {
                scheduleLowStockReminder(
                  medication.name,
                  resultQuantity,
                  getUnitDisplayFromRaw(medication.unit, resultQuantity)
                );
              }

              get().updateMedication(medicationId, {
                remainingQuantity: resultQuantity,
              });
            }
          }

          set((state) => {
            // Проверяем, есть ли уже запись о приеме для этого расписания и даты
            const existingIntakeIndex = state.intakes.findIndex(
              (intake) =>
                intake.scheduleId === scheduleId &&
                intake.scheduledDate === date &&
                intake.scheduledTime === time
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
        } catch (error) {
          console.error("Failed to record intake", error);
          throw error;
        }
      },

      addDraftSchedule: (draftSchedule: MedicationSchedule) => {
        const timestamp = Date.now();
        const id = `draft-${draftSchedule.id}`;

        let draft: MedicationSchedule;

        draft = {
          ...draftSchedule,
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        set((state) => ({
          draftSchedules: { ...state.draftSchedules, [id]: draft },
        }));

        return id;
      },

      updateDraftSchedule: (id, updates) =>
        set((state) => ({
          draftSchedules: {
            ...state.draftSchedules,
            [id]: {
              ...state.draftSchedules[id],
              ...updates,
            },
          },
        })),

      getDraftScheduleById: (id) => get().draftSchedules[id],

      deleteDraftSchedule: (id) =>
        set((state) => {
          const copy = { ...state.draftSchedules };
          delete copy[id];
          return { draftSchedules: copy };
        }),

      getMedicationById: (id) => {
        return get().medications.find((med) => med.id === id);
      },

      getScheduleById: (id) => {
        return get().schedules.find((schedule) => schedule.id === id);
      },

      getSchedulesForMedication: (medicationId) => {
        return get().schedules.filter(
          (schedule) => schedule.medicationId === medicationId
        );
      },

      getMedicationsByDate: (date) => {
        const { medications, schedules, intakes } = get();
        const dayOfWeek = new Date(date).getDay();
        const dateObj = new Date(date);

        // Получаем подходящие расписания
        const applicableSchedules = schedules.filter((schedule) => {
          const startDateObj = schedule.startDate
            ? parseISO(schedule.startDate)
            : null;
          const endDateObj = schedule.endDate
            ? parseISO(schedule.endDate)
            : null;

          if (startDateObj && isBefore(dateObj, startOfDay(startDateObj)))
            return false;
          if (endDateObj && isAfter(dateObj, endOfDay(endDateObj)))
            return false;
          if (startDateObj && schedule.durationDays) {
            const calculatedEndDate = addDays(
              startDateObj,
              schedule.durationDays
            );
            if (isAfter(dateObj, endOfDay(calculatedEndDate))) return false;
          }

          if (schedule.frequency === "daily") return true;
          if (schedule.frequency === "every_other_day") {
            const startDate = startDateObj || new Date(2023, 0, 1);
            const diffDays = Math.floor(
              (+dateObj - +startDate) / (1000 * 60 * 60 * 24)
            );
            return diffDays % 2 === 0;
          }
          if (schedule.frequency === "specific_days") {
            return schedule.days.includes(dayOfWeek);
          }
          if (schedule.frequency === "specific_dates") {
            return schedule.dates.includes(date);
          }
          return false;
        });

        const results: DailyMedicationGroup[] = [];
        const existingKeys = new Set<string>();

        applicableSchedules.forEach((schedule) => {
          const medication = medications.find(
            (med) => med.id === schedule.medicationId
          );
          if (!medication) return;

          (schedule.times || []).forEach(({ time, dosage, unit }) => {
            const key = `${date}-${schedule.id}-${medication.id}-${time}`;
            existingKeys.add(key);

            const intake = intakes.find(
              (i) =>
                i.scheduleId === schedule.id &&
                i.medicationId === medication.id &&
                i.scheduledDate === date &&
                i.scheduledTime === time
            );

            results.push({
              id: key,
              scheduleId: schedule.id,
              medicationId: medication.id,
              name: medication.name,
              dosagePerUnit: medication.dosagePerUnit,
              instructions: medication.instructions,
              times: [{ time, dosage, unit }],
              mealRelation: schedule.mealRelation,
              takenAt: intake?.takenAt,
              iconName: intake?.iconName || medication.iconName,
              iconColor: intake?.iconColor || medication.iconColor,
            });
          });
        });

        // Добавляем orphan intakes
        intakes
          .filter((intake) => intake.scheduledDate === date)
          .forEach((intake) => {
            const key = `${date}-${intake.scheduleId}-${intake.medicationId}-${intake.scheduledTime}`;
            if (existingKeys.has(key)) return;

            results.push({
              id: key,
              scheduleId: intake.scheduleId,
              medicationId: intake.medicationId,
              name: intake.medicationName,
              dosagePerUnit: intake.dosagePerUnit,
              instructions: intake.instructions,
              times: [
                {
                  time: intake.scheduledTime,
                  dosage: intake.dosageByTime,
                  unit: intake.unit,
                },
              ],
              mealRelation: intake.mealRelation,
              takenAt: intake.takenAt,
              iconName: intake.iconName,
              iconColor: intake.iconColor,
            });
          });

        return results;
      },

      getMedicationsByDateSlplittedByTime: (date) => {
        const result = [] as DailyMedicationWithStatus[];

        const { getMedicationsByDate, intakes } = get();
        const medications = getMedicationsByDate(date);

        medications.forEach((group) => {
          group.times?.forEach(({ time, dosage, unit }) => {
            const intake = intakes.find(
              (intake) =>
                intake.scheduleId === group.scheduleId &&
                intake.medicationId === group.medicationId &&
                intake.scheduledDate === date &&
                intake.scheduledTime === time
            );

            result.push({
              id: `${time}-${group.id}`,
              scheduleId: group.scheduleId,
              medicationId: group.medicationId,
              name: group.name,
              dosagePerUnit: group.dosagePerUnit,
              dosageByTime: intake?.dosageByTime || dosage,
              unit: intake?.unit || unit,
              instructions: group.instructions,
              time,
              mealRelation: group.mealRelation,
              status: intake?.status || "pending",
              takenAt: intake?.takenAt,
              iconName: intake?.iconName || group.iconName,
              iconColor: intake?.iconColor || group.iconColor,
            });
          });
        });
        return result;
      },

      getMedicationsForCalendar: (date) => {
        const result: DayMedications = {};
        const { getMedicationsByDateSlplittedByTime } = get();

        const dateObj = parseISO(date);
        const weekStart = startOfDay(
          subDays(dateObj, dateObj.getDay() === 0 ? 6 : dateObj.getDay() - 1)
        ); // Понедельник
        const weekEnd = endOfDay(addDays(weekStart, 6)); // Воскресенье

        for (
          let d = new Date(weekStart);
          d <= weekEnd;
          d.setDate(d.getDate() + 1)
        ) {
          const dateString = format(d, "yyyy-MM-dd");
          result[dateString] = getMedicationsByDateSlplittedByTime(dateString);
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
          (intake) => intake.status === "taken"
        ).length;
        const missed = filteredIntakes.filter(
          (intake) => intake.status === "missed"
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
          (med) =>
            med.trackStock && med.remainingQuantity <= med.lowStockThreshold
        );
      },

      getMedicationAdherenceByTimeRange: (days) => {
        const { intakes } = get();
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
            const intake = intakes.find(
              (med) => med.medicationId === medicationId
            );
            return {
              medicationId,
              medicationName:
                intake?.medicationName || translations.unknownMedication,
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
            (intake) => intake.scheduledDate === date
          );
          const total = dayIntakes.length;
          const taken = dayIntakes.filter(
            (intake) => intake.status === "taken"
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
              intake.scheduleId === scheduleId
          );
        }
        return get().intakes.filter(
          (intake) => intake.medicationId === medicationId
        );
      },

      getIntakesForSchedule: (scheduleId) => {
        return get().intakes.filter(
          (intake) => intake.scheduleId === scheduleId
        );
      },
    }),
    {
      name: "medication-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
