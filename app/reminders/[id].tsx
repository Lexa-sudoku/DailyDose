// todo НЕ ИСПОЛЬЗУЕТСЯ, НО ДОЛЖЕН - надо доработать

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Trash2 } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { Button } from "@/components/Button";
import { useMedicationStore } from "@/store/medication-store";
import { MealRelation } from "@/types";
import { translations } from "@/constants/translations";
import { ScheduleTime } from "@/components/ScheduleTime";
import { ScheduleFrequency } from "@/components/ScheduleFrequency";
import { MedicationIcon } from "@/components/MedicationIcon";

export default function EditReminderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { getScheduleById, getMedicationById, updateSchedule, deleteSchedule } =
    useMedicationStore();

  const schedule = getScheduleById(id);
  const medication = schedule
    ? getMedicationById(schedule.medicationId)
    : undefined;

  const [time, setTime] = useState("");
  const [frequency, setFrequency] = useState<
    "daily" | "every_other_day" | "specific_days" | "specific_dates"
  >("daily");
  const [days, setDays] = useState<number[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [mealRelation, setMealRelation] = useState<MealRelation>("no_relation");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Инициализируем данные только один раз при загрузке компонента
  useEffect(() => {
    if (!isInitialized && schedule) {
      setTime(schedule.time);
      setFrequency(schedule.frequency || "daily");
      setDays(schedule.days || []);
      setDates(schedule.dates || []);
      setMealRelation(schedule.mealRelation);
      setIsInitialized(true);
    }
  }, [schedule, isInitialized]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!time.trim()) {
      newErrors.time = translations.required;
    }

    if (frequency === "specific_days" && days.length === 0) {
      newErrors.days = translations.selectAtLeastOneDay;
    }

    if (frequency === "specific_dates" && dates.length === 0) {
      newErrors.dates = translations.selectAtLeastOneDate;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = () => {
    if (!validateForm() || !schedule) return;

    updateSchedule(id, {
      time,
      frequency,
      days,
      dates,
      mealRelation,
    });

    router.back();
  };

  const handleDelete = () => {
    Alert.alert(
      translations.deleteReminder,
      translations.deleteReminderConfirm,
      [
        {
          text: translations.cancel,
          style: "cancel",
        },
        {
          text: translations.delete,
          style: "destructive",
          onPress: () => {
            deleteSchedule(id);
            router.back();
          },
        },
      ],
    );
  };

  const mealRelationOptions: { value: MealRelation; label: string }[] = [
    { value: "before_meal", label: translations.beforeMeal },
    { value: "with_meal", label: translations.withMeal },
    { value: "after_meal", label: translations.afterMeal },
    { value: "no_relation", label: translations.noMealRelation },
  ];

  if (!schedule || !medication) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: translations.editReminder }} />
        <View style={styles.centerContainer}>
          <Text>Напоминание не найдено</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isInitialized) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: translations.editReminder }} />
        <View style={styles.centerContainer}>
          <Text>Загрузка...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <Stack.Screen
        options={{
          title: translations.editReminder,
          headerBackTitle: translations.back,
          headerRight: () => (
            <TouchableOpacity
              onPress={handleDelete}
              style={styles.deleteButton}
            >
              <Trash2 size={20} color={colors.error} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>{translations.medication}</Text>

          <View style={styles.medicationInfo}>
            <View style={styles.medicationIcon}>
              <MedicationIcon
                iconName={medication.iconName || "Pill"}
                color={medication.iconColor || colors.primary}
                size={24}
              />
            </View>
            <View>
              <Text style={styles.medicationName}>{medication.name}</Text>
              <Text style={styles.medicationDosage}>{medication.dosage}</Text>
            </View>
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>{translations.schedule}</Text>

          <ScheduleTime
            index={0}
            time={time}
            onTimeChange={setTime}
            onRemove={() => {}}
            isRemovable={false}
          />

          <ScheduleFrequency
            frequency={frequency}
            days={days}
            dates={dates}
            onFrequencyChange={setFrequency}
            onDaysChange={setDays}
            onDatesChange={setDates}
            errors={{
              days: errors.days,
              dates: errors.dates,
            }}
          />

          <Text style={styles.label}>{translations.mealRelation}</Text>
          <View style={styles.mealRelationContainer}>
            {mealRelationOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.mealRelationButton,
                  mealRelation === option.value &&
                    styles.mealRelationButtonSelected,
                ]}
                onPress={() => setMealRelation(option.value)}
              >
                <Text
                  style={[
                    styles.mealRelationButtonText,
                    mealRelation === option.value &&
                      styles.mealRelationButtonTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title={translations.updateReminder}
            onPress={handleUpdate}
            style={styles.saveButton}
          />

          <Button
            title={translations.cancel}
            onPress={() => router.back()}
            variant="outline"
          />
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
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
  medicationInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  medicationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.lightGray,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  medicationDosage: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
    marginBottom: 8,
  },
  mealRelationContainer: {
    marginBottom: 16,
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
  deleteButton: {
    padding: 8,
  },
});
