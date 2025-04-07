import React, { useState } from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMedicationStore } from "@/store/medication-store";
import { ScheduleTime } from "@/components/ScheduleTime";
import { ScheduleFrequency } from "@/components/ScheduleFrequency";
import { ScheduleMealRelation } from "@/components/ScheduleMealRelation";
import { ScheduleDuration } from "@/components/ScheduleDuration";
import { Button } from "@/components/Button";
import { colors } from "@/constants/colors";
import { translations } from "@/constants/translations";
import { useScheduleForm } from "@/hooks/useScheduleForm";

export default function EditScheduleScreen() {
  const { index: scheduleId } = useLocalSearchParams<{ index: string }>();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const {
    schedules,
    draftSchedules,
    updateSchedule,
    addSchedule,
    deleteDraftSchedule,
  } = useMedicationStore();
  const draft = draftSchedules[scheduleId];
  const existing = schedules.find((s) => s.id === scheduleId);

  const originalSchedule = draft || existing;

  const {
    schedule,
    updateTime,
    updateFrequency,
    updateDays,
    updateDates,
    updateMealRelation,
    updateStartDate,
    updateEndDate,
    updateDurationDays,
  } = useScheduleForm(originalSchedule);
  if (!schedule) return null;

  const handleSave = () => {
    if (!validateForm()) return;
    if (draft) {
      addSchedule(schedule); // из черновика в основной список
      deleteDraftSchedule(scheduleId); // удаляем из черновиков
    } else {
      updateSchedule(scheduleId, schedule);
    }
    router.back();
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!schedule.time.trim()) {
      newErrors[`time`] = translations.required;
    }

    if (schedule.frequency === "specific_days" && schedule.days.length === 0) {
      newErrors[`days`] = translations.selectAtLeastOneDay;
    }

    if (
      schedule.frequency === "specific_dates" &&
      schedule.dates.length === 0
    ) {
      newErrors[`dates`] = translations.selectAtLeastOneDate;
    }

    // if (!schedule.startDate) {
    //   newErrors[`startDate`] = translations.required;
    // }

    //   if (durationType === "endDate" && !schedule.endDate) {
    //     newErrors[`endDate_${index}`] = translations.required;
    //   }

    //   if (
    //     durationType === "durationDays" &&
    //     (!schedule.durationDays || schedule.durationDays <= 0)
    //   ) {
    //     newErrors[`durationDays_${index}`] = translations.required;
    //   }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: `${translations.course}` }} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ScheduleTime
          time={schedule.time}
          onTimeChange={(time) => updateTime(time)}
          onRemove={() => {
            // removeScheduleTime(scheduleIndex);
          }}
          isRemovable={schedules.length > 1}
          errors={{ time: errors[`time`] }}
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
        />

        <View style={styles.buttonContainer}>
          <Button
            title={translations.saveReminder}
            onPress={() => {
              handleSave();
            }}
            style={styles.saveButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginVertical: 12 },
  buttonContainer: { marginTop: 32 },
  saveButton: { marginBottom: 16 },
});
