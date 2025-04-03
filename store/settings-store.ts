import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NotificationSettings } from "@/types";

interface SettingsState {
  notificationSettings: NotificationSettings;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
}

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  medicationRemindersEnabled: true,
  reminderTime: 15, // 15 минут до запланированного времени
  lowStockRemindersEnabled: true,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      notificationSettings: DEFAULT_NOTIFICATION_SETTINGS,

      updateNotificationSettings: (settings) => {
        set((state) => ({
          notificationSettings: {
            ...state.notificationSettings,
            ...settings,
          },
        }));
      },
    }),
    {
      name: "settings-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
