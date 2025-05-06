import { NotificationSettings } from "@/types";
import { apiRequest } from "./api-controller";

export const notificationApi = {
  async getNotificationSettings(
    authToken: string
  ): Promise<NotificationSettings[]> {
    return apiRequest<NotificationSettings[]>("/api/notifications/", {
      method: "GET",
      headers: {
        Authorization: `Token ${authToken}`,
      },
    });
  },

  async createNotificationSettings(
    settings: Omit<NotificationSettings, "id">,
    authToken: string
  ): Promise<NotificationSettings> {
    return apiRequest<NotificationSettings>("/api/notifications/", {
      method: "POST",
      body: settings,
      headers: {
        Authorization: `Token ${authToken}`,
      },
    });
  },

  async updateNotificationSettings(
    id: string,
    updates: Partial<NotificationSettings>,
    authToken: string
  ): Promise<NotificationSettings> {
    return apiRequest<NotificationSettings>(`/api/notifications/${id}/`, {
      method: "PATCH",
      body: updates,
      headers: {
        Authorization: `Token ${authToken}`,
      },
    });
  },

  async deleteNotificationSettings(
    id: string,
    authToken: string
  ): Promise<void> {
    return apiRequest<void>(`/api/notifications/${id}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Token ${authToken}`,
      },
    });
  },
};
