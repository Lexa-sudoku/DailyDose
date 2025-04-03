import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar, Pill, User, Bell, PieChart } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { translations } from "@/constants/translations";

export default function HelpScreen() {
  const helpItems = [
    {
      title: translations.calendarTab,
      icon: <Calendar size={24} color={colors.primary} />,
      description: translations.calendarTabDesc,
    },
    {
      title: translations.medicationsTab,
      icon: <Pill size={24} color={colors.primary} />,
      description: translations.medicationsTabDesc,
    },
    {
      title: translations.profileTab,
      icon: <User size={24} color={colors.primary} />,
      description: translations.profileTabDesc,
    },
    {
      title: translations.addingReminders,
      icon: <Bell size={24} color={colors.primary} />,
      description: translations.addingRemindersDesc,
    },
    {
      title: translations.trackingProgress,
      icon: <PieChart size={24} color={colors.primary} />,
      description: translations.trackingProgressDesc,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <Stack.Screen options={{ title: translations.helpAndSupport }} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>{translations.welcomeToDailyDose}</Text>
          <Text style={styles.subtitle}>{translations.appGuideDesc}</Text>
        </View>

        {helpItems.map((item, index) => (
          <View key={index} style={styles.helpItem}>
            <View style={styles.helpItemHeader}>
              <View style={styles.iconContainer}>{item.icon}</View>
              <Text style={styles.helpItemTitle}>{item.title}</Text>
            </View>
            <Text style={styles.helpItemDescription}>{item.description}</Text>
          </View>
        ))}

        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>{translations.needMoreHelp}</Text>
          <Text style={styles.contactText}>{translations.contactSupport}</Text>
          <Text style={styles.contactEmail}>support@dailydose.app</Text>
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
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  helpItem: {
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
  helpItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  helpItemTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  helpItemDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  contactSection: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    alignItems: "center",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 8,
  },
  contactEmail: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "500",
  },
});
