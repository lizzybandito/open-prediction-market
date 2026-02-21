import { apiClient } from "./client";
import { Market, MarketFilters, PaginatedResponse, MarketChartData, PolymarketOutcomeResponse, PolymarketOutcome, PolymarketEventPicksSummary } from "@/types/api";

export const marketsApi = {
  getMarkets: async (filters?: MarketFilters): Promise<PaginatedResponse<Market>> => {
    const response = await apiClient.get<PaginatedResponse<Market>>("/markets", filters);
    return response.data;
  },

  getMarket: async (id: string): Promise<Market> => {
    const response = await apiClient.get<Market>(`/markets/${id}`);
    return response.data;
  },

  getMarketChartData: async (id: string, timeframe?: string): Promise<MarketChartData[]> => {
    const response = await apiClient.get<MarketChartData[]>(
      `/markets/${id}/chart`,
      timeframe ? { timeframe } : undefined
    );
    // Server returns { success, data }
    return (response as any).data?.data ?? response.data;
  },

  getMarketCandles: async (
    id: string,
    params?: { interval?: "1m" | "5m" | "15m" | "1h" | "1d"; from?: string | number; to?: string | number; timeframe?: "24h" | "7d" | "30d" | "90d" | "1y" | "max"; tokenId?: string }
  ): Promise<MarketChartData[]> => {
    const response = await apiClient.get<any>(`/markets/${id}/candles`, params as any);
    // Backend returns { success, data: [...] }, apiClient returns full response
    // So response.data IS the array
    return response.data ?? [];
  },

  getMarketPolymarketHolders: async (id: string, limit?: number): Promise<any[]> => {
    const response = await apiClient.get<any>(`/markets/${id}/polymarket/holders`, limit ? { limit } : undefined);
    return response.data?.data ?? [];
  },

  getMarketPolymarketTrades: async (id: string, params?: { limit?: number; offset?: number; takerOnly?: boolean; side?: "BUY" | "SELL" }): Promise<any[]> => {
    const response = await apiClient.get<any>(`/markets/${id}/polymarket/trades`, params as any);
    return response.data?.data ?? [];
  },

  getMarketPolymarketOutcomes: async (id: string): Promise<PolymarketOutcomeResponse | null> => {
    const response = await apiClient.get<PolymarketOutcomeResponse | null>(
      `/markets/${id}/polymarket/outcomes`
    );
    const payload = response.data ?? null;
    if (!payload) return null;

    const outcomes: PolymarketOutcome[] = Array.isArray(payload.outcomes)
      ? payload.outcomes.map((outcome) => {
          const priceCents = typeof outcome.priceCents === "number" ? outcome.priceCents : undefined;
          const probability = typeof outcome.probability === "number"
            ? outcome.probability
            : priceCents !== undefined
              ? Number((priceCents / 100).toFixed(4))
              : undefined;
          return {
            ...outcome,
            priceCents,
            probability,
            bestBidCents: typeof outcome.bestBidCents === "number" ? outcome.bestBidCents : undefined,
            bestAskCents: typeof outcome.bestAskCents === "number" ? outcome.bestAskCents : undefined,
            midpointCents: typeof outcome.midpointCents === "number" ? outcome.midpointCents : priceCents,
          } as PolymarketOutcome;
        })
      : [];

    const eventPicks: PolymarketEventPicksSummary | undefined = payload.eventPicks
      ? {
          picks: Array.isArray(payload.eventPicks.picks) ? payload.eventPicks.picks : [],
          lastUpdated: payload.eventPicks.lastUpdated,
          markets: Array.isArray(payload.eventPicks.markets) ? payload.eventPicks.markets : undefined,
        }
      : undefined;

    const marketType = payload.marketType || (outcomes.length > 2 ? "multi" : outcomes.length === 2 ? "binary" : "unknown");

    const meta = payload.meta
      ? {
          eventTitle: payload.meta.eventTitle ?? null,
          eventSlug: payload.meta.eventSlug ?? null,
          eventImageUrl: payload.meta.eventImageUrl ?? null,
          conditionId: payload.meta.conditionId,
          sourceUrl: payload.meta.sourceUrl ?? null,
          totalVolume: typeof payload.meta.totalVolume === "number" ? payload.meta.totalVolume : payload.meta.totalVolume != null ? Number(payload.meta.totalVolume) : undefined,
          totalLiquidity: typeof payload.meta.totalLiquidity === "number" ? payload.meta.totalLiquidity : payload.meta.totalLiquidity != null ? Number(payload.meta.totalLiquidity) : undefined,
          picksCount: payload.meta.picksCount,
          lastUpdated: payload.meta.lastUpdated,
          markets: payload.meta.markets, // FIX: Include markets array from backend
        }
      : undefined;

    return {
      ...payload,
      outcomes,
      eventPicks,
      marketType,
      lastUpdated: payload.lastUpdated,
      meta,
    };
  },

  createMarket: async (market: Partial<Market>): Promise<Market> => {
    const response = await apiClient.post<Market>("/markets", market);
    return response.data;
  },

  updateMarket: async (id: string, market: Partial<Market>): Promise<Market> => {
    const response = await apiClient.patch<Market>(`/markets/${id}`, market);
    return response.data;
  },

  resolveMarket: async (id: string, resolution: "yes" | "no"): Promise<Market> => {
    const response = await apiClient.post<Market>(`/markets/${id}/resolve`, { resolution });
    return response.data;
  },

  getCategories: async (): Promise<string[]> => {
    const response = await apiClient.get<{ success: boolean; data: string[] }>("/markets/categories/list");
    return response.data.data || [];
  },
};

