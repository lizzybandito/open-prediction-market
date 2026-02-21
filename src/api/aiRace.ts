import { apiClient } from "./client";
import { AgentRaceStat, AgentRaceTrade, ApiResponse } from "@/types/api";

export const aiRaceApi = {
  getLeaderboard: async (limit?: number): Promise<ApiResponse<AgentRaceStat[]>> => {
    return apiClient.get<AgentRaceStat[]>("/ai-race/leaderboard", {
      limit,
    });
  },

  getAgentTrades: async (
    agentId: string,
    options?: { status?: string; limit?: number }
  ): Promise<ApiResponse<AgentRaceTrade[]>> => {
    return apiClient.get<AgentRaceTrade[]>(
      `/ai-race/agents/${agentId}/trades`,
      {
        status: options?.status,
        limit: options?.limit,
      }
    );
  },

  runCycle: async (): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.post<{ message: string }>("/ai-race/run");
  },
};



