import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi } from "@/api/auth-api";
import { User } from "@/types";

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
          await AsyncStorage.removeItem("auth_token");
          set({ user: null, isAuthenticated: false });
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
