import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  updatePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<void>;
  updatePhoto: (photoUrl: string) => Promise<void>;
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
          // В реальном приложении здесь был бы API-запрос
          // Для демо имитируем успешный вход
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const user: User = {
            id: "1",
            name: "Username",
            email,
          };

          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      signup: async (name: string, email: string, password: string) => {
        set({ isLoading: true });
        try {
          // В реальном приложении здесь был бы API-запрос
          // Для демо имитируем успешную регистрацию
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const user: User = {
            id: Date.now().toString(),
            name,
            email,
          };

          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      updateProfile: async (data: Partial<User>) => {
        set({ isLoading: true });
        try {
          // В реальном приложении здесь был бы API-запрос
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const currentUser = get().user;
          if (!currentUser) throw new Error("Пользователь не авторизован");

          const updatedUser = {
            ...currentUser,
            ...data,
          };

          set({ user: updatedUser, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      updatePassword: async (currentPassword: string, newPassword: string) => {
        set({ isLoading: true });
        try {
          // В реальном приложении здесь был бы API-запрос
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Просто имитируем успешное обновление пароля
          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      updatePhoto: async (photoUrl: string) => {
        set({ isLoading: true });
        try {
          const currentUser = get().user;
          if (!currentUser) throw new Error("Пользователь не авторизован");

          const updatedUser = {
            ...currentUser,
            photoUrl,
          };

          set({ user: updatedUser, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
