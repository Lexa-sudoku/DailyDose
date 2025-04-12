import { Stack } from "expo-router";
import { translations } from "@/constants/translations";
import { BackButton } from "@/components/BackButton";

export default function RemindersLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="add"
        options={{
          headerShown: true,
          title: translations.addReminder,
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
          title: translations.editReminder,
          headerLeft: () => <BackButton />,
        }}
      />
    </Stack>
  );
}
