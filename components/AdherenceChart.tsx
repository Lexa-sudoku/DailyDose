import React from "react";
import { Dimensions, View, Text, StyleSheet, ScrollView } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { colors } from "@/constants/colors";
import { LinearGradient } from "expo-linear-gradient";

interface Props {
  data: { date: string; adherenceRate: number }[];
  height?: number;
}

const screenWidth = Dimensions.get("window").width;

export const AdherenceChart: React.FC<Props> = ({ data, height = 180 }) => {
  const chartData = {
    labels: data.map((d, i) => (i % 3 === 0 ? d.date.slice(5) : "")), // 'MM-DD'
    datasets: [
      {
        data: data.map((d) => d.adherenceRate),
        color: () => colors.primary,
        strokeWidth: 2,
      },
    ],
  };

  const chartWidth = Math.max(screenWidth, data.length * 20); // ~60px на точку

  return (
    <>
      <Text style={styles.label}>Процент приёма, %</Text>
      <View style={{ position: "relative" }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 16 }}
        >
          <LineChart
            data={chartData}
            width={chartWidth}
            height={height}
            chartConfig={{
              backgroundGradientFrom: colors.white,
              backgroundGradientTo: colors.white,
              decimalPlaces: 0,
              color: () => colors.primary,
              labelColor: () => colors.textSecondary,
              propsForDots: {
                r: "4",
                strokeWidth: "2",
                stroke: colors.primary,
              },
            }}
            bezier
            style={{
              borderRadius: 16,
              marginLeft: -30,
            }}
          />
        </ScrollView>
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          colors={[colors.white, "rgba(255,255,255,0)"]}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 40,
          }}
          pointerEvents="none"
        />
        <LinearGradient
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 0 }}
          colors={[colors.white, "rgba(255,255,255,0)"]}
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: 40,
          }}
          pointerEvents="none"
        />
      </View>

      <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 8 }}>
        Проведите по графику вбок →
      </Text>
    </>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
});
