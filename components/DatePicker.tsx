import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { X } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { translations } from "@/constants/translations";
import { format, lastDayOfMonth } from "date-fns";
import { Button } from "./Button";

interface DatePickerProps {
  onSelect: (date: string) => void;
  onCancel: () => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  onSelect,
  onCancel,
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const numLastDayOfMonth = new Date(lastDayOfMonth(selectedDate)).getDay();

  // Преобразуем воскресенье (0) в 7, чтобы неделя начиналась с понедельника
  const adjustedFirstDay = firstDayOfMonth === 0 ? 7 : firstDayOfMonth;
  const adjustedLastDay = numLastDayOfMonth === 0 ? 7 : numLastDayOfMonth;

  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    setSelectedDate(newDate);
  };

  const handleConfirm = () => {
    onSelect(format(selectedDate, "yyyy-MM-dd"));
  };

  const isSelectedDate = (day: number) => {
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth.getMonth() &&
      selectedDate.getFullYear() === currentMonth.getFullYear()
    );
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth.getMonth() &&
      today.getFullYear() === currentMonth.getFullYear()
    );
  };

  const renderDays = () => {
    const days = [];
    const dayNames = [
      translations.mon,
      translations.tue,
      translations.wed,
      translations.thu,
      translations.fri,
      translations.sat,
      translations.sun,
    ];

    for (let i = 0; i < 7; i++) {
      days.push(
        <Text key={`header-${i}`} style={styles.dayName}>
          {dayNames[i]}
        </Text>
      );
    }

    // Пустые ячейки перед первым днем месяца
    for (let i = 1; i < adjustedFirstDay; i++) {
      days.push(<View key={`emptyStart-${i}`} style={styles.emptyDay} />);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(
        <TouchableOpacity
          key={`day-${i}`}
          style={[
            styles.day,
            isSelectedDate(i) && styles.selectedDay,
            isToday(i) && !isSelectedDate(i) && styles.today,
          ]}
          onPress={() => handleDateSelect(i)}
        >
          <Text
            style={[
              styles.dayText,
              isSelectedDate(i) && styles.selectedDayText,
              isToday(i) && !isSelectedDate(i) && styles.todayText,
            ]}
          >
            {i}
          </Text>
        </TouchableOpacity>
      );
    }

    // Пустые ячейки после последнего дня месяца
    for (let i = adjustedLastDay; i < 7; i++) {
      days.push(<View key={`emptyEnd-${i}`} style={styles.emptyDay} />);
    }

    return days;
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={true}
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>{translations.selectDate}</Text>
            <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
              <X size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={prevMonth} style={styles.navButton}>
              <Text style={styles.navButtonText}>{"<"}</Text>
            </TouchableOpacity>
            <Text style={styles.monthYear}>
              {currentMonth.toLocaleDateString("ru-RU", {
                month: "long",
                year: "numeric",
              })}
            </Text>
            <TouchableOpacity onPress={nextMonth} style={styles.navButton}>
              <Text style={styles.navButtonText}>{">"}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.calendar}>{renderDays()}</View>

          <View style={styles.footer}>
            <Button
              title={translations.cancel}
              onPress={onCancel}
              variant="outline"
              style={styles.footerButton}
            />
            <Button
              title={translations.confirm}
              onPress={handleConfirm}
              style={styles.footerButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
  },
  navButtonText: {
    fontSize: 18,
    color: colors.primary,
  },
  monthYear: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
  },
  calendar: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  dayName: {
    width: "14.28%",
    textAlign: "center",
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  day: {
    width: "14.28%",
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  emptyDay: {
    width: "14.28%",
    height: 40,
  },
  dayText: {
    fontSize: 14,
    color: colors.text,
  },
  selectedDay: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    width: "11.68%",
    marginLeft: "1.3%",
    marginRight: "1.3%",
  },
  selectedDayText: {
    color: colors.white,
    fontWeight: "700",
  },
  today: {
    borderRadius: 20,
    width: "11.68%",
    marginLeft: "1.3%",
    marginRight: "1.3%",
  },
  todayText: {
    color: colors.primary,
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  footerButton: {
    marginLeft: 8,
    minWidth: 100,
  },
});
