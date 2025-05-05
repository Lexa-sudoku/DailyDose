import { Redirect } from "expo-router";
import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useOnboardingStore } from "@/store/onboarding-store";
import { useMedicationStore } from "@/store/medication-store";
import { useSettingsStore } from "@/store/settings-store";
import { cleanupExpiredCourseNotifications } from "@/utils/notification-utils";
import NetInfo from "@react-native-community/netinfo";
import { Alert } from "react-native";

export default function Index() {
  const { isAuthenticated } = useAuthStore();
  const { hasCompletedOnboarding } = useOnboardingStore();

  useEffect(() => {
    if (!isAuthenticated || !hasCompletedOnboarding) return;

    const loadAppData = async () => {
      const networkState = await NetInfo.fetch();

      if (!networkState.isConnected) {
        Alert.alert("Нет сети", "Некоторые данные могут быть неактуальными", [
          { text: "OK" },
        ]);
        return;
      }

      try {
        await Promise.all([
          useMedicationStore.getState().loadMedications(),
          useMedicationStore.getState().loadSchedules(),
          useMedicationStore.getState().loadIntakes(),
          useSettingsStore.getState().loadNotificationSettings(),
        ]);

        cleanupExpiredCourseNotifications();
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
        Alert.alert("Ошибка", "Не удалось обновить данные");
      }
    };

    loadAppData();
  }, [isAuthenticated, hasCompletedOnboarding]);

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!hasCompletedOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)/calendar" />;
}
