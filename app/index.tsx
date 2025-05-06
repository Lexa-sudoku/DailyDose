import { Redirect } from "expo-router";
import { useAuthStore } from "@/store/auth-store";
import { LoadData } from "@/hooks/useLoadData";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const { isAuthenticated, hasCompletedOnboarding, hydrated } = useAuthStore();

  LoadData();

  if (!hydrated) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!hasCompletedOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)/calendar" />;
}
