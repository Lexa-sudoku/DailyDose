import { colors } from "@/constants/colors";
import { translations } from "@/constants/translations";
import { Calendar } from "lucide-react-native";
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Input } from "./Input";
import { DatePicker } from "./DatePicker";

interface ScheduleDurationProps {
  startDate: string;
  endDate?: string;
  durationDays?: number;
  onStartDateChange: (startDate: string) => void;
  onEndDateChange: (endDate: string) => void;
  onDurationDaysChange: (durationDays: number) => void;
  errors?: {
    startDate?: string;
    endDate?: string;
    durationDays?: string;
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

  return (
    <>
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
            {errors.endDate && (
              <Text style={styles.errorText}>{errors.endDate}</Text>
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
                    onDurationDaysChange(days || 0);
                  }
                }}
                keyboardType="numeric"
                placeholder={translations.enterDays}
                style={styles.durationInput}
              />
              <Text style={styles.daysText}></Text>
            </View>
            {errors.durationDays && (
              <Text style={styles.errorText}>{errors.durationDays}</Text>
            )}
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
          }}
          onCancel={() => setShowEndDatePicker(false)}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
    marginBottom: 16,
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
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: -8,
    marginBottom: 16,
  },
});
