import { Stack } from "expo-router";
import { translations } from "@/constants/translations";
import { BackButton } from "@/components/BackButton";
import React from "react";

export default function CoursesLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="add"
        options={{
          headerShown: true,
          title: translations.addCourse,
          headerLeft: () => <BackButton />,
        }}
      />
      <Stack.Screen
        name="select-medication"
        options={{
          headerShown: true,
          title: translations.selectMedication,
          headerLeft: () => <BackButton />,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: true,
          title: translations.editCourse,
          headerLeft: () => <BackButton />,
        }}
      />
    </Stack>
  );
}
