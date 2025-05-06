import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi } from "@/api/auth-api";
import { User } from "@/types";
import { useMedicationStore } from "./medication-store";
import { useSettingsStore } from "./settings-store";
import { useNotificationStore } from "./notification-store";
import { cancelAllNotifications } from "@/utils/notification-utils";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    id: string,
    name: string,
    email: string,
    password: string
  ) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  updatePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const { auth_token } = await authApi.login({ email, password });

          const user = await authApi.getCurrentUser(auth_token);
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });

          await AsyncStorage.setItem("auth_token", auth_token);
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      signup: async (
        id: string,
        name: string,
        email: string,
        password: string
      ) => {
        set({ isLoading: true });
        try {
          const user = await authApi.register({ id, name, email, password });
          set({ user, isLoading: false });

          await get().login(email, password);
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      updateProfile: async (data: Partial<User>) => {
        set({ isLoading: true });
        try {
          const token = await AsyncStorage.getItem("auth_token");
          if (!token) throw new Error("Not authenticated");

          const updatedUser = await authApi.updateUser(data, token);
          set({ user: updatedUser, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      updatePassword: async (currentPass: string, newPass: string) => {
        set({ isLoading: true });
        try {
          const token = await AsyncStorage.getItem("auth_token");
          if (!token) throw new Error("Not authenticated");

          await authApi.changePassword(
            { current_password: currentPass, new_password: newPass },
            token
          );
          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          const token = await AsyncStorage.getItem("auth_token");
          if (token) {
            await authApi.logout(token);
          }
        } finally {
          cancelAllNotifications();
          await AsyncStorage.multiRemove([
            "auth_token",
            "auth-storage",
            "medication-storage",
            "settings-storage",
            "notification-storage",
          ]);
          set({ user: null, isAuthenticated: false });
          useMedicationStore.setState({
            medications: [],
            schedules: [],
            intakes: [],
            draftSchedules: {},
          });
          useSettingsStore.setState({
            notificationSettings: {
              id: "",
              medicationRemindersEnabled: true,
              minutesBeforeScheduledTime: 15,
              lowStockRemindersEnabled: true,
            },
          });
          useNotificationStore.setState({
            notifications: {}
          })
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
