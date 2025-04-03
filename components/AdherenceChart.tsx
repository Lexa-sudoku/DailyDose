// todo график ломается

import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { colors } from "@/constants/colors";

interface AdherenceChartProps {
  data: { date: string; adherenceRate: number }[];
  height?: number;
}

export const AdherenceChart: React.FC<AdherenceChartProps> = ({
  data,
  height = 200,
}) => {
  const maxValue = 100; // Максимальное значение для шкалы (100%)
  const chartWidth = Dimensions.get("window").width - 48; // Ширина графика с учетом отступов
  const barWidth = Math.min(
    30,
    (chartWidth - (data.length - 1) * 8) / data.length,
  );

  const getBarColor = (value: number) => {
    if (value >= 80) return colors.success;
    if (value >= 50) return colors.warning;
    return colors.error;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.getDate().toString();
  };

  return (
    <View style={styles.container}>
      <View style={[styles.chartContainer, { height }]}>
        {/* Y-axis labels */}
        <View style={styles.yAxis}>
          <Text style={styles.axisLabel}>100%</Text>
          <Text style={styles.axisLabel}>75%</Text>
          <Text style={styles.axisLabel}>50%</Text>
          <Text style={styles.axisLabel}>25%</Text>
          <Text style={styles.axisLabel}>0%</Text>
        </View>

        {/* Chart grid */}
        <View style={styles.chartGrid}>
          <View style={[styles.gridLine, { top: 0 }]} />
          <View style={[styles.gridLine, { top: "25%" }]} />
          <View style={[styles.gridLine, { top: "50%" }]} />
          <View style={[styles.gridLine, { top: "75%" }]} />
          <View style={[styles.gridLine, { top: "100%" }]} />

          {/* Bars */}
          <View style={styles.barsContainer}>
            {data.map((item, index) => (
              <View key={index} style={styles.barItem}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${(item.adherenceRate / maxValue) * 100}%`,
                      backgroundColor: getBarColor(item.adherenceRate),
                      width: barWidth,
                    },
                  ]}
                />
                <Text style={styles.barLabel}>{formatDate(item.date)}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  chartContainer: {
    flexDirection: "row",
  },
  yAxis: {
    width: 40,
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingRight: 8,
  },
  axisLabel: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  chartGrid: {
    flex: 1,
    position: "relative",
  },
  gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.border,
  },
  barsContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: "100%",
    paddingTop: 8,
  },
  barItem: {
    alignItems: "center",
  },
  bar: {
    position: "absolute",
    bottom: 20, // Оставляем место для меток
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barLabel: {
    position: "absolute",
    bottom: 0,
    fontSize: 10,
    color: colors.textSecondary,
  },
});
