import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { useMedicationStore } from "@/store/medication-store";
import { useScheduleForm } from "@/hooks/useScheduleForm";
import { MedicationForms } from "@/constants/medication";
import { translations } from "@/constants/translations";
import { colors } from "@/constants/colors";
import { Button } from "@/components/Button";
import { MedicationIcon } from "@/components/MedicationIcon";

import { ScheduleTimes } from "@/components/ScheduleTime";
import { ScheduleFrequency } from "@/components/ScheduleFrequency";
import { ScheduleMealRelation } from "@/components/ScheduleMealRelation";
import { ScheduleDuration } from "@/components/ScheduleDuration";
import { LinearGradient } from "expo-linear-gradient";
import { useKeyboard } from "@/hooks/useKeyboard";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const ITEM_HEIGHT = 400;
const CENTER_SPACER = SCREEN_HEIGHT / 2 - ITEM_HEIGHT / 2;

export default function EditScheduleScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const { id: scheduleId } = useLocalSearchParams<{ id: string }>();

  const [errors, setErrors] = useState<Record<string, any>>({});

  const { keyboardShown } = useKeyboard();
  const {
    schedules,
    draftSchedules,
    updateSchedule,
    addSchedule,
    deleteDraftSchedule,
    getMedicationById,
  } = useMedicationStore();

  const draft = draftSchedules[`draft-${scheduleId}`];
  const existing = schedules.find((s) => s.id === scheduleId);
  const originalSchedule = draft || existing;

  const medication = getMedicationById(originalSchedule?.medicationId ?? "");
  const form = medication?.form ?? "tablet";

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
    updateDosage,
    updateUnit,
  } = useScheduleForm(originalSchedule);

  const handleSave = () => {
    if (!validateForm()) return;
    if (draft) {
      const newSchedule = { ...schedule, id: scheduleId.split("-")[1] };
      addSchedule(newSchedule);
      deleteDraftSchedule(scheduleId);
    } else {
      updateSchedule(scheduleId, schedule);
    }
    router.back();
  };

  const handleCancel = () => {
    if (draft) {
      deleteDraftSchedule(scheduleId);
    }
    router.back();
  };

  const validateForm = () => {
    const newErrors: Record<string, any> = {};
    if (schedule.frequency === "specific_days" && schedule.days.length === 0) {
      newErrors.days = translations.selectAtLeastOneDay;
    }
    if (
      schedule.frequency === "specific_dates" &&
      schedule.dates.length === 0
    ) {
      newErrors.dates = translations.selectAtLeastOneDate;
    }
    if (!schedule.startDate) {
      newErrors.startDate = translations.required;
    }
    if (!schedule.durationDays && !schedule.endDate) {
      newErrors.duration = translations.required;
    }
    const timeErrors: string[] = [];

    schedule.times.forEach((item, index) => {
      const errorsForIndex: string[] = [];

      if (
        !item.time ||
        !/^(?:[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(item.time)
      ) {
        errorsForIndex.push(translations.invalidTime);
      }

      const dosageNumber = parseFloat(item.dosage);
      if (!item.dosage || isNaN(dosageNumber) || dosageNumber <= 0) {
        errorsForIndex.push(translations.invalidQuantity);
      }

      if (!item.unit) {
        errorsForIndex.push(translations.selectMeasureType);
      }

      timeErrors[index] =
        errorsForIndex.length > 0 ? errorsForIndex.join(", ") : "";
    });

    if (timeErrors.some((e) => !!e)) {
      newErrors.time = timeErrors;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  if (!schedule) {
    return <Text style={styles.label}>{translations.noMedicationsFound}</Text>;
  }

  const formItems = [
    {
      key: "duration",
      label: translations.courseDuration,
      render: () => (
        <ScheduleDuration
          startDate={schedule.startDate}
          endDate={schedule.endDate}
          durationDays={schedule.durationDays}
          onStartDateChange={updateStartDate}
          onEndDateChange={updateEndDate}
          onDurationDaysChange={updateDurationDays}
          errors={{
            startDate: errors.startDate,
            duration: errors.duration,
          }}
        />
      ),
    },
    {
      key: "frequency",
      label: translations.courseFrequency,
      render: () => (
        <ScheduleFrequency
          frequency={schedule.frequency}
          days={schedule.days}
          dates={schedule.dates}
          onFrequencyChange={updateFrequency}
          onDaysChange={updateDays}
          onDatesChange={updateDates}
          errors={{
            days: errors.days,
            dates: errors.dates,
          }}
        />
      ),
    },
    {
      key: "times",
      label: translations.courseTimesByDay,
      render: () => (
        <ScheduleTimes
          times={schedule.times}
          medicationForm={form}
          onAddTime={addTime}
          onTimeChange={(index, time) => {
            updateTime(index, time.trim());
          }}
          onDosageChange={(index, dosage) => updateDosage(index, dosage)}
          onUnitChange={(index, unit) => updateUnit(index, unit)}
          onRemoveTime={(index) => removeTime(index)}
          isRemovable={schedule.times.length > 1}
          errors={{ time: errors.time }}
        />
      ),
    },
    {
      key: "mealRelation",
      label: translations.courseMealRealation,
      render: () => (
        <ScheduleMealRelation
          mealRelation={schedule.mealRelation}
          onMealRelationChange={updateMealRelation}
        />
      ),
    },
  ];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? -30 : 1}
    >
      {medication && (
        <View style={styles.medicationItem}>
          <View style={styles.medicationIcon}>
            <MedicationIcon
              iconName={medication.iconName || "Pill"}
              color={medication.iconColor || colors.primary}
              size={24}
            />
          </View>
          <View style={styles.medicationInfo}>
            <Text style={styles.medicationName}>{medication.name}</Text>
            <Text style={styles.medicationDosage}>
              {MedicationForms[medication.form]}
              {medication.dosage ? `, ${medication.dosage}` : ""}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.container}>
        <View style={{ height: "85%" }}>
          <Animated.FlatList
            data={formItems}
            keyExtractor={(item) => item.key}
            ListHeaderComponent={
              <View style={{ height: CENTER_SPACER - 100 }} />
            }
            ListFooterComponent={
              <View style={{ height: CENTER_SPACER - 100 }} />
            }
            showsVerticalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: true }
            )}
            renderItem={({ item, index }) => {
              const inputRange = [
                (index - 1) * ITEM_HEIGHT,
                index * ITEM_HEIGHT,
                (index + 1) * ITEM_HEIGHT,
              ];
              const opacity = scrollY.interpolate({
                inputRange,
                outputRange: [0.5, 1, 0.5],
                extrapolate: "clamp",
              });

              return (
                <Animated.View style={[styles.itemContainer, { opacity }]}>
                  <Text style={styles.label}>{item.label}</Text>
                  {item.render()}
                </Animated.View>
              );
            }}
            getItemLayout={(_, index) => ({
              length: ITEM_HEIGHT,
              offset: ITEM_HEIGHT * index,
              index,
            })}
          />
          <LinearGradient
            colors={["rgba(248, 249, 250, 0.5)", "rgba(255, 255, 255, 0)"]}
            style={[styles.gradient, { top: 0, height: "20%" }]}
            pointerEvents="none"
          />
        </View>
        {!keyboardShown && (
          <>
            <View style={styles.buttonContainer}>
              <Button
                title={translations.saveEdit}
                onPress={handleSave}
                style={styles.saveButton}
              />
              <Button
                title={translations.cancelEdit}
                onPress={handleCancel}
                variant="outline"
              />
            </View>

            <LinearGradient
              colors={["rgba(255, 255, 255, 0)", "rgba(248, 249, 250, 1)"]}
              style={[styles.gradient, { bottom: 0, height: "30%" }]}
              pointerEvents="none"
            />
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  itemContainer: {
    paddingHorizontal: 22,
    justifyContent: "center",
    marginVertical: 20,
  },
  label: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 18,
    color: colors.text,
  },
  gradient: {
    position: "absolute",
    width: "100%",
    zIndex: 1,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    zIndex: 2,
  },
  saveButton: {
    marginBottom: 12,
  },
  medicationItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
  medicationInfo: {
    flex: 1,
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
});
