import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NotificationSettings } from "@/types";
import { notificationApi } from "@/api/settings-api";
import { useAuthStore } from "@/store/auth-store";

interface SettingsState {
  notificationSettings: NotificationSettings;
  setDefaultSettings: () => Promise<void>;
  loadNotificationSettings: () => Promise<void>;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
}

const DEFAULT_NOTIFICATION_SETTINGS: Omit<NotificationSettings, "id"> = {
  medicationRemindersEnabled: true,
  minutesBeforeScheduledTime: 15,
  lowStockRemindersEnabled: true,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      notificationSettings: {
        id: "",
        ...DEFAULT_NOTIFICATION_SETTINGS,
      },

      setDefaultSettings: async () => {
        try {
          const token = await AsyncStorage.getItem("auth_token");
          if (!token) throw new Error("Not authenticated");

          const newSettings = await notificationApi.createNotificationSettings(
            DEFAULT_NOTIFICATION_SETTINGS,
            token
          );
          set({ notificationSettings: newSettings });
        } catch (error) {
          console.error("Failed to create notification settings", error);
        }
      },

      loadNotificationSettings: async () => {
        try {
          const token = await AsyncStorage.getItem("auth_token");
          if (!token) throw new Error("Not authenticated");

          const settings = await notificationApi.getNotificationSettings(token);
          set({ notificationSettings: settings[0] });
        } catch (error) {
          console.error("Failed to load notification settings", error);
        }
      },

      updateNotificationSettings: async (settings) => {
        try {
          const token = await AsyncStorage.getItem("auth_token");
          if (!token) throw new Error("Not authenticated");

          const currentSettingsId = useAuthStore.getState().user!.id;
          const updatedSettings =
            await notificationApi.updateNotificationSettings(
              currentSettingsId,
              settings,
              token
            );
          set({
            notificationSettings: updatedSettings,
          });
        } catch (error) {
          console.error("Failed to update notification settings", error);
        }
      },
    }),
    {
      name: "settings-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
