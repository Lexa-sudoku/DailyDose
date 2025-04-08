import React, { useState } from "react";
import { ScrollView, View, StyleSheet, Text } from "react-native";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMedicationStore } from "@/store/medication-store";
import { ScheduleTimes } from "@/components/ScheduleTime";
import { ScheduleFrequency } from "@/components/ScheduleFrequency";
import { ScheduleMealRelation } from "@/components/ScheduleMealRelation";
import { ScheduleDuration } from "@/components/ScheduleDuration";
import { Button } from "@/components/Button";
import { colors } from "@/constants/colors";
import { translations } from "@/constants/translations";
import { useScheduleForm } from "@/hooks/useScheduleForm";
import { Input } from "@/components/Input";

export default function EditScheduleScreen() {
  const { id: scheduleId } = useLocalSearchParams<{ id: string }>();

  const [errors, setErrors] = useState<Record<string, any>>({});
  const {
    schedules,
    draftSchedules,
    updateSchedule,
    addSchedule,
    deleteDraftSchedule,
  } = useMedicationStore();
  
  const draft = draftSchedules[`draft-${scheduleId}`];
  const existing = schedules.find((s) => s.id === scheduleId);

  const originalSchedule = draft || existing;

  const {
    schedule,
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
  } = useScheduleForm(originalSchedule);

  if (!schedule) {
    console.log("Нет данных")
    return
  }

  const handleSave = () => {
    if (!validateForm()) return;
    if (draft) {
      const newSchedule = { ...schedule, id: scheduleId.split("-")[1] };
      addSchedule(newSchedule); // из черновика в основной список
      deleteDraftSchedule(scheduleId); // удаляем из черновиков
    } else {
      updateSchedule(scheduleId, schedule);
    }
    router.back();
  };

  const handleCancel = () => {
    if (draft) {
      deleteDraftSchedule(scheduleId); // удаляем из черновиков
    }
    router.back();
  };

  const validateForm = () => {
    const newErrors: Record<string, any> = {};
    const timeErrors: string[] = [];

    const timeRegex = /^(?:[0-9]|1[0-9]|2[0-3]):[0-5]\d$/; // формат HH:MM (24ч)

    schedule.times.forEach((el, index) => {
      if (!el) {
        timeErrors[index] = translations.required;
      } else if (!timeRegex.test(el)) {
        timeErrors[index] = translations.invalidTimeFormat;
      }
    });

    if (timeErrors.length) {
      newErrors.time = timeErrors;
    }

    if (schedule.dosageByTime === "") {
      newErrors[`dosage`] = translations.required;
    }

    if (schedule.frequency === "specific_days" && schedule.days.length === 0) {
      newErrors[`days`] = translations.selectAtLeastOneDay;
    }

    if (schedule.dosageByTime === undefined) {
      newErrors[`dosage`] = translations.required;
    }

    if (
      schedule.frequency === "specific_dates" &&
      schedule.dates.length === 0
    ) {
      newErrors[`dates`] = translations.selectAtLeastOneDate;
    }

    if (!schedule.startDate) {
      newErrors[`startDate`] = translations.required;
    }

    if (!schedule.durationDays && !schedule.endDate) {
      newErrors[`duration`] = translations.required;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <Stack.Screen options={{ title: `${translations.course}` }} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ScheduleTimes
          times={schedule.times}
          onAddTime={addTime}
          onTimeChange={(index, time) => updateTime(index, time)}
          onRemoveTime={(index) => removeTime(index)}
          isRemovable={schedule.times.length > 1}
          errors={{ time: errors.time }}
        />
        <Text style={styles.label}>{translations.dosage}</Text>
        <Input
          label={""}
          value={
            schedule.dosageByTime !== undefined ? schedule.dosageByTime : ""
          }
          onChangeText={(text) => {
            updateDosageByTime(text);
          }}
          placeholder="1 таблетка   ||   20 мг   ||   4 укола   ||    ..."
          error={errors[`dosage`]}
        />

        <ScheduleFrequency
          frequency={schedule.frequency}
          days={schedule.days}
          dates={schedule.dates}
          onFrequencyChange={(frequency) => updateFrequency(frequency)}
          onDaysChange={(days) => updateDays(days)}
          onDatesChange={(dates) => updateDates(dates)}
          errors={{
            days: errors[`days`],
            dates: errors[`dates`],
          }}
        />

        <ScheduleMealRelation
          mealRelation={schedule.mealRelation}
          onMealRelationChange={(meal) => updateMealRelation(meal)}
        />

        <ScheduleDuration
          startDate={schedule.startDate}
          endDate={schedule.endDate}
          durationDays={schedule.durationDays}
          onStartDateChange={(start) => updateStartDate(start)}
          onEndDateChange={(end) => updateEndDate(end)}
          onDurationDaysChange={(days) => updateDurationDays(days)}
          errors={{
            startDate: errors[`startDate`],
            duration: errors[`duration`],
          }}
        />

        <View style={styles.buttonContainer}>
          <Button
            title={translations.saveReminder}
            onPress={() => {
              handleSave();
            }}
            style={styles.saveButton}
          />
          <Button
            title={translations.cancelEdit}
            onPress={() => {
              handleCancel();
            }}
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
  scrollContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 12,
  },
  buttonContainer: {
    marginTop: 16,
  },
  saveButton: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
    marginBottom: 12,
  },
});
