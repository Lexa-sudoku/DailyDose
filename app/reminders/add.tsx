// todo вместо длинного окна Расписание Курс 1 ... Курс 2 ... должны появиться окошки Курс 1 Курс 2  и переход к их редактированию по клику
// добавить внутри одного курса возможность выбрать несколько штук времени 12:00 19:00

// todo кастомные кнопки назад для ios

// todo когда запас лекарства исчерпан, а человек отмечает, что он его принял, надо предложить ему обновить имеющееся кол-во препарата в вкладке. там же нужно сделать удобную кнопку "пополнить запас"

// todo убрать отсюда парамс, перенести их в редактирование, а не создание

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Pill, Calendar, Plus } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { useMedicationStore } from "@/store/medication-store";
import { MealRelation, MedicationSchedule } from "@/types";
import { translations } from "@/constants/translations";
import { ScheduleTime } from "@/components/ScheduleTime";
import { ScheduleFrequency } from "@/components/ScheduleFrequency";
import { format } from "date-fns/format";
import { addDays, parseISO } from "date-fns";
import { DatePicker } from "@/components/DatePicker";
import { ScheduleMealRelation } from "@/components/ScheduleMealRelation";

export default function AddReminderScreen() {
  const params = useLocalSearchParams<{
    medicationId?: string;
    date?: string;
  }>();
  const { medicationId, date } = params;

  const [selectedMedicationId] = useState<
    string | undefined
  >(medicationId);
  const [schedules, setSchedules] = useState<(MedicationSchedule & { isNew?: boolean })[]
  >([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [existingSchedulesLoaded, setExistingSchedulesLoaded] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [currentScheduleIndex, setCurrentScheduleIndex] = useState(0);
  const [durationType, setDurationType] = useState<"endDate" | "durationDays">(
    "durationDays"
  );

  const {
    getMedicationById,
    getSchedulesForMedication,
    addSchedule,
    updateSchedule,
    deleteSchedule,
  } = useMedicationStore();

  const selectedMedication = selectedMedicationId
    ? getMedicationById(selectedMedicationId)
    : undefined;
  const [isInitialized, setIsInitialized] = useState(false);

  // Загружаем существующие расписания при выборе лекарства
  useEffect(() => {
    if (!isInitialized && selectedMedicationId && !existingSchedulesLoaded) {
      const existingSchedules = getSchedulesForMedication(selectedMedicationId);

      if (existingSchedules.length > 0) {
        // Преобразуем существующие расписания в формат для формы
        const formattedSchedules = existingSchedules.map((schedule) => ({
          id: schedule.id,
          medicationId: schedule.medicationId,
          time: schedule.time,
          frequency: schedule.frequency || "daily",
          days: schedule.days || [],
          dates: schedule.dates || [],
          mealRelation: schedule.mealRelation,
          startDate: schedule.startDate || format(new Date(), "yyyy-MM-dd"),
          endDate: schedule.endDate || "",
          durationDays: schedule.durationDays || 7,
          createdAt: schedule.createdAt,
          updatedAt: schedule.updatedAt,
        }));

        setSchedules(formattedSchedules);

        if (formattedSchedules[0].endDate) {
          setDurationType("endDate");
        } else {
          setDurationType("durationDays");
        }
      }
      setIsInitialized(true);
      setExistingSchedulesLoaded(true);
    }
  }, [selectedMedicationId, existingSchedulesLoaded, getSchedulesForMedication, isInitialized]);

  // Устанавливаем дату, если она передана в параметрах
  useEffect(() => {
    if (date) {
      setSchedules((prevSchedules) => {
        if (prevSchedules.length === 0 || prevSchedules[0].dates?.length !== 0) {
          return prevSchedules; // Если нет расписаний или даты уже установлены, ничего не меняем
        }
        const newSchedules = [...prevSchedules];
        newSchedules[0] = { 
          ...newSchedules[0], 
          dates: [date], 
          frequency: "specific_dates" 
        };
        return newSchedules;
      });
    }
  }, [date]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedMedicationId) {
      newErrors.medication = translations.selectMedicationRequired;
    }

    schedules.forEach((schedule, index) => {
      if (!schedule.time.trim()) {
        newErrors[`time_${index}`] = translations.required;
      }

      if (
        schedule.frequency === "specific_days" &&
        schedule.days.length === 0
      ) {
        newErrors[`days_${index}`] = translations.selectAtLeastOneDay;
      }

      if (
        schedule.frequency === "specific_dates" &&
        schedule.dates.length === 0
      ) {
        newErrors[`dates_${index}`] = translations.selectAtLeastOneDate;
      }

      if (!schedule.startDate) {
        newErrors[`startDate_${index}`] = translations.required;
      }

      if (durationType === "endDate" && !schedule.endDate) {
        newErrors[`endDate_${index}`] = translations.required;
      }

      if (
        durationType === "durationDays" &&
        (!schedule.durationDays || schedule.durationDays <= 0)
      ) {
        newErrors[`durationDays_${index}`] = translations.required;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm() || !selectedMedicationId) return;

    // Добавляем расписания для выбранного лекарства
    schedules.forEach((schedule) => {
      let endDate = schedule.endDate;
      if (durationType === "durationDays" && schedule.durationDays) {
        const startDateObj = parseISO(schedule.startDate);
        endDate = format(
          addDays(startDateObj, schedule.durationDays),
          "yyyy-MM-dd"
        );
      }

      if (schedule.isNew) {
        const { isNew, ...newSchedule } = schedule;
        addSchedule({
          ...newSchedule,
          medicationId: selectedMedicationId,
        });
      } else {
        updateSchedule(schedule.id, {
          time: schedule.time,
          frequency: schedule.frequency,
          days: schedule.days,
          dates: schedule.dates,
          mealRelation: schedule.mealRelation,
          startDate: schedule.startDate,
          endDate: durationType === "endDate" ? schedule.endDate : endDate,
          durationDays:
            durationType === "durationDays" ? schedule.durationDays : undefined,
        });
      }
    });

    router.back();
  };

  const navigateToSelectMedication = () => {
    router.replace("/reminders/select-medication");
  };

  const updateScheduleTime = (index: number, time: string) => {
    const newSchedules = [...schedules];
    newSchedules[index].time = time;
    setSchedules(newSchedules);
  };

  // const removeScheduleTime = (index: number) => {
  // todo
  // };

  const updateScheduleFrequency = (
    index: number,
    frequency: "daily" | "every_other_day" | "specific_days" | "specific_dates"
  ) => {
    const newSchedules = [...schedules];
    newSchedules[index].frequency = frequency;
    setSchedules(newSchedules);
  };

  const updateScheduleDays = (index: number, days: number[]) => {
    const newSchedules = [...schedules];
    newSchedules[index].days = days;
    setSchedules(newSchedules);
  };

  const updateScheduleDates = (index: number, dates: string[]) => {
    const newSchedules = [...schedules];
    newSchedules[index].dates = dates;
    setSchedules(newSchedules);
  };

  const updateScheduleMealRelation = (
    index: number,
    mealRelation: MealRelation
  ) => {
    const newSchedules = [...schedules];
    newSchedules[index].mealRelation = mealRelation;
    setSchedules(newSchedules);
  };

  const updateScheduleStartDate = (index: number, date: string) => {
    const newSchedules = [...schedules];
    newSchedules[index].startDate = date;
    setSchedules(newSchedules);
    setShowStartDatePicker(false);
  };

  const updateScheduleEndDate = (index: number, date: string) => {
    const newSchedules = [...schedules];
    newSchedules[index].endDate = date;
    setSchedules(newSchedules);
    setShowEndDatePicker(false);
  };

  const updateScheduleDurationDays = (index: number, days: number) => {
    const newSchedules = [...schedules];
    newSchedules[index].durationDays = days;
    setSchedules(newSchedules);
  };

  const handleOpenStartDatePicker = (index: number) => {
    setCurrentScheduleIndex(index);
    setShowStartDatePicker(true);
  };

  const handleOpenEndDatePicker = (index: number) => {
    setCurrentScheduleIndex(index);
    setShowEndDatePicker(true);
  };

  const addScheduleCourse = () => {
    const timestamp = Date.now();
    setSchedules([
      ...schedules,
      {
        id: `new-${timestamp}`,
        medicationId: `${selectedMedicationId}`,
        frequency: "daily",
        time: "12:00",
        dates: [],
        days: [],
        mealRelation: "no_relation",
        startDate: format(new Date(), "yyyy-MM-dd"),
        endDate: "",
        durationDays: 7,
        createdAt: timestamp,
        updatedAt: timestamp,
        isNew: true,
      },
    ]);
  };

  // todo 
  const removeScheduleCourse = (index: number) => {
    if (schedules.length > 1) {
      const scheduleToRemove = schedules[index];

      // Если это не новое расписание, удаляем его из хранилища
      if (!scheduleToRemove.isNew) {
        deleteSchedule(scheduleToRemove.id);
      }

      const newSchedules = [...schedules];
      newSchedules.splice(index, 1);
      setSchedules(newSchedules);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <Stack.Screen
        options={{
          title: translations.addReminder,
          headerBackTitle: translations.back,
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>
            {translations.selectMedication}
          </Text>

          <TouchableOpacity
            style={styles.medicationSelector}
            onPress={navigateToSelectMedication}
          >
            {selectedMedication ? (
              <View style={styles.selectedMedication}>
                <Pill
                  size={20}
                  color={selectedMedication.iconColor || colors.primary}
                />
                <Text style={styles.selectedMedicationName}>
                  {selectedMedication.name}
                </Text>
                <Text style={styles.selectedMedicationDosage}>
                  {selectedMedication.dosage}
                </Text>
              </View>
            ) : (
              <View style={styles.selectMedicationPrompt}>
                <Pill size={24} color={colors.primary} />
                <Text style={styles.selectMedicationText}>
                  {translations.tapToSelectMedication}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {errors.medication && (
            <Text style={styles.errorText}>{errors.medication}</Text>
          )}
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>{translations.schedule}</Text>

          {schedules.map((schedule, scheduleIndex) => (
            <View key={scheduleIndex} style={styles.scheduleContainer}>
              <ScheduleTime
                index={scheduleIndex}
                time={schedule.time}
                onTimeChange={(time) => updateScheduleTime(scheduleIndex, time)}
                onRemove={() => {
                  removeScheduleCourse(scheduleIndex);
                }}
                isRemovable={schedules.length > 1}
              />

              <ScheduleFrequency
                frequency={schedule.frequency}
                days={schedule.days}
                dates={schedule.dates}
                onFrequencyChange={(frequency) =>
                  updateScheduleFrequency(scheduleIndex, frequency)
                }
                onDaysChange={(days) => updateScheduleDays(scheduleIndex, days)}
                onDatesChange={(dates) =>
                  updateScheduleDates(scheduleIndex, dates)
                }
                errors={{
                  days: errors[`days_${scheduleIndex}`],
                  dates: errors[`dates_${scheduleIndex}`],
                }}
              />

              <ScheduleMealRelation
                mealRelation={schedule.mealRelation}
                onMealRelationChange={(mealRelation) =>
                  updateScheduleMealRelation(scheduleIndex, mealRelation)
                }
              />

              {/* todo вынести duration в отдельный component, рендерить пошагово*/}

              <View style={styles.durationContainer}>
                <Text style={styles.label}>{translations.treatmentPeriod}</Text>

                <View style={styles.durationTypeContainer}>
                  <TouchableOpacity
                    style={[
                      styles.durationTypeButton,
                      durationType === "durationDays" &&
                        styles.durationTypeButtonSelected,
                    ]}
                    onPress={() => setDurationType("durationDays")}
                  >
                    <Text
                      style={[
                        styles.durationTypeButtonText,
                        durationType === "durationDays" &&
                          styles.durationTypeButtonTextSelected,
                      ]}
                    >
                      {translations.specifyDuration}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.durationTypeButton,
                      durationType === "endDate" &&
                        styles.durationTypeButtonSelected,
                    ]}
                    onPress={() => setDurationType("endDate")}
                  >
                    <Text
                      style={[
                        styles.durationTypeButtonText,
                        durationType === "endDate" &&
                          styles.durationTypeButtonTextSelected,
                      ]}
                    >
                      {translations.specifyEndDate}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.dateContainer}>
                  <Text style={styles.dateLabel}>{translations.startDate}</Text>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => handleOpenStartDatePicker(scheduleIndex)}
                  >
                    <Calendar size={18} color={colors.primary} />
                    <Text style={styles.dateButtonText}>
                      {schedule.startDate || translations.selectDate}
                    </Text>
                  </TouchableOpacity>
                  {errors[`startDate_${scheduleIndex}`] && (
                    <Text style={styles.errorText}>
                      {errors[`startDate_${scheduleIndex}`]}
                    </Text>
                  )}
                </View>

                {durationType === "endDate" ? (
                  <View style={styles.dateContainer}>
                    <Text style={styles.dateLabel}>{translations.endDate}</Text>
                    <TouchableOpacity
                      style={styles.dateButton}
                      onPress={() => handleOpenEndDatePicker(scheduleIndex)}
                    >
                      <Calendar size={18} color={colors.primary} />
                      <Text style={styles.dateButtonText}>
                        {schedule.endDate || translations.selectDate}
                      </Text>
                    </TouchableOpacity>
                    {errors[`endDate_${scheduleIndex}`] && (
                      <Text style={styles.errorText}>
                        {errors[`endDate_${scheduleIndex}`]}
                      </Text>
                    )}
                  </View>
                ) : (
                  <View style={styles.dateContainer}>
                    <Text style={styles.dateLabel}>
                      {translations.durationDays}
                    </Text>
                    <View style={styles.durationInputContainer}>
                      <Input
                        value={schedule.durationDays?.toString() || ""}
                        onChangeText={(text) => {
                          const days = parseInt(text);
                          if (!isNaN(days) || text === "") {
                            updateScheduleDurationDays(
                              scheduleIndex,
                              days || 0
                            );
                          }
                        }}
                        keyboardType="numeric"
                        placeholder={translations.enterDays}
                        style={styles.durationInput}
                      />
                      <Text style={styles.daysText}></Text>
                    </View>
                    {errors[`durationDays_${scheduleIndex}`] && (
                      <Text style={styles.errorText}>
                        {errors[`durationDays_${scheduleIndex}`]}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            </View>
          ))}

          <TouchableOpacity
            style={styles.addTimeButton}
            onPress={addScheduleCourse}
          >
            <Plus size={20} color={colors.primary} />
            <Text style={styles.addTimeText}>{translations.addCourse}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title={translations.saveReminder}
            onPress={handleSave}
            style={styles.saveButton}
          />

          <Button
            title={translations.cancel}
            onPress={() => router.back()}
            variant="outline"
          />
        </View>
      </ScrollView>

      {showStartDatePicker && (
        <DatePicker
          onSelect={(date) =>
            updateScheduleStartDate(currentScheduleIndex, date)
          }
          onCancel={() => setShowStartDatePicker(false)}
        />
      )}

      {showEndDatePicker && (
        <DatePicker
          onSelect={(date) => updateScheduleEndDate(currentScheduleIndex, date)}
          onCancel={() => setShowEndDatePicker(false)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  formSection: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 16,
  },
  medicationSelector: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  selectedMedication: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectedMedicationName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginLeft: 12,
  },
  selectedMedicationDosage: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
    marginTop: 2,
  },
  selectMedicationPrompt: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  selectMedicationText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "500",
    marginLeft: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
    marginBottom: 16,
  },
  mealRelationContainer: {
    marginBottom: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  mealRelationButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    marginBottom: 8,
  },
  mealRelationButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  mealRelationButtonText: {
    fontSize: 14,
    color: colors.text,
  },
  mealRelationButtonTextSelected: {
    color: colors.white,
  },
  buttonContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  saveButton: {
    marginBottom: 12,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: -8,
    marginBottom: 16,
  },
  scheduleContainer: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  addTimeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    borderStyle: "dashed",
  },
  addTimeText: {
    color: colors.primary,
    fontWeight: "500",
    marginLeft: 8,
  },
  daysContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    marginBottom: 8,
  },
  dayButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayButtonText: {
    fontSize: 12,
    color: colors.text,
  },
  dayButtonTextSelected: {
    color: colors.white,
  },

  durationContainer: {
    marginTop: 16,
  },
  durationTypeContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  durationTypeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    marginRight: 8,
    borderRadius: 8,
  },
  durationTypeButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  durationTypeButtonText: {
    fontSize: 14,
    color: colors.text,
  },
  durationTypeButtonTextSelected: {
    color: colors.white,
  },
  dateContainer: {
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
  },
  dateButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.text,
  },
  durationInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  durationInput: {
    flex: 1,
  },
  daysText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.textSecondary,
  },
});
