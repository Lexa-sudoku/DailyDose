import { User } from "@/types";
import { apiRequest } from "./api-controller";

export interface AuthToken {
  auth_token: string;
}

export const authApi = {
  async register(userData: {
    id: string;
    name: string;
    email: string;
    password: string;
  }): Promise<User> {
    try {
      return await apiRequest<User>("/api/auth/users/", {
        method: "POST",
        body: userData,
      });
    } catch (error) {
      throw error;
    }
  },

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<AuthToken> {
    return apiRequest<AuthToken>("/api/auth/token/login/", {
      method: "POST",
      body: credentials,
    });
  },

  async logout(authToken: string): Promise<void> {
    return apiRequest<void>("/api/auth/token/logout/", {
      method: "POST",
      headers: {
        Authorization: `Token ${authToken}`,
      },
    });
  },

  async updateUser(
    userData: {
      name?: string;
      email?: string;
      photoUrl?: string;
    },
    authToken: string
  ): Promise<User> {
    return apiRequest<User>("/api/auth/users/me/", {
      method: "PATCH",
      body: userData,
      headers: {
        Authorization: `Token ${authToken}`,
      },
    });
  },

  async changePassword(
    passwords: {
      current_password: string;
      new_password: string;
    },
    authToken: string
  ): Promise<void> {
    return apiRequest<void>("/api/auth/users/set_password/", {
      method: "POST",
      body: passwords,
      headers: {
        Authorization: `Token ${authToken}`,
      },
    });
  },

  async getCurrentUser(authToken: string): Promise<User> {
    return apiRequest<User>("/api/auth/users/me/", {
      method: "GET",
      headers: {
        Authorization: `Token ${authToken}`,
      },
    });
  },

  async resetPassword(email: string): Promise<void> {
    return apiRequest<void>("/api/auth/users/reset_password/", {
      method: "POST",
      body: { email },
    });
  },

  async resetPasswordConfirm(data: {
    uid: string;
    token: string;
    new_password: string;
  }): Promise<void> {
    return apiRequest<void>("/api/auth/users/reset_password_confirm/", {
      method: "POST",
      body: data,
    });
  },
};
