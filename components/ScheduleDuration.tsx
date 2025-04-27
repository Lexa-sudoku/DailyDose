import { colors } from "@/constants/colors";
import { translations } from "@/constants/translations";
import { Calendar } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Input } from "./Input";
import { DatePicker } from "./DatePicker";
import { addDays, differenceInCalendarDays, format, parseISO } from "date-fns";

interface ScheduleDurationProps {
  startDate: string;
  endDate?: string;
  durationDays?: number;
  onStartDateChange: (startDate: string) => void;
  onEndDateChange: (endDate: string) => void;
  onDurationDaysChange: (durationDays: number) => void;
  errors?: {
    startDate?: string;
    duration?: string;
  };
}

export const ScheduleDuration: React.FC<ScheduleDurationProps> = ({
  startDate,
  endDate,
  durationDays,
  onStartDateChange,
  onEndDateChange,
  onDurationDaysChange,
  errors = {},
}) => {
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [durationType, setDurationType] = useState<"endDate" | "durationDays">(
    "durationDays"
  );

  useEffect(() => {
    if (!startDate) return;

    if (durationType === "durationDays" && durationDays && durationDays > 0) {
      const newEnd = format(
        addDays(parseISO(startDate), durationDays - 1),
        "yyyy-MM-dd"
      );
      onEndDateChange(newEnd);
    }

    if (durationType === "endDate" && endDate) {
      const diff =
        differenceInCalendarDays(parseISO(endDate), parseISO(startDate)) + 1;
      onDurationDaysChange(diff > 0 ? diff : 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate]);

  return (
    <>
      <View>
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
              durationType === "endDate" && styles.durationTypeButtonSelected,
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
            onPress={() => setShowStartDatePicker(true)}
          >
            <Calendar size={18} color={colors.primary} />
            <Text style={styles.dateButtonText}>
              {startDate || translations.selectDate}
            </Text>
          </TouchableOpacity>
          {errors.startDate && (
            <Text style={styles.errorText}>{errors.startDate}</Text>
          )}
        </View>

        {durationType === "endDate" ? (
          <View style={styles.dateContainer}>
            <Text style={styles.dateLabel}>{translations.endDate}</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowEndDatePicker(true)}
            >
              <Calendar size={18} color={colors.primary} />
              <Text style={styles.dateButtonText}>
                {endDate || translations.selectDate}
              </Text>
            </TouchableOpacity>
            {errors.duration && (
              <Text style={styles.errorText}>{errors.duration}</Text>
            )}
          </View>
        ) : (
          <View style={styles.dateContainer}>
            <Text style={styles.dateLabel}>{translations.durationDays}</Text>
            <View style={styles.durationInputContainer}>
              <Input
                value={durationDays?.toString() || ""}
                onChangeText={(text) => {
                  const days = parseInt(text);
                  if (!isNaN(days) || text === "") {
                    const parsedDays = days || 0;
                    onDurationDaysChange(parsedDays);

                    // изменяем EndDate вычисляя по DurationDays
                    if (startDate && parsedDays > 0) {
                      const calculatedEnd = format(
                        addDays(parseISO(startDate), parsedDays - 1),
                        "yyyy-MM-dd"
                      );
                      onEndDateChange(calculatedEnd);
                    }
                  }
                }}
                keyboardType="numeric"
                placeholder={translations.enterDays}
                style={styles.durationInput}
                accessoryViewID="duration"
                error={errors.duration}
              />
            </View>
          </View>
        )}
      </View>
      {showStartDatePicker && (
        <DatePicker
          onSelect={(date) => {
            onStartDateChange(date);
            setShowStartDatePicker(false);
          }}
          onCancel={() => setShowStartDatePicker(false)}
        />
      )}

      {showEndDatePicker && (
        <DatePicker
          onSelect={(date) => {
            onEndDateChange(date);
            setShowEndDatePicker(false);
            // изменяем DurationDays на основе EndDate
            if (startDate) {
              const diff =
                differenceInCalendarDays(parseISO(date), parseISO(startDate)) +
                1;
              onDurationDaysChange(diff > 0 ? diff : 0);
            }
          }}
          onCancel={() => setShowEndDatePicker(false)}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  durationTypeContainer: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 16,
  },
  durationTypeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "flex-start",
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  durationTypeButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  durationTypeButtonText: {
    fontSize: 14,
    fontWeight: "600",
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
    backgroundColor: colors.white,
  },
  dateButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.text,
  },
  durationInputContainer: {
    marginBottom: -16,
    flexDirection: "row",
    alignItems: "center",
  },
  durationInput: {
    flex: 1,
    fontSize: 14,
  },
  daysText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 8,
  },
});
