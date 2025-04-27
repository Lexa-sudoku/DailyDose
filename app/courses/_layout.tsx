import { Stack } from "expo-router";
import { translations } from "@/constants/translations";
import { BackButton } from "@/components/BackButton";
import React from "react";
import { Platform } from "react-native";

export default function CoursesLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="add"
        options={{
          headerShown: true,
          title: translations.addCourse,
          headerLeft: Platform.OS === "ios" ? () => <BackButton /> : undefined,
        }}
      />
      <Stack.Screen
        name="select-medication"
        options={{
          headerShown: true,
          title: translations.selectMedication,
          headerLeft: Platform.OS === "ios" ? () => <BackButton /> : undefined,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: true,
          title: translations.editCourse,
          headerLeft:  Platform.OS === "ios" ? () => <BackButton /> : undefined,
        }}
      />
    </Stack>
  );
}
