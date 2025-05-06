import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useOnboardingStore } from "@/store/onboarding-store";
import { useMedicationStore } from "@/store/medication-store";
import { useSettingsStore } from "@/store/settings-store";
import {
  cleanupExpiredCourseNotifications,
  rescheduleAllCourseNotifications,
} from "@/utils/notification-utils";
import NetInfo from "@react-native-community/netinfo";
import { Alert } from "react-native";
import { getActiveScheduleIds } from "@/utils/course-utils";
import { useNotificationStore } from "@/store/notification-store";

export function LoadData() {
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

        const schedules = useMedicationStore.getState().schedules;
        const scheduleIds = getActiveScheduleIds(schedules);

        const setNotifications =
          useNotificationStore.getState().setNotifications;

        scheduleIds.forEach((scheduleId) => {
          setNotifications(scheduleId, []);
        });

        const minutesBefore =
          useSettingsStore.getState().notificationSettings
            .minutesBeforeScheduledTime;
        rescheduleAllCourseNotifications(minutesBefore);

        cleanupExpiredCourseNotifications();
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
        Alert.alert("Ошибка", "Не удалось обновить данные");
      }
    };

    loadAppData();
  }, [isAuthenticated, hasCompletedOnboarding]);
}
