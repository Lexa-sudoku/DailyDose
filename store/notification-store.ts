import { create } from "zustand";
import { CourseNotificationMap } from "@/types";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface NotificationStore {
  notifications: CourseNotificationMap;
  setNotifications: (scheduleId: string, identifiers: string[]) => void;
  clearNotifications: (scheduleId: string) => void;
  getNotifications: (scheduleId: string) => string[];
  clearAllNotifications: () => void;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: {},

      setNotifications: (scheduleId, identifiers) =>
        set((state) => ({
          notifications: {
            ...state.notifications,
            [scheduleId]: identifiers,
          },
        })),

      clearNotifications: (scheduleId) =>
        set((state) => {
          const updated = { ...state.notifications };
          delete updated[scheduleId];
          return { notifications: updated };
        }),

      getNotifications: (scheduleId) => {
        return get().notifications[scheduleId] || [];
      },

      clearAllNotifications: () => {
        set({ notifications: {} });
      },
    }),
    {
      name: "onboarding-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
