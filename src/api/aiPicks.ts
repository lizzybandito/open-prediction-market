import { apiClient } from "./client";
import { ApiResponse, AgentPick } from "@/types/api";

export const aiPicksApi = {
  /**
   * Get AI picks for a specific market
   */
  getPicksForMarket: async (marketId: string): Promise<AgentPick[]> => {
    const response = await apiClient.get<AgentPick[]>(
      `/ai-picks/markets/${marketId}`
    );
    return response.data;
  },

  /**
   * Generate AI picks for a market
   */
  generatePicksForMarket: async (
    marketId: string
  ): Promise<ApiResponse<AgentPick[]>> => {
    return apiClient.post<AgentPick[]>(
      `/ai-picks/markets/${marketId}/generate`
    );
  },

  /**
   * Get all AI picks across all markets
   */
  getAllPicks: async (limit?: number): Promise<AgentPick[]> => {
    const response = await apiClient.get<AgentPick[]>(`/ai-picks`, {
      limit,
    });
    return response.data;
  },

  /**
   * Get available AI providers
   */
  getProviders: async (): Promise<string[]> => {
    const response = await apiClient.get<{ data: string[] }>(`/ai-picks/providers`);
    return response.data.data;
  },
};

