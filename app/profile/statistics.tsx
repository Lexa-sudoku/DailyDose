import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PieChart, AlertTriangle } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { translations } from "@/constants/translations";
import { useMedicationStore } from "@/store/medication-store";
import { AdherenceChart } from "@/components/AdherenceChart";
import { TimeRange } from "@/types";

export default function StatisticsScreen() {
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>({
    label: translations.last7Days,
    value: "7days",
  });

  const {
    getMedicationStats,
    getMedicationAdherenceByTimeRange,
    getMedicationAdherenceByDay,
  } = useMedicationStore();

  const getDaysFromTimeRange = (timeRange: string): number => {
    switch (timeRange) {
      case "7days":
        return 7;
      case "30days":
        return 30;
      case "3months":
        return 90;
      case "allTime":
      default:
        return 0; // 0 означает "все время"
    }
  };

  const days = getDaysFromTimeRange(selectedTimeRange.value);
  const stats = getMedicationStats(days);
  const adherenceByDay = getMedicationAdherenceByDay(days > 0 ? days : 7); // Для графика используем минимум 7 дней
  const medicationAdherence = getMedicationAdherenceByTimeRange(
    days > 0 ? days : 30,
  );

  const timeRanges: TimeRange[] = [
    { label: translations.last7Days, value: "7days" },
    { label: translations.last30Days, value: "30days" },
    { label: translations.last3Months, value: "3months" },
    { label: translations.allTime, value: "allTime" },
  ];

  const worstAdherenceMedications = [...medicationAdherence]
    .sort((a, b) => a.adherenceRate - b.adherenceRate)
    .slice(0, 3);

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.timeRangeContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {timeRanges.map((range) => (
              <TouchableOpacity
                key={range.value}
                style={[
                  styles.timeRangeButton,
                  selectedTimeRange.value === range.value &&
                    styles.timeRangeButtonSelected,
                ]}
                onPress={() => setSelectedTimeRange(range)}
              >
                <Text
                  style={[
                    styles.timeRangeText,
                    selectedTimeRange.value === range.value &&
                      styles.timeRangeTextSelected,
                  ]}
                >
                  {range.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <PieChart size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>
              {translations.medicationAdherence}
            </Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.total}</Text>
              <Text style={styles.statLabel}>{translations.total}</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.success }]}>
                {stats.taken}
              </Text>
              <Text style={styles.statLabel}>{translations.taken}</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.error }]}>
                {stats.missed}
              </Text>
              <Text style={styles.statLabel}>{translations.missed}</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {stats.adherenceRate.toFixed(0)}%
              </Text>
              <Text style={styles.statLabel}>{translations.adherence}</Text>
            </View>
          </View>

          <AdherenceChart data={adherenceByDay} height={180} />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AlertTriangle size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>{translations.mostMissed}</Text>
          </View>

          {worstAdherenceMedications.length > 0 ? (
            worstAdherenceMedications.map((medication, index) => (
              <View key={index} style={styles.medicationItem}>
                <Text style={styles.medicationName}>
                  {medication.medicationName}
                </Text>
                <View style={styles.adherenceContainer}>
                  <View
                    style={[
                      styles.adherenceBar,
                      {
                        width: `${medication.adherenceRate}%`,
                        backgroundColor:
                          medication.adherenceRate < 50
                            ? colors.error
                            : medication.adherenceRate < 80
                              ? colors.warning
                              : colors.success,
                      },
                    ]}
                  />
                  <Text style={styles.adherenceText}>
                    {medication.adherenceRate.toFixed(0)}%
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>
              Нет данных о пропущенных приемах
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  timeRangeContainer: {
    marginBottom: 16,
  },
  timeRangeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
    marginRight: 8,
  },
  timeRangeButtonSelected: {
    backgroundColor: colors.primary,
  },
  timeRangeText: {
    color: colors.text,
    fontWeight: "500",
  },
  timeRangeTextSelected: {
    color: colors.white,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statItem: {
    width: "48%",
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  medicationItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
    marginBottom: 8,
  },
  adherenceContainer: {
    height: 24,
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  adherenceBar: {
    height: "100%",
    position: "absolute",
    left: 0,
    top: 0,
  },
  adherenceText: {
    position: "absolute",
    right: 8,
    top: 3,
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: "italic",
    textAlign: "center",
    padding: 16,
  },
});
