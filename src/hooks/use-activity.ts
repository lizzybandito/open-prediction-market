import { useQuery } from "@tanstack/react-query";
import { activityApi } from "@/api/activity";
import type { RecentBet } from "@/types/api";

export const useActivity = (filters?: { type?: string; limit?: number; page?: number }) => {
  return useQuery({
    queryKey: ["activity", filters],
    queryFn: () => activityApi.getActivity(filters),
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
    refetchOnWindowFocus: true, // Refetch when user returns to tab
  });
};

export const useActivityBetDetail = (transactionId?: string) => {
  return useQuery<RecentBet | null>({
    queryKey: ["activity", "bet", transactionId],
    enabled: !!transactionId,
    queryFn: async () => {
      if (!transactionId) return null;
      const data = await activityApi.getBetDetail(transactionId);
      return (data || null) as RecentBet | null;
    },
  });
};

export const useActivityCount = () => {
  return useQuery({
    queryKey: ["activity", "count"],
    queryFn: () => activityApi.getActivityCount(),
  });
};

