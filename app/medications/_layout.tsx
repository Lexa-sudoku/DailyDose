import { Stack } from "expo-router";

export default function MedicationsLayout() {
  return (
    <Stack>
      <Stack.Screen name="add" options={{ headerShown: true }} />
      <Stack.Screen name="[id]" options={{ headerShown: true }} />
    </Stack>
  );
}
