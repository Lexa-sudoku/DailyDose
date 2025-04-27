import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Stack, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Calendar,
  Pill,
  Bell,
  PieChart,
  ChevronRight,
} from "lucide-react-native";
import { colors } from "@/constants/colors";
import { Button } from "@/components/Button";
import { translations } from "@/constants/translations";
import { useOnboardingStore } from "@/store/onboarding-store";

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const { completeOnboarding } = useOnboardingStore();

  const steps = [
    {
      title: translations.welcomeToDailyDose,
      description: translations.onboardingWelcomeDesc,
      icon: <Pill size={60} color={colors.primary} />,
    },
    {
      title: translations.trackYourMedications,
      description: translations.onboardingTrackDesc,
      icon: <Calendar size={60} color={colors.primary} />,
    },
    {
      title: translations.neverMissADose,
      description: translations.onboardingRemindersDesc,
      icon: <Bell size={60} color={colors.primary} />,
    },
    {
      title: translations.monitorYourProgress,
      description: translations.onboardingProgressDesc,
      icon: <PieChart size={60} color={colors.primary} />,
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    completeOnboarding();
    router.replace("/(tabs)/calendar");
  };

  const handleSkip = () => {
    handleComplete();
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.skipContainer}>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>{translations.skip}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>{steps[currentStep].icon}</View>

        <Text style={styles.title}>{steps[currentStep].title}</Text>
        <Text style={styles.description}>{steps[currentStep].description}</Text>
      </View>

      <View style={styles.pagination}>
        {steps.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === currentStep && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <Button
          title={
            currentStep < steps.length - 1
              ? translations.next
              : translations.getStarted
          }
          onPress={handleNext}
          icon={
            currentStep < steps.length - 1 ? (
              <ChevronRight size={20} color={colors.white} />
            ) : undefined
          }
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  skipContainer: {
    alignItems: "flex-end",
    padding: 16,
  },
  skipText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "500",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.lightGray,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 32,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.mediumGray,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: colors.primary,
    width: 16,
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 32,
  },
  button: {
    width: "100%",
  },
});
