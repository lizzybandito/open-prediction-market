import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { aiPicksApi } from "@/api/aiPicks";
import { AgentPick } from "@/types/api";

/**
 * Hook to fetch AI picks for a market
 */
export function useAIPicks(marketId: string | undefined) {
  return useQuery({
    queryKey: ["aiPicks", marketId],
    queryFn: () => aiPicksApi.getPicksForMarket(marketId!),
    enabled: !!marketId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to generate AI picks for a market
 */
export function useGenerateAIPicks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (marketId: string) => aiPicksApi.generatePicksForMarket(marketId),
    onSuccess: (response, marketId) => {
      // Update the cache with new picks
      queryClient.setQueryData(["aiPicks", marketId], response.data);
    },
  });
}

/**
 * Hook to get all AI picks
 */
export function useAllAIPicks(limit?: number) {
  return useQuery({
    queryKey: ["aiPicks", "all", limit],
    queryFn: () => aiPicksApi.getAllPicks(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to get available AI providers
 */
export function useAIProviders() {
  return useQuery({
    queryKey: ["aiPicks", "providers"],
    queryFn: () => aiPicksApi.getProviders(),
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

