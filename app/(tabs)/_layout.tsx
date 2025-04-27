import React from "react";
import { Tabs } from "expo-router";
import { Calendar, Pill, User } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { translations } from "@/constants/translations";
import { Platform } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.darkGray,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          height: Platform.OS === "ios" ? 80 : 60,
          paddingTop: 10,
        },
        headerStyle: {
          backgroundColor: colors.white,
        },
        headerTitleStyle: {
          color: colors.text,
          fontWeight: "600",
        },
        tabBarShowLabel: false, // Убираем подписи у иконок
      }}
    >
      <Tabs.Screen
        name="calendar"
        options={{
          title: translations.medicationCalendar,
          tabBarIcon: ({ color }: { color: string }) => (
            <Calendar size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="medications"
        options={{
          title: translations.myMedications,
          tabBarIcon: ({ color }: { color: string }) => (
            <Pill size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: translations.profile,
          tabBarIcon: ({ color }: { color: string }) => (
            <User size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
