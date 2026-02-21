import { apiClient } from "./client";
import { Activity } from "@/types/api";

export const activityApi = {
  getActivity: async (filters?: { type?: string; limit?: number; page?: number }): Promise<Activity[]> => {
    const response = await apiClient.get<Activity[]>("/activity", filters);
    // apiClient.get returns ApiResponse<T> which is { data: T, success: boolean }
    // So response.data should be the Activity[] array
    return Array.isArray(response.data) ? response.data : [];
  },

  getBetDetail: async (transactionId: string) => {
    const response = await apiClient.get("/activity/bet/" + encodeURIComponent(transactionId));
    return response.data;
  },

  getActivityCount: async (): Promise<number> => {
    const response = await apiClient.get<{ count: number }>("/activity/count");
    return response.data.count;
  },
};

