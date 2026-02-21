import { apiClient } from "./client";
import { Prediction, ResolvedPrediction } from "@/types/api";

export const predictionsApi = {
  getMyPredictions: async (): Promise<{ active: Prediction[]; resolved: ResolvedPrediction[] }> => {
    const response = await apiClient.get<{ active: Prediction[]; resolved: ResolvedPrediction[] }>(
      "/predictions/me"
    );
    return response.data;
  },

  getActivePredictions: async (): Promise<Prediction[]> => {
    const response = await apiClient.get<Prediction[]>("/predictions/active");
    return response.data;
  },

  getResolvedPredictions: async (filters?: { page?: number; limit?: number }): Promise<ResolvedPrediction[]> => {
    const response = await apiClient.get<ResolvedPrediction[]>("/predictions/resolved", filters);
    return response.data;
  },

  getPrediction: async (id: string): Promise<Prediction | ResolvedPrediction> => {
    const response = await apiClient.get<Prediction | ResolvedPrediction>(`/predictions/${id}`);
    return response.data;
  },
};

