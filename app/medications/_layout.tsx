import { BackButton } from "@/components/BackButton";
import { translations } from "@/constants/translations";
import { Stack } from "expo-router";

export default function MedicationsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="add"
        options={{
          headerShown: true,
          title: translations.addMedication,
          headerLeft: () => <BackButton />,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: true,
          title: translations.editMedication,
          headerLeft: () => <BackButton />,
        }}
      />
    </Stack>
  );
}
