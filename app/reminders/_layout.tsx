import { Stack } from "expo-router";
import { translations } from "@/constants/translations";

export default function RemindersLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="add"
        options={{ headerShown: true, title: translations.addReminder }}
      />
      <Stack.Screen
        name="select-medication"
        options={{ headerShown: true, title: translations.selectMedication }}
      />
      <Stack.Screen
        name="[id]"
        options={{ headerShown: true, title: translations.editReminder }}
      />
    </Stack>
  );
}
