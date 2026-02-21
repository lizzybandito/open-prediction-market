import { useQuery } from "@tanstack/react-query";
import { predictionsApi } from "@/api/predictions";

export const useMyPredictions = () => {
  return useQuery({
    queryKey: ["predictions", "me"],
    queryFn: () => predictionsApi.getMyPredictions(),
    refetchInterval: 2000, // Refresh every 2 seconds for real-time prices (same as market page)
    staleTime: 1000, // Consider data stale after 1 second
    refetchIntervalInBackground: true, // Keep refreshing even when tab is in background
  });
};

export const useActivePredictions = () => {
  return useQuery({
    queryKey: ["predictions", "active"],
    queryFn: () => predictionsApi.getActivePredictions(),
  });
};

export const useResolvedPredictions = (filters?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ["predictions", "resolved", filters],
    queryFn: () => predictionsApi.getResolvedPredictions(filters),
  });
};

