import { Stack } from "expo-router";
import { translations } from "@/constants/translations";

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="edit"
        options={{ headerShown: true, title: translations.editProfile }}
      />
      <Stack.Screen
        name="notifications"
        options={{ headerShown: true, title: translations.notifications }}
      />
      <Stack.Screen
        name="statistics"
        options={{ headerShown: true, title: translations.statistics }}
      />
      <Stack.Screen
        name="help"
        options={{ headerShown: true, title: translations.statistics }}
      />
    </Stack>
  );
}
