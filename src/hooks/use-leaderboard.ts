import { useQuery } from "@tanstack/react-query";
import { leaderboardApi } from "@/api/leaderboard";
import { LeaderboardFilters } from "@/types/api";

export const useLeaderboard = (filters?: LeaderboardFilters) => {
  return useQuery({
    queryKey: ["leaderboard", filters],
    queryFn: () => leaderboardApi.getLeaderboard(filters),
  });
};

export const useMyRank = () => {
  return useQuery({
    queryKey: ["leaderboard", "me"],
    queryFn: () => leaderboardApi.getMyRank(),
  });
};

