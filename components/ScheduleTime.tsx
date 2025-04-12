import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Clock, Trash2, Plus } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { Input } from "./Input";
import { translations } from "@/constants/translations";

interface ScheduleTimesProps {
  times: string[];
  onTimeChange: (index: number, newTime: string) => void;
  onAddTime: () => void;
  onRemoveTime: (index: number) => void;
  errors?: {
    time?: string[];
  };
  isRemovable: boolean;
}

export const ScheduleTimes: React.FC<ScheduleTimesProps> = ({
  times,
  onTimeChange,
  onAddTime,
  onRemoveTime,
  errors = {},
  isRemovable,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{translations.reminderTime}</Text>

      {times.map((time, index) => (
        <View key={index}>
          <View style={styles.scheduleRow}>
            <Input
              value={time}
              onChangeText={(text) => onTimeChange(index, text)}
              placeholder="HH:MM"
              leftIcon={<Clock size={20} color={colors.darkGray} />}
              style={styles.timeInput}
              // error={errors.time[index]}
            />

            {isRemovable && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => onRemoveTime(index)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Trash2 size={20} color={colors.error} />
              </TouchableOpacity>
            )}
          </View>
          {Array.isArray(errors.time) && errors.time[index] && (
              <Text style={styles.errorText}>{errors.time[index]}</Text>
            )}
        </View>
      ))}

      <TouchableOpacity onPress={onAddTime} style={styles.addTimeButton}>
        <Plus size={20} color={colors.primary} />
        <Text style={styles.addTimeText}>{translations.addTime}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
    marginBottom: 12,
  },
  scheduleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: -8,
  },
  timeInput: {
    flex: 1,
  },
  removeButton: {
    position: "relative",
    marginLeft: -40,
    marginRight: 20,
    marginBottom: 15,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginBottom: 8,
    marginLeft: 4,
    marginTop: -4,
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
});
