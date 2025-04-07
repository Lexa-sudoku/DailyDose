import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { Stack, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Pill, Plus } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { CalendarView } from "@/components/CalendarView";
import { MedicationCard } from "@/components/MedicationCard";
import { EmptyState } from "@/components/EmptyState";
import { useMedicationStore } from "@/store/medication-store";
import { formatDate, formatTime} from "@/utils/date-utils";
import { translations } from "@/constants/translations";
import { Button } from "@/components/Button";

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const formattedDate = formatDate(selectedDate);

  const { getMedicationsByDate, getMedicationsForCalendar, recordIntake } =
    useMedicationStore();

  const medications = getMedicationsByDate(formattedDate);
  const sortedMedications = medications.slice().sort((a, b) => {
    const timeA = a.time.split(":").map(Number); // Разбиваем "HH:mm" в массив чисел
    const timeB = b.time.split(":").map(Number);
    return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]); // Сортируем по минутам с начала дня
  });

  const calendarData = getMedicationsForCalendar(formattedDate);

  const todayMedications = sortedMedications;

  // Подготавливаем отмеченные даты для календаря
  // todo отметки приходят через getMedicationsForCalendar который получает инфу только по текущей неделе, если перейти на новую неделю, не выбрав день, отметки не отрисовываются
  const markedDates: Record<string, { marked: boolean; dotColor: string }> = {};

  Object.keys(calendarData).forEach((date) => {
    const hasMissed = calendarData[date].some((med) => med.status === "missed");
    const hasPending = calendarData[date].some(
      (med) => med.status === "pending"
    );
    if (calendarData[date].length > 0) {
      markedDates[date] = {
        marked: true,
        dotColor: hasPending
          ? colors.warning
          : hasMissed
            ? colors.error
            : colors.success,
      };
    }
  });

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleMarkTaken = (scheduleId: string, medicationId: string) => {
    recordIntake(scheduleId, medicationId, formattedDate, "taken");
  };

  const handleMarkMissed = (scheduleId: string, medicationId: string) => {
    recordIntake(scheduleId, medicationId, formattedDate, "missed");
  };

  const navigateToAddReminder = () => {
    router.push({
      pathname: "/reminders/add",
    });
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    // Совпадающее время приема отображается только перед первой карточкой
    const showTime =
      index === 0 || item.time !== todayMedications[index - 1].time;
    return (
      <View>
        {showTime && <Text style={styles.time}>{formatTime(item.time)}</Text>}

        <MedicationCard
          medication={item}
          selectedDate={selectedDate}
          onMarkTaken={() =>
            handleMarkTaken(item.scheduleId, item.medicationId)
          }
          onMarkMissed={() =>
            handleMarkMissed(item.scheduleId, item.medicationId)
          }
        />
      </View>
    );
  };

  const renderEmptyState = () => (
    <EmptyState
      icon={<Pill size={40} color={colors.primary} />}
      title={translations.noMedicationsScheduled}
      description={translations.noMedicationsScheduledDesc}
      buttonTitle={translations.addReminder}
      onButtonPress={navigateToAddReminder}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <Stack.Screen
        options={{
          title: translations.medicationCalendar,
          headerRight: () => (
            <Button
              title={translations.add}
              onPress={navigateToAddReminder}
              variant="text"
              icon={<Plus size={18} color={colors.primary} />}
            />
          ),
        }}
      />

      <CalendarView
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        markedDates={markedDates}
      />

      <FlatList
        data={sortedMedications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  time: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: 16,
    textAlign: "center",
  },
});
