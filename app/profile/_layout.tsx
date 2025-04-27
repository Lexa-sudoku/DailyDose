import { Stack } from "expo-router";
import { translations } from "@/constants/translations";
import { BackButton } from "@/components/BackButton";
import { Platform } from "react-native";

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="edit"
        options={{
          headerShown: true,
          title: translations.editProfile,
          headerLeft: Platform.OS === "ios" ? () => <BackButton /> : undefined,
        }}
      />
      <Stack.Screen
        name="notifications"
        options={{
          headerShown: true,
          title: translations.notifications,
          headerLeft: Platform.OS === "ios" ? () => <BackButton /> : undefined,
        }}
      />
      <Stack.Screen
        name="statistics"
        options={{
          headerShown: true,
          title: translations.statistics,
          headerLeft: Platform.OS === "ios" ? () => <BackButton /> : undefined,
        }}
      />
      <Stack.Screen
        name="help"
        options={{
          headerShown: true,
          title: translations.statistics,
          headerLeft: Platform.OS === "ios" ? () => <BackButton /> : undefined,
        }}
      />
    </Stack>
  );
}
