import React, { useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActionSheetIOS,
} from "react-native";
import { Clock, Trash2, Plus, ChevronDown } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { Input } from "./Input";
import { translations } from "@/constants/translations";
import { Picker } from "@react-native-picker/picker";
import { UnitsByForm, MedicationForm } from "@/constants/medication";

interface ScheduleTimesProps {
  times: {
    time: string;
    dosage: string;
    unit: string;
  }[];
  medicationForm: MedicationForm;
  onTimeChange: (index: number, newTime: string) => void;
  onDosageChange: (index: number, dosage: string) => void;
  onUnitChange: (index: number, unit: string) => void;
  onAddTime: () => void;
  onRemoveTime: (index: number) => void;
  errors?: {
    time?: string[];
  };
  isRemovable: boolean;
}

export const ScheduleTimes: React.FC<ScheduleTimesProps> = ({
  times,
  medicationForm,
  onTimeChange,
  onDosageChange,
  onUnitChange,
  onAddTime,
  onRemoveTime,
  errors = {},
  isRemovable,
}) => {
  const unitOptions = useMemo(() => {
    return UnitsByForm[medicationForm] || [];
  }, [medicationForm]);

  const handleIOSPicker = (index: number) => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: [...unitOptions, translations.cancel],
        cancelButtonIndex: unitOptions.length,
      },
      (selectedIndex) => {
        if (selectedIndex < unitOptions.length) {
          onUnitChange(index, unitOptions[selectedIndex]);
        }
      }
    );
  };

  useEffect(() => {
    times.forEach((item, index) => {
      if (!item.unit && unitOptions.length > 0) {
        onUnitChange(index, unitOptions[0]);
      }
    });
  }, [onUnitChange, times, unitOptions]);

  return (
    <View style={styles.container}>
      {times.map((item, index) => (
        <View key={index}>
          <View style={styles.scheduleRow}>
            <Text style={styles.textRow}>
              {[translations.intake, " ", index + 1]}:
            </Text>
            <Input
              value={item.time}
              onChangeText={(text) => onTimeChange(index, text)}
              placeholder="HH:MM"
              leftIcon={<Clock size={20} color={colors.darkGray} />}
              style={styles.timeInput}
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

          <View style={styles.doseRow}>
            <Input
              value={item.dosage}
              onChangeText={(text) =>
                onDosageChange(index, text.replace(",", "."))
              }
              placeholder="Дозировка"
              style={styles.dosageInput}
              keyboardType="numeric"
              accessoryViewID={`dosageByTime${index}`}
            />
            {Platform.OS === "ios" ? (
              <TouchableOpacity
                style={styles.iosPickerButton}
                onPress={() => handleIOSPicker(index)}
              >
                <Text style={styles.iosPickerText}>
                  {item.unit || "Выбрать"}
                </Text>
                <ChevronDown size={16} color={colors.darkGray} />
              </TouchableOpacity>
            ) : (
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={item.unit}
                  style={styles.unitPicker}
                  onValueChange={(value) => onUnitChange(index, value)}
                >
                  {unitOptions.map((unit) => (
                    <Picker.Item label={unit} value={unit} key={unit} />
                  ))}
                </Picker>
              </View>
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
  scheduleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: -8,
  },
  textRow: {
    width: "30%",
    fontSize: 16,
    marginBottom: 14,
    marginLeft: 4,
    color: colors.textSecondary,
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
  doseRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dosageInput: {
    flex: 2,
    marginRight: 8,
  },
  pickerWrapper: {
    borderWidth: 1,
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    width: "40%",
    height: 50,
  },
  unitPicker: {
    flex: 1,
    borderWidth: 0,
    borderRadius: 12,
    paddingHorizontal: 12,
    alignItems: "center",
    fontSize: 16,
    color: colors.text,
    borderColor: colors.border,
  },
  iosPickerButton: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    justifyContent: "center",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: colors.white,
  },
  iosPickerText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
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
    marginBottom: 8,
  },
  addTimeText: {
    color: colors.primary,
    fontWeight: "500",
    marginLeft: 8,
  },
});
