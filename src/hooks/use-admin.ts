import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  adminApi,
  AdminUser,
  AdminMarket,
  AdminSeason,
  AdminStats,
  MarketSuggestion,
  AdminUserListParams,
  AdminAnalyticsOverview,
} from "@/api/admin";
import { toast } from "sonner";

export const useAdminStats = () => {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => adminApi.getStats(),
  });
};

export const useAdminUsers = (params?: AdminUserListParams) => {
  return useQuery({
    queryKey: ["admin", "users", params],
    queryFn: () => adminApi.getUsers(params),
  });
};

export const useAdminUserDetail = (userId?: string) => {
  return useQuery({
    queryKey: ["admin", "user-detail", userId],
    queryFn: () => {
      if (!userId) {
        throw new Error("userId is required");
      }
      return adminApi.getUser(userId);
    },
    enabled: !!userId,
  });
};

export const useAdminMarkets = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: ["admin", "markets", params],
    queryFn: () => adminApi.getMarkets(params),
  });
};

export const useAdminSeasons = () => {
  return useQuery({
    queryKey: ["admin", "seasons"],
    queryFn: () => adminApi.getSeasons(),
  });
};

// Import Polymarket markets
export const useImportPolymarket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { limit?: number; slug?: string }) => adminApi.importPolymarketEvents(params || {}),
    onSuccess: () => {
      // Invalidate all suggestion queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ["admin", "market-suggestions"] });
    },
  });
};

export const useResolveMarket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ marketId, resolution }: { marketId: string; resolution: "yes" | "no" }) =>
      adminApi.resolveMarket(marketId, resolution),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      queryClient.invalidateQueries({ queryKey: ["markets"] });
    },
  });
};

export const useResolveMarketOutcome = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ marketId, winningOutcome }: { marketId: string; winningOutcome: string }) =>
      adminApi.resolveMarketOutcome(marketId, winningOutcome),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      queryClient.invalidateQueries({ queryKey: ["markets"] });
    },
  });
};

export const useUpdateMarket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ marketId, data }: { marketId: string; data: { status?: string; resolution?: string } }) =>
      adminApi.updateMarket(marketId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      queryClient.invalidateQueries({ queryKey: ["markets"] });
    },
  });
};

export const useBulkDeleteMarkets = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (marketIds: string[]) => adminApi.bulkDeleteMarkets(marketIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "markets"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
      queryClient.invalidateQueries({ queryKey: ["markets"] });
    },
  });
};

export const useCreateSeason = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (season: Partial<AdminSeason>) => adminApi.createSeason(season),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "seasons"] });
    },
  });
};

export const useCompleteSeason = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (seasonId: string) => adminApi.completeSeason(seasonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "seasons"] });
    },
  });
};

// Market Suggestions hooks
export const useMarketSuggestions = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
}) => {
  return useQuery({
    queryKey: ["admin", "market-suggestions", params],
    queryFn: () => adminApi.getMarketSuggestions(params),
  });
};

export const useMarketSuggestion = (id: string) => {
  return useQuery({
    queryKey: ["admin", "market-suggestions", id],
    queryFn: () => adminApi.getMarketSuggestion(id),
    enabled: !!id,
  });
};

export const useApproveSuggestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.approveSuggestion(id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "market-suggestions"] });
    },
  });
};

export const useRejectSuggestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, rejectionReason }: { id: string; rejectionReason?: string }) =>
      adminApi.rejectSuggestion(id, rejectionReason),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "market-suggestions"] });
    },
  });
};

export const useCreateMarketFromSuggestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.createMarketFromSuggestion(id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "market-suggestions"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "markets"] });
      queryClient.invalidateQueries({ queryKey: ["markets"] });
    },
  });
};

export const useDetectMarkets = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => adminApi.detectMarkets(),
    onSuccess: () => {
      // Invalidate after a delay to allow backend to process
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["admin", "market-suggestions"] });
      }, 2000);
    },
  });
};

export const useBulkApproveSuggestions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (suggestionIds: string[]) => adminApi.bulkApproveSuggestions(suggestionIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "market-suggestions"] });
    },
  });
};

export const useBulkCreateMarketsFromSuggestions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (suggestionIds: string[]) => adminApi.bulkCreateMarketsFromSuggestions(suggestionIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "market-suggestions"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "markets"] });
      queryClient.invalidateQueries({ queryKey: ["markets"] });
    },
  });
};

// Presale management hooks
export const useActivePresale = () => {
  return useQuery({
    queryKey: ["admin", "presale", "active"],
    queryFn: () => adminApi.getActivePresale(),
  });
};

export const usePresaleParticipants = (
  presaleId?: string,
  params?: { page?: number; limit?: number; search?: string; linked?: "linked" | "unlinked" }
) => {
  return useQuery({
    queryKey: ["admin", "presale", presaleId, "participants", params],
    queryFn: () => {
      if (!presaleId) {
        throw new Error("presaleId is required");
      }
      return adminApi.getPresaleParticipants(presaleId, params);
    },
    enabled: !!presaleId,
    placeholderData: (previousData) => previousData,
  });
};

export const useAdminAnalyticsOverview = (params?: { days?: number }) => {
  return useQuery<AdminAnalyticsOverview>({
    queryKey: ["admin", "analytics", params],
    queryFn: () => adminApi.getAnalyticsOverview(params),
  });
};

export const useAllPresales = () => {
  return useQuery({
    queryKey: ["admin", "presale", "all"],
    queryFn: () => adminApi.getAllPresales(),
  });
};

export const useScanPresaleWallet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (presaleId: string) => adminApi.scanPresaleWallet(presaleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "presale"] });
      toast.success("Presale wallet scanned successfully");
    },
  });
};

export const useClosePresale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (presaleId: string) => adminApi.closePresale(presaleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "presale"] });
      toast.success("Presale closed successfully");
    },
  });
};

export const useDistributePresaleTokens = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ presaleId, seasonId }: { presaleId: string; seasonId: string }) =>
      adminApi.distributePresaleTokens(presaleId, seasonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "presale"] });
      toast.success("Presale tokens distributed successfully");
    },
  });
};

