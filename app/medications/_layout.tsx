import { BackButton } from "@/components/BackButton";
import { translations } from "@/constants/translations";
import { Stack } from "expo-router";
import { Platform } from "react-native";

export default function MedicationsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="add"
        options={{
          headerShown: true,
          title: translations.addMedication,
          headerLeft: Platform.OS === "ios" ? () => <BackButton /> : undefined,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: true,
          title: translations.editMedication,
          headerLeft: Platform.OS === "ios" ? () => <BackButton /> : undefined,
        }}
      />
    </Stack>
  );
}
