import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { aiRaceApi } from "@/api/aiRace";

export function useAiRaceLeaderboard(limit?: number) {
  return useQuery({
    queryKey: ["aiRace", "leaderboard", limit],
    queryFn: () => aiRaceApi.getLeaderboard(limit),
    select: (response) => response.data,
    staleTime: 60 * 1000,
  });
}

export function useAgentRaceTrades(
  agentId?: string,
  options?: { status?: string; limit?: number }
) {
  return useQuery({
    queryKey: ["aiRace", "trades", agentId, options?.status, options?.limit],
    queryFn: () => aiRaceApi.getAgentTrades(agentId!, options),
    select: (response) => response.data,
    enabled: Boolean(agentId),
    staleTime: 30 * 1000,
  });
}

export function useRunAiRaceCycle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => aiRaceApi.runCycle(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aiRace", "leaderboard"] });
    },
  });
}



