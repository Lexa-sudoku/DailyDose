import { Medication, MedicationIntake, MedicationSchedule } from "@/types";
import { apiRequest } from "./api-controller";

export const medicationApi = {
  // Medications
  async getMedications(authToken: string): Promise<Medication[]> {
    return apiRequest<Medication[]>("/api/medications/", {
      method: "GET",
      headers: {
        Authorization: `Token ${authToken}`,
      },
    });
  },

  async createMedication(
    medication: Medication,
    authToken: string
  ): Promise<Medication> {
    return apiRequest<Medication>("/api/medications/", {
      method: "POST",
      body: medication,
      headers: {
        Authorization: `Token ${authToken}`,
      },
    });
  },

  async updateMedication(
    id: string,
    updates: Partial<Medication>,
    authToken: string
  ): Promise<Medication> {
    return apiRequest<Medication>(`/api/medications/${id}/`, {
      method: "PATCH",
      body: updates,
      headers: {
        Authorization: `Token ${authToken}`,
      },
    });
  },

  async deleteMedication(id: string, authToken: string): Promise<void> {
    return apiRequest<void>(`/api/medications/${id}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Token ${authToken}`,
      },
    });
  },

  // Schedules
  async getSchedules(authToken: string): Promise<MedicationSchedule[]> {
    return apiRequest<MedicationSchedule[]>("/api/schedules/", {
      method: "GET",
      headers: {
        Authorization: `Token ${authToken}`,
      },
    });
  },

  async createSchedule(
    schedule: MedicationSchedule,
    authToken: string
  ): Promise<MedicationSchedule> {
    try {
      return apiRequest<MedicationSchedule>("/api/schedules/", {
        method: "POST",
        body: schedule,
        headers: {
          Authorization: `Token ${authToken}`,
        },
      });
    } catch (error) {
      throw error;
    }
  },

  async updateSchedule(
    id: string,
    updates: Partial<MedicationSchedule>,
    authToken: string
  ): Promise<MedicationSchedule> {
    return apiRequest<MedicationSchedule>(`/api/schedules/${id}/`, {
      method: "PATCH",
      body: updates,
      headers: {
        Authorization: `Token ${authToken}`,
      },
    });
  },

  async deleteSchedule(id: string, authToken: string): Promise<void> {
    return apiRequest<void>(`/api/schedules/${id}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Token ${authToken}`,
      },
    });
  },

  // Intakes
  async getIntakes(authToken: string): Promise<MedicationIntake[]> {
    return apiRequest<MedicationIntake[]>("/api/intakes/", {
      method: "GET",
      headers: {
        Authorization: `Token ${authToken}`,
      },
    });
  },

  async createIntake(
    intake: MedicationIntake,
    authToken: string
  ): Promise<MedicationIntake> {
    return apiRequest<MedicationIntake>("/api/intakes/", {
      method: "POST",
      body: intake,
      headers: {
        Authorization: `Token ${authToken}`,
      },
    });
  },

  async updateIntake(
    id: string,
    updates: Partial<MedicationIntake>,
    authToken: string
  ): Promise<MedicationIntake> {
    return apiRequest<MedicationIntake>(`/api/intakes/${id}/`, {
      method: "PATCH",
      body: updates,
      headers: {
        Authorization: `Token ${authToken}`,
      },
    });
  },

  async deleteIntake(id: string, authToken: string): Promise<void> {
    return apiRequest<void>(`/api/intakes/${id}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Token ${authToken}`,
      },
    });
  },
};
