import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { format, addWeeks, subWeeks, isSameDay } from "date-fns";
import { getMonthName, getDayName, getWeekDays } from "@/utils/date-utils";

interface CalendarViewProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  markedDates: Record<string, { marked: boolean; dotColor?: string }>;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  selectedDate,
  onDateSelect,
  markedDates,
}) => {
  const today = new Date();

  // Начинаем с понедельника текущей недели
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const monday = new Date(selectedDate);
    const day = monday.getDay() || 7; // Преобразуем 0 (воскресенье) в 7
    monday.setDate(monday.getDate() - (day - 1)); // Получаем понедельник
    return monday;
  });

  // Обновляем заголовок месяц/год при изменении недели
  const [headerDate, setHeaderDate] = useState(selectedDate);

  useEffect(() => {
    // Определяем, какая дата должна отображаться в заголовке
    // Если неделя охватывает два месяца, показываем месяц выбранной даты
    setHeaderDate(selectedDate);
  }, [selectedDate]);

  // Получаем дни недели, начиная с понедельника
  const days = getWeekDays(currentWeekStart);

  const goToPreviousWeek = () => {
    const newWeekStart = subWeeks(currentWeekStart, 1);
    setCurrentWeekStart(newWeekStart);
  };

  const goToNextWeek = () => {
    const newWeekStart = addWeeks(currentWeekStart, 1);
    setCurrentWeekStart(newWeekStart);
  };

  const formatDateKey = (date: Date) => format(date, "yyyy-MM-dd");

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.monthYear}>
          {getMonthName(headerDate.getMonth())} {headerDate.getFullYear()}
        </Text>
        <View style={styles.navigationButtons}>
          <TouchableOpacity style={styles.navButton} onPress={goToPreviousWeek}>
            <ChevronLeft size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={goToNextWeek}>
            <ChevronRight size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.daysContainer}
      >
        {days.map((day) => {
          const dateKey = formatDateKey(day);
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, today);
          const isMarked = markedDates[dateKey]?.marked;
          const dotColor = markedDates[dateKey]?.dotColor || colors.primary;

          return (
            <View key={dateKey} style={[styles.dayContainer]}>
              <TouchableOpacity
                key={dateKey}
                style={styles.dayButton}
                onPress={() => onDateSelect(day)}
              >
                <Text style={[styles.dayName]}>{getDayName(day.getDay())}</Text>
                <View
                  style={[
                    styles.dayNumberContainer,
                    isSelected && styles.selectedDayNumberContainer,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayNumber,
                      isSelected && styles.selectedDayText,
                      isToday && !isSelected && styles.todayText,
                    ]}
                  >
                    {format(day, "d")}
                  </Text>
                </View>
              </TouchableOpacity>
              {isMarked && (
                <View style={[styles.dot, { backgroundColor: dotColor }]} />
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingLeft: 8,
  },
  monthYear: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  navigationButtons: {
    flexDirection: "row",
  },
  navButton: {
    padding: 4,
    marginLeft: 8,
  },
  daysContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flex: 1,
  },
  dayButton: {
    alignItems: "center",
    justifyContent: "flex-start",
    width: 45,
    height: 60,
    marginHorizontal: 4,
  },
  dayName: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  dayNumberContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 4,
  },
  selectedDayNumberContainer: {
    backgroundColor: colors.primary,
    borderRadius: 18,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  selectedDayText: {
    color: colors.white,
  },
  dayContainer: {
    alignItems: "center",
    height: 78,
  },
  dot: {
    width: 8,
    height: 4,
    borderRadius: 30,
    marginTop: 6,
  },
  todayText: {
    color: colors.primary,
  },
});
