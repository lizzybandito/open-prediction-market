import { apiClient } from "./client";
import { LeaderboardEntry, LeaderboardFilters, PaginatedResponse } from "@/types/api";

export const leaderboardApi = {
  getLeaderboard: async (filters?: LeaderboardFilters): Promise<PaginatedResponse<LeaderboardEntry>> => {
    const response = await apiClient.get<PaginatedResponse<LeaderboardEntry>>("/leaderboard", filters);
    return response.data;
  },

  getMyRank: async (): Promise<{ rank: number; entry: LeaderboardEntry } | null> => {
    const response = await apiClient.get<{ rank: number; entry: LeaderboardEntry } | null>("/leaderboard/me");
    return response.data;
  },
};

