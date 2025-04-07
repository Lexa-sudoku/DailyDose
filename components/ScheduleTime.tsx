import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Clock, Trash2 } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { Input } from "./Input";
import { translations } from "@/constants/translations";

interface ScheduleTimeProps {
  time: string;
  onTimeChange: (time: string) => void;
  onRemove: () => void;
  isRemovable: boolean;
  errors?: {
    time?: string;
  }
}

export const ScheduleTime: React.FC<ScheduleTimeProps> = ({
  time,
  onTimeChange,
  onRemove,
  isRemovable,
  errors = {}
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.scheduleRow}>
        <Input
          value={time}
          onChangeText={onTimeChange}
          placeholder="HH:MM"
          leftIcon={<Clock size={20} color={colors.darkGray} />}
          style={styles.timeInput}
        />

        {isRemovable && (
          <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
            <Trash2 size={20} color={colors.error} />
            <Text style={styles.removeText}>{translations.removeCourse}</Text>
          </TouchableOpacity>
        )}
      </View>
      {errors.time && <Text style={styles.errorText}>{errors.time}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  scheduleNumber: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
    marginBottom: 8,
  },
  scheduleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeInput: {
    flex: 1,
    marginBottom: 0,
  },
  removeButton: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
    padding: 8,
  },
  removeText: {
    color: colors.error,
    marginLeft: 4,
    fontWeight: "500",
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
  },
});
