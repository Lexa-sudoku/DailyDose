// todo добавить внутри одного курса возможность выбрать несколько штук времени 12:00 19:00

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
import { Pill, Plus, Trash2 } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { useMedicationStore } from "@/store/medication-store";
import { MedicationSchedule } from "@/types";
import { translations } from "@/constants/translations";
import { format } from "date-fns/format";
import { parseISO } from "date-fns";

export default function AddReminderScreen() {
  const params = useLocalSearchParams<{
    medicationId?: string;
    date?: string;
  }>();
  const { medicationId } = params;

  const [selectedMedicationId] = useState<string | undefined>(medicationId);
  const [schedules, setSchedules] = useState<MedicationSchedule[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [existingSchedulesLoaded, setExistingSchedulesLoaded] = useState(false);
  const [durationType, setDurationType] = useState<"endDate" | "durationDays">(
    "durationDays"
  );

  const {
    getMedicationById,
    getSchedulesForMedication,
    deleteSchedule,
    addDraftSchedule,
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
  }, [
    selectedMedicationId,
    existingSchedulesLoaded,
    getSchedulesForMedication,
    isInitialized,
  ]);

  const validateMedication = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedMedicationId) {
      newErrors.medication = translations.selectMedicationRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const navigateToSelectMedication = () => {
    router.replace("/reminders/select-medication");
  };

  const goToEditSchedule = (id: string) => {
    if (!validateMedication()) return;
    router.replace({
      pathname: "/reminders/edit",
      params: { index: id },
    });
  };

  const addScheduleCourse = () => {
    const timestamp = Date.now();

    const newSchedule: MedicationSchedule = {
      id: `draft-${timestamp}`,
      medicationId: `${selectedMedicationId}`,
      frequency: "daily",
      time: "",
      dates: [],
      days: [],
      mealRelation: "no_relation",
      startDate: format(new Date(), "yyyy-MM-dd"),
      endDate: "",
      durationDays: 7,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    addDraftSchedule(newSchedule);
    
    // Короткая задержка (один рендер-фрейм), чтобы Zustand успел обновиться
    setTimeout(() => {
      goToEditSchedule(newSchedule.id);
    }, 0);
  };

  const removeScheduleCourse = (index: number) => {
    const scheduleToRemove = schedules[index];
    deleteSchedule(scheduleToRemove.id, true);

    const newSchedules = [...schedules];
    newSchedules.splice(index, 1);
    setSchedules(newSchedules);
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
          {schedules.map((schedule, index) => (
            <View key={schedule.id} style={styles.courseCard}>
              <TouchableOpacity
                style={styles.courseContent}
                onPress={() => goToEditSchedule(schedule.id)}
              >
                <Text style={styles.courseText}>
                  {`${translations.course} ${index + 1}: ${format(
                    parseISO(schedule.startDate),
                    "dd.MM.yyyy"
                  )} - ${
                    durationType === "endDate" && schedule.endDate
                      ? format(parseISO(schedule.endDate), "dd.MM.yyyy")
                      : `+${schedule.durationDays} дней`
                  }`}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => removeScheduleCourse(index)}
                style={styles.deleteButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Trash2 size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity
            onPress={addScheduleCourse}
            style={styles.addCourseButton}
          >
            <Plus size={20} color={colors.primary} />
            <Text style={styles.addCourseText}>{translations.addCourse}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  addCourseButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    borderStyle: "dashed",
  },
  addCourseText: {
    color: colors.primary,
    fontWeight: "500",
    marginLeft: 8,
  },
  courseContent: {
    flex: 1,
  },
  courseText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
  },
  courseCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.white,
    marginBottom: 12,
    borderColor: colors.border,
    borderWidth: 1,
  },
  deleteButton: {
    marginLeft: 12,
    padding: 4,
  },
});
