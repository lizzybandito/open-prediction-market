import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { marketsApi } from "@/api/markets";
import { Market, MarketFilters } from "@/types/api";
import { toast } from "sonner";

export const useMarkets = (filters?: MarketFilters) => {
  return useQuery({
    queryKey: ["markets", filters],
    queryFn: () => marketsApi.getMarkets(filters),
    staleTime: 5000, // keep cache warm for quick tab switches
    refetchInterval: 5000, // keep homepage prices near-real-time
    refetchIntervalInBackground: true,
  });
};

export const useMarket = (id: string | undefined) => {
  return useQuery({
    queryKey: ["market", id],
    queryFn: () => marketsApi.getMarket(id!),
    enabled: !!id,
    refetchInterval: 3000, // Refresh every 3 seconds for real-time prices
    staleTime: 1000, // Consider data stale after 1 second
  });
};

export const useMarketChartData = (id: string | undefined, timeframe?: string) => {
  return useQuery({
    queryKey: ["market-chart", id, timeframe],
    queryFn: () => marketsApi.getMarketChartData(id!, timeframe),
    enabled: !!id,
  });
};

export const useMarketCandles = (
  id: string | undefined,
  params?: { interval?: "1m" | "5m" | "15m" | "1h" | "1d"; timeframe?: "24h" | "7d" | "30d" | "90d" | "1y" | "max"; tokenId?: string }
) => {
  return useQuery({
    queryKey: ["market-candles", id, params],
    queryFn: () => marketsApi.getMarketCandles(id!, params),
    enabled: !!id,
    staleTime: 5000, // Consider data stale after 5 seconds
    refetchInterval: 10000, // Refresh every 10 seconds
  });
};

export const useMarketPolymarketHolders = (id: string | undefined, limit?: number) => {
  return useQuery({
    queryKey: ["market-holders", id, limit],
    queryFn: () => marketsApi.getMarketPolymarketHolders(id!, limit),
    enabled: !!id,
    staleTime: 60000,
  });
};

export const useMarketPolymarketTrades = (
  id: string | undefined,
  params?: { limit?: number; offset?: number; takerOnly?: boolean; side?: "BUY" | "SELL" }
) => {
  return useQuery({
    queryKey: ["market-trades", id, params],
    queryFn: () => marketsApi.getMarketPolymarketTrades(id!, params),
    enabled: !!id,
    staleTime: 30000,
  });
};

export const useMarketPolymarketOutcomes = (id: string | undefined) => {
  return useQuery({
    queryKey: ["market-outcomes", id],
    queryFn: () => marketsApi.getMarketPolymarketOutcomes(id!),
    enabled: !!id,
    refetchInterval: 5000, // Refresh every 5 seconds
    staleTime: 2000, // Consider data stale after 2 seconds
  });
};

export const useCreateMarket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (market: Partial<Market>) => marketsApi.createMarket(market),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["markets"] });
      toast.success("Market created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create market");
    },
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => marketsApi.getCategories(),
    staleTime: 300000, // 5 minutes
  });
};

