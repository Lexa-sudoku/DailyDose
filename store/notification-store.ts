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

      // удаляет запись вместе с scheduleId
      clearNotifications: (scheduleId) =>
        set((state) => {
          const updated = { ...state.notifications };
          delete updated[scheduleId];
          return { notifications: updated };
        }),

      getNotifications: (scheduleId) => {
        return get().notifications[scheduleId] || [];
      },

      // оставляет все scheduleId в notifications
      clearAllNotifications: () => {
        set((state) => {
          const updatedNotifications = Object.keys(state.notifications).reduce(
            (acc, scheduleId) => {
              acc[scheduleId] = [];
              return acc;
            },
            {} as CourseNotificationMap
          );

          return { notifications: updatedNotifications };
        });
      },
    }),
    {
      name: "notification-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
