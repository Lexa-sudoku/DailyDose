import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Calendar } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { translations } from "@/constants/translations";
import { DatePicker } from "./DatePicker";
import { FrequencyType } from "@/types";

interface ScheduleFrequencyProps {
  frequency: FrequencyType;
  days: number[];
  dates: string[];
  onFrequencyChange: (frequency: FrequencyType) => void;
  onDaysChange: (days: number[]) => void;
  onDatesChange: (dates: string[]) => void;
  errors?: {
    days?: string;
    dates?: string;
  };
}

export const ScheduleFrequency: React.FC<ScheduleFrequencyProps> = ({
  frequency,
  days,
  dates,
  onFrequencyChange,
  onDaysChange,
  onDatesChange,
  errors = {},
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const frequencyOptions = [
    { value: "daily", label: translations.daily },
    { value: "every_other_day", label: translations.everyOtherDay },
    { value: "specific_days", label: translations.specificDays },
    { value: "specific_dates", label: translations.specificDates },
  ];

  const dayNames = [
    translations.mon,
    translations.tue,
    translations.wed,
    translations.thu,
    translations.fri,
    translations.sat,
    translations.sun,
  ];
  // Преобразуем дни недели из 0-6 (воскресенье-суббота) в 1-7 (понедельник-воскресенье)
  const adjustedDays = [1, 2, 3, 4, 5, 6, 0];

  const toggleDay = (day: number) => {
    if (days.includes(day)) {
      onDaysChange(days.filter((d) => d !== day));
    } else {
      onDaysChange([...days, day]);
    }
  };

  const handleAddDate = (date: string) => {
    if (!dates.includes(date)) {
      onDatesChange([...dates, date]);
    }
    setShowDatePicker(false);
  };

  const handleRemoveDate = (date: string) => {
    onDatesChange(dates.filter((d) => d !== date));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
  };

  return (
    <View style={styles.container}>
      <View style={styles.frequencyOptions}>
        {frequencyOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.frequencyButton,
              frequency === option.value && styles.frequencyButtonSelected,
            ]}
            onPress={() => onFrequencyChange(option.value as any)}
          >
            <Text
              style={[
                styles.frequencyButtonText,
                frequency === option.value &&
                  styles.frequencyButtonTextSelected,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {frequency === "specific_days" && (
        <View style={styles.daysContainer}>
          <View style={styles.daysButtons}>
            {adjustedDays.map((day, dayIndex) => (
              <TouchableOpacity
                key={dayIndex}
                style={[
                  styles.dayButton,
                  days.includes(day) && styles.dayButtonSelected,
                ]}
                onPress={() => toggleDay(day)}
              >
                <Text
                  style={[
                    styles.dayButtonText,
                    days.includes(day) && styles.dayButtonTextSelected,
                  ]}
                >
                  {dayNames[dayIndex]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.days && <Text style={styles.errorText}>{errors.days}</Text>}
        </View>
      )}

      {frequency === "specific_dates" && (
        <View style={styles.datesContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.datesScrollView}
          >
            <TouchableOpacity
              style={styles.addDateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Calendar size={20} color={colors.primary} />
              <Text style={styles.addDateText}>{translations.addDate}</Text>
            </TouchableOpacity>

            {dates.map((date) => (
              <TouchableOpacity
                key={date}
                style={styles.dateTag}
                onPress={() => handleRemoveDate(date)}
              >
                <Text style={styles.dateTagText}>{formatDate(date)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {errors.dates && <Text style={styles.errorText}>{errors.dates}</Text>}

          {showDatePicker && (
            <DatePicker
              onSelect={handleAddDate}
              onCancel={() => setShowDatePicker(false)}
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  frequencyOptions: {
    marginBottom: 14,
  },
  frequencyButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: colors.white,
  },
  frequencyButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  frequencyButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  frequencyButtonTextSelected: {
    color: colors.white,
  },
  daysContainer: { marginBottom: -7 },
  daysButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dayButton: {
    width: 45,
    height: 45,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 4,
    backgroundColor: colors.white,
  },
  dayButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayButtonText: {
    fontSize: 14,
    color: colors.text,
  },
  dayButtonTextSelected: {
    color: colors.white,
  },
  datesContainer: {},
  datesScrollView: {},
  addDateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: colors.white,
  },
  addDateText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 4,
  },
  dateTag: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.lightGray,
    borderRadius: 20,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  dateTagText: {
    fontSize: 14,
    color: colors.text,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
  },
});
