import { useParams, Link } from "react-router-dom";
import { useState, useMemo, useEffect, useRef } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, Users, Info, ChevronDown, ChevronRight, CheckCircle2 } from "lucide-react";
import { useMarket, useMarketCandles, useMarketPolymarketOutcomes } from "@/hooks/use-markets";
import { useMarketPolymarketHolders, useMarketPolymarketTrades } from "@/hooks/use-markets";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import type { TooltipProps } from "recharts";
import { format, formatDistanceToNow } from "date-fns";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useSolanaWallet } from "@/hooks/use-solana-wallet";
import { AIAgentPicks } from "@/components/AIAgentPicks";
import { useAIPicks } from "@/hooks/use-ai-picks";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWalletBalance } from "@/hooks/use-wallet";
import { tradingApi } from "@/api/trading";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentUser } from "@/hooks/use-auth";
import { tokenApi } from "@/api/token";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { PolymarketOutcome } from "@/types/api";

type NormalizedFallbackMarket = {
  label: string;
  tokenId?: string;
  yesTokenId?: string;
  noTokenId?: string;
  yesPriceCents?: number;
  noPriceCents?: number;
  midpointCents?: number;
  bestBidCents?: number;
  bestAskCents?: number;
  liquidity?: number;
  volume?: number;
};

type ExtendedOutcome = PolymarketOutcome & {
  yesTokenId?: string;
  noTokenId?: string;
  noPriceCents?: number;
  liquidity?: number;
  volume?: number;
};

type FormattedChartPoint = {
  time: string;
  timestamp: string;
  yes: number;
  no: number;
};

const MinimalTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (!active || !payload?.length) {
    return null;
  }
  const yesEntry = payload.find((item) => item.dataKey === "yes");
  const noEntry = payload.find((item) => item.dataKey === "no");
  const point = (yesEntry?.payload ?? noEntry?.payload ?? {}) as Partial<FormattedChartPoint>;
  const yesPrice = typeof yesEntry?.value === "number" ? yesEntry.value : typeof point.yes === "number" ? point.yes : null;
  const noPrice = typeof noEntry?.value === "number" ? noEntry.value : typeof point.no === "number" ? point.no : null;
  const timestamp = typeof point.timestamp === "string" ? new Date(point.timestamp) : null;
  const hasValidTimestamp = timestamp && !Number.isNaN(timestamp.getTime());

  return (
    <div className="rounded-lg border border-border/50 bg-background/95 backdrop-blur-sm px-3 py-2 text-xs shadow-lg">
      {hasValidTimestamp && (
        <div className="mb-1.5 text-[10px] uppercase tracking-wider text-muted-foreground/70">
          {format(timestamp!, "MMM d, HH:mm")}
        </div>
      )}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-semibold text-foreground">
              {yesPrice != null ? `${yesPrice.toFixed(2)}¢` : "—"}
            </span>
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground/70">
              Yes
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-rose-500" />
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-semibold text-foreground">
              {noPrice != null ? `${noPrice.toFixed(2)}¢` : "—"}
            </span>
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground/70">
              No
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Market = () => {
  const { id } = useParams();
  const { isSignedIn } = useAuth();
  const { data: currentUser } = useCurrentUser();
  const navigate = useNavigate();
  const [showWalletDialog, setShowWalletDialog] = useState(false);
  const [timeframe, setTimeframe] = useState<"1H" | "6H" | "1D" | "1W" | "1M" | "ALL">("1W");
  // Map Polymarket-style timeframes to our API timeframes and intervals
  // Note: For 1H and 6H, we use 24h API timeframe but filter to show only the requested period
  const getTimeframeConfig = (tf: string): { apiTimeframe: "24h" | "7d" | "30d" | "90d" | "1y" | "max"; interval: "1m" | "5m" | "15m" | "1h" | "1d" } => {
    switch (tf) {
      case "1H": return { apiTimeframe: "24h", interval: "1m" }; // 1 hour, 1 minute intervals (fetch 24h, show last 1h)
      case "6H": return { apiTimeframe: "24h", interval: "5m" }; // 6 hours, 5 minute intervals (fetch 24h, show last 6h)
      case "1D": return { apiTimeframe: "24h", interval: "15m" }; // 1 day, 15 minute intervals
      case "1W": return { apiTimeframe: "7d", interval: "1h" }; // 1 week, 1 hour intervals
      case "1M": return { apiTimeframe: "30d", interval: "1d" }; // 1 month, 1 day intervals
      case "ALL": return { apiTimeframe: "90d", interval: "1d" }; // All available data, 1 day intervals
      default: return { apiTimeframe: "24h", interval: "15m" };
    }
  };
  const { apiTimeframe, interval } = getTimeframeConfig(timeframe);
  const [selectedPosition, setSelectedPosition] = useState<"yes" | "no" | null>(null);
  const [selectedOutcomeIdx, setSelectedOutcomeIdx] = useState<number | null>(null);
  const [selectedOutcomeTokenId, setSelectedOutcomeTokenId] = useState<string | null>(null); // Persist selection by tokenId
const [selectedMultiOutcomeSide, setSelectedMultiOutcomeSide] = useState<"yes" | "no">("yes");
  const [showResolvedOutcomes, setShowResolvedOutcomes] = useState(false);
  const [amount, setAmount] = useState<string>("");
  const [currency, setCurrency] = useState<"SOL" | "POINTS">("POINTS");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const {
    data: market,
    isLoading: marketLoading,
  } = useMarket(id);
  const { data: chartData, isLoading: chartLoading } = useMarketCandles(id, { interval, timeframe: apiTimeframe });
  const { data: holders } = useMarketPolymarketHolders(id, 10);
  const { data: polymarketOutcomes } = useMarketPolymarketOutcomes(id);
  const {
    data: recentTrades,
  } = useMarketPolymarketTrades(id, { limit: 10, takerOnly: true });
  const {
    data: aiPicks,
    isLoading: aiPicksLoading,
    refetch: refetchAIPicks,
  } = useAIPicks(id);
  const { connected, address } = useSolanaWallet();
  const { data: balance, isLoading: balanceLoading } = useWalletBalance();
  const queryClient = useQueryClient();

  const eventPicks = polymarketOutcomes?.eventPicks?.picks ?? [];
  const displayedOutcomes = polymarketOutcomes?.outcomes ?? [];
  const storedFallbackMarkets = (polymarketOutcomes?.meta as any)?.markets ?? [];
  
  // Compute tokenId for chart based on selected outcome (for multi-outcome markets)
  const chartTokenId = useMemo(() => {
    if (!polymarketOutcomes || polymarketOutcomes.marketType !== "multi") return undefined;
    if (selectedOutcomeIdx === null || selectedOutcomeIdx < 0) return undefined;
    
    // Try to get tokenId from stored markets first
    const storedMarket = storedFallbackMarkets[selectedOutcomeIdx];
    if (storedMarket?.yesTokenId) return String(storedMarket.yesTokenId);
    
    // Fall back to displayed outcomes
    const outcome = displayedOutcomes[selectedOutcomeIdx];
    if (outcome?.tokenId) return String(outcome.tokenId);
    
    return undefined;
  }, [polymarketOutcomes, selectedOutcomeIdx, storedFallbackMarkets, displayedOutcomes]);
  
  // Fetch chart data for specific outcome in multi-outcome markets
  const { data: multiOutcomeChartData, isLoading: multiOutcomeChartLoading } = useMarketCandles(
    id, 
    { interval, timeframe: apiTimeframe, tokenId: chartTokenId }
  );
  const normalizedFallbackMarkets = useMemo<NormalizedFallbackMarket[]>(() => {
    if (!Array.isArray(storedFallbackMarkets)) return [];

    const processed: NormalizedFallbackMarket[] = [];

    for (const stored of storedFallbackMarkets) {
      const rawLabel =
        stored?.label ||
        stored?.question ||
        stored?.title ||
        stored?.slug ||
        "Outcome";
      const labelLower = String(rawLabel).trim().toLowerCase();

      const tokensArray = Array.isArray(stored?.tokenIds)
        ? stored.tokenIds
        : Array.isArray(stored?.clobTokenIds)
          ? stored.clobTokenIds
          : undefined;

      const yesTokenId = stored?.yesTokenId
        ? String(stored.yesTokenId)
        : Array.isArray(tokensArray) && tokensArray.length > 0
          ? String(tokensArray[0])
          : undefined;

      const noTokenId = stored?.noTokenId
        ? String(stored.noTokenId)
        : Array.isArray(tokensArray) && tokensArray.length > 1
          ? String(tokensArray[1])
          : undefined;

      // Filter out generic yes/no labels, but allow markets without tokenIds
      // (these are new options not yet tradeable on Polymarket)
      if (labelLower === "yes" || labelLower === "no") {
        continue;
      }

      const outcomePricesArray = Array.isArray(stored?.outcomePrices)
        ? stored.outcomePrices
        : [];

      const yesPriceCents =
        typeof stored?.yesPriceCents === "number"
          ? stored.yesPriceCents
          : outcomePricesArray.length > 0 && typeof outcomePricesArray[0] === "number"
            ? Number(outcomePricesArray[0]) * 100
            : undefined;

      const noPriceCents =
        typeof stored?.noPriceCents === "number"
          ? stored.noPriceCents
          : outcomePricesArray.length > 1 && typeof outcomePricesArray[1] === "number"
            ? Number(outcomePricesArray[1]) * 100
            : yesPriceCents !== undefined
              ? Math.max(0, 100 - yesPriceCents)
              : undefined;

      processed.push({
        label: rawLabel,
        tokenId: yesTokenId,
        yesTokenId,
        noTokenId,
        yesPriceCents,
        noPriceCents,
        midpointCents: typeof stored?.midpointCents === "number" ? stored.midpointCents : undefined,
        bestBidCents: typeof stored?.bestBidCents === "number" ? stored.bestBidCents : undefined,
        bestAskCents: typeof stored?.bestAskCents === "number" ? stored.bestAskCents : undefined,
        liquidity: typeof stored?.liquidity === "number" ? stored.liquidity : undefined,
        volume: typeof stored?.volume === "number" ? stored.volume : undefined,
      });
    }

    return processed;
  }, [storedFallbackMarkets]);
  const hasEventPicks = eventPicks.length > 0;
  const hasMultiOutcomeArray = displayedOutcomes.length > 2;
  const inferredMultiOutcome = polymarketOutcomes?.marketType === "multi" || hasMultiOutcomeArray;
  const isMultiOutcomeMarket = inferredMultiOutcome || (hasEventPicks && displayedOutcomes.length === 0);

  const normalizedLiveOutcomes = useMemo(() => {
    if (!Array.isArray(displayedOutcomes)) return [];
    return displayedOutcomes
      .map((outcome) => {
        const labelLower = String(outcome?.label || "").trim().toLowerCase();
        if (labelLower === "yes" || labelLower === "no") return null;
        return outcome;
      })
      .filter((outcome): outcome is PolymarketOutcome => Boolean(outcome));
  }, [displayedOutcomes]);

  const outcomeByTokenId = useMemo(() => {
    const map = new Map<string, PolymarketOutcome>();
    for (const outcome of normalizedLiveOutcomes) {
      if (outcome?.tokenId) {
        map.set(String(outcome.tokenId), outcome);
      }
    }
    return map;
  }, [normalizedLiveOutcomes]);

  const multiOutcomeOptions = useMemo<ExtendedOutcome[]>(() => {
    if (normalizedFallbackMarkets.length > 0) {
      const options: ExtendedOutcome[] = normalizedFallbackMarkets.map((stored, idx) => {
        const live = stored.yesTokenId ? outcomeByTokenId.get(String(stored.yesTokenId)) : undefined;
        const yesPriceCents =
          live?.priceCents ??
          stored.yesPriceCents ??
          stored.midpointCents ??
          (stored.noPriceCents !== undefined ? Math.max(0, 100 - stored.noPriceCents) : undefined);
        const noPriceCents =
          stored.noPriceCents ??
          (typeof yesPriceCents === "number" ? Math.max(0, 100 - yesPriceCents) : undefined);
        const liquidity = live?.liquidity ?? stored.liquidity;
        const volume = live?.volume24h ?? (live as any)?.volume ?? stored.volume;

        const merged: ExtendedOutcome = {
          index: idx,
          label: stored.label || live?.label || `Outcome ${idx + 1}`,
          tokenId: stored.yesTokenId || live?.tokenId,
          yesTokenId: stored.yesTokenId || live?.tokenId,
          noTokenId: stored.noTokenId,
          priceCents: yesPriceCents,
          midpointCents: live?.midpointCents ?? stored.midpointCents ?? yesPriceCents,
          bestBidCents: live?.bestBidCents ?? stored.bestBidCents,
          bestAskCents: live?.bestAskCents ?? stored.bestAskCents,
          probability: live?.probability ?? (typeof yesPriceCents === "number" ? yesPriceCents / 100 : undefined),
          liquidity,
          volume24h: volume,
          volume: volume, // Also set volume field for getOutcomeVolume
          noPriceCents,
        };
        return merged;
      });
      const fallbackYesIds = new Set(
        options
          .map((option) => option.yesTokenId || option.tokenId)
          .filter((value): value is string => typeof value === "string")
      );

      const extras = normalizedLiveOutcomes
        .filter((outcome) => {
          const label = (outcome?.label || "").toLowerCase().trim();
          const token = outcome?.tokenId ? String(outcome.tokenId) : undefined;
          // Include outcomes even without tokenIds (new options not yet tradeable)
          return token ? !fallbackYesIds.has(token) : true;
        })
        .map((outcome, extraIdx) => {
          const yesPriceCents =
            outcome.priceCents ??
            outcome.midpointCents ??
            outcome.bestBidCents ??
            outcome.bestAskCents ??
            undefined;
          const noPriceCents =
            typeof yesPriceCents === "number" ? Math.max(0, 100 - yesPriceCents) : undefined;
          const extended: ExtendedOutcome = {
            ...outcome,
            index: options.length + extraIdx,
            yesTokenId: outcome.tokenId ? String(outcome.tokenId) : undefined,
            noTokenId: undefined,
            noPriceCents,
          };
          return extended;
        });

      const combined = [...options, ...extras];
      return combined
        .filter((option) => {
          const label = (option?.label || "").toString().trim().toLowerCase();
          return label !== "yes" && label !== "no";
        })
        .map((option, idx) => ({ ...option, index: idx }));
    }
    if (eventPicks.length > 0 || normalizedLiveOutcomes.length > 0) {
      const pickByLabel = new Map<string, typeof eventPicks[number]>();
      for (const pick of eventPicks) {
        const label = (pick?.label || "").toString().trim().toLowerCase();
        if (label && label !== "yes" && label !== "no") {
          pickByLabel.set(label, pick);
        }
      }

      const extraOutcomes = normalizedLiveOutcomes.filter((outcome) => {
        const label = (outcome?.label || "").toString().trim().toLowerCase();
        return label && label !== "yes" && label !== "no";
      });

      const combined: ExtendedOutcome[] = [];

      const seenLabels = new Set<string>();

      for (const stored of normalizedFallbackMarkets) {
        const label = stored.label.toString().trim().toLowerCase();
        const live = outcomeByTokenId.get(stored.yesTokenId || "") || undefined;
        const pick = pickByLabel.get(label);
        if (label && label !== "yes" && label !== "no") {
          const yesPriceCents =
            live?.priceCents ??
            stored.yesPriceCents ??
            pick?.yesPriceCents ??
            stored.midpointCents ??
            (stored.noPriceCents !== undefined ? Math.max(0, 100 - stored.noPriceCents) : undefined);
          const noPriceCents =
            stored.noPriceCents ??
            (typeof yesPriceCents === "number" ? Math.max(0, 100 - yesPriceCents) : undefined);
          combined.push({
            index: combined.length,
            label: pick?.label || stored.label,
            tokenId: stored.yesTokenId || live?.tokenId,
            yesTokenId: stored.yesTokenId || live?.tokenId,
            noTokenId: stored.noTokenId,
            priceCents: yesPriceCents,
            midpointCents: live?.midpointCents ?? stored.midpointCents ?? yesPriceCents,
            bestBidCents: live?.bestBidCents ?? stored.bestBidCents,
            bestAskCents: live?.bestAskCents ?? stored.bestAskCents,
            probability: live?.probability ?? (typeof yesPriceCents === "number" ? yesPriceCents / 100 : undefined),
            liquidity: live?.liquidity ?? stored.liquidity,
            volume24h: live?.volume24h ?? stored.volume,
            noPriceCents,
          });
          seenLabels.add(label);
        }
      }

      for (const pick of eventPicks) {
        const label = (pick?.label || "").toString().trim().toLowerCase();
        if (!label || label === "yes" || label === "no" || seenLabels.has(label)) continue;
        const yesPriceCents = typeof pick.yesPriceCents === "number" ? pick.yesPriceCents : undefined;
        combined.push({
          index: combined.length,
          label: pick.label,
          tokenId: pick.yesTokenId,
          yesTokenId: pick.yesTokenId,
          priceCents: yesPriceCents,
          midpointCents: yesPriceCents,
          probability: typeof yesPriceCents === "number" ? yesPriceCents / 100 : undefined,
          noPriceCents:
            typeof yesPriceCents === "number" ? Math.max(0, 100 - yesPriceCents) : undefined,
        } as ExtendedOutcome);
        seenLabels.add(label);
      }

      for (const outcome of extraOutcomes) {
        const label = (outcome?.label || "").toString().trim().toLowerCase();
        if (!label || seenLabels.has(label)) continue;
        const yesPriceCents =
          outcome.priceCents ??
          outcome.midpointCents ??
          outcome.bestBidCents ??
          outcome.bestAskCents ??
          undefined;
        const noPriceCents =
          typeof yesPriceCents === "number" ? Math.max(0, 100 - yesPriceCents) : undefined;
        combined.push({
          ...outcome,
          index: combined.length,
          yesTokenId: outcome.tokenId ? String(outcome.tokenId) : undefined,
          noTokenId: undefined,
          noPriceCents,
        });
        seenLabels.add(label);
      }

      if (combined.length > 0) return combined;
    }

    return [];
  }, [displayedOutcomes, eventPicks, normalizedFallbackMarkets, outcomeByTokenId]);

  // Only reset selection when market ID changes, not on data updates
  useEffect(() => {
    setSelectedOutcomeIdx(null);
    setSelectedOutcomeTokenId(null);
  }, [id]); // Only reset when market ID changes, not on data refreshes

  useEffect(() => {
    if (isMultiOutcomeMarket && currency !== "POINTS") {
      setCurrency("POINTS");
    }
  }, [isMultiOutcomeMarket, currency]);

  useEffect(() => {
    if (isMultiOutcomeMarket && selectedPosition !== null) {
      setSelectedPosition(null);
    }
  }, [isMultiOutcomeMarket, selectedPosition]);

  // Auto-sync wallet address to database when wallet connects
  useEffect(() => {
    const syncWalletToDatabase = async () => {
      // Only sync if:
      // 1. User is signed in
      // 2. Wallet is connected
      // 3. Wallet address exists
      // 4. Wallet address is not already in database
      if (
        isSignedIn &&
        connected &&
        address &&
        currentUser &&
        !(currentUser as any).solWalletAddress
      ) {
        try {
          await tokenApi.connectWallet({
            address,
            chain: "sol",
          });
          // Refresh user data to get updated wallet address
          queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
        } catch (error: any) {
          // Silently fail - don't show error toast for auto-sync
          // User can manually connect via wallet page if needed
          console.debug("Auto-sync wallet failed:", error);
        }
      }
    };

    syncWalletToDatabase();
  }, [isSignedIn, connected, address, currentUser, queryClient]);

  const visibleMultiOutcomeOptions = useMemo<ExtendedOutcome[]>(() => {
    return multiOutcomeOptions
      .filter((option) => {
        const label = (option?.label || "").toString().trim().toLowerCase();
        return label !== "yes" && label !== "no";
      })
      .map((option, idx) => ({ ...option, index: idx }));
  }, [multiOutcomeOptions]);

  // Helper to check if an outcome is resolved (yesPrice ~0 means lost, ~100 means won)
  const isOutcomeResolved = (option: ExtendedOutcome): boolean => {
    const yesPrice =
      (option as any).priceCents ??
      (option as any).yesPriceCents ??
      option.midpointCents ??
      option.bestBidCents ??
      option.bestAskCents;
    if (typeof yesPrice !== "number") return false;
    // Consider resolved if price is <= 0.5¢ (essentially 0) or >= 99.5¢ (essentially 100)
    return yesPrice <= 0.5 || yesPrice >= 99.5;
  };

  // Split outcomes into active and resolved
  const { activeOutcomes, resolvedOutcomes } = useMemo(() => {
    const active: ExtendedOutcome[] = [];
    const resolved: ExtendedOutcome[] = [];
    
    visibleMultiOutcomeOptions.forEach((option) => {
      if (isOutcomeResolved(option)) {
        resolved.push(option);
      } else {
        active.push(option);
      }
    });
    
    return { activeOutcomes: active, resolvedOutcomes: resolved };
  }, [visibleMultiOutcomeOptions]);

  // Restore selection by tokenId when options update
  useEffect(() => {
    if (!isMultiOutcomeMarket || visibleMultiOutcomeOptions.length === 0) return;
    
    // If we have a saved tokenId, try to find it in the new options
    if (selectedOutcomeTokenId) {
      const foundIdx = visibleMultiOutcomeOptions.findIndex(
        (opt) => opt.yesTokenId === selectedOutcomeTokenId || opt.tokenId === selectedOutcomeTokenId
      );
      if (foundIdx >= 0) {
        setSelectedOutcomeIdx(foundIdx);
        return;
      }
    }
    
    // If no saved tokenId or not found, and no current selection, select first
    if (selectedOutcomeIdx === null) {
      setSelectedOutcomeIdx(0);
      const firstTokenId = visibleMultiOutcomeOptions[0]?.yesTokenId || visibleMultiOutcomeOptions[0]?.tokenId;
      if (firstTokenId) {
        setSelectedOutcomeTokenId(firstTokenId);
      }
      setSelectedMultiOutcomeSide("yes");
    }
  }, [isMultiOutcomeMarket, visibleMultiOutcomeOptions, selectedOutcomeTokenId]);

  const selectedOutcome = useMemo(() => {
    if (!isMultiOutcomeMarket) return null;
    if (selectedOutcomeIdx === null) return null;
    return visibleMultiOutcomeOptions[selectedOutcomeIdx] ?? null;
  }, [isMultiOutcomeMarket, selectedOutcomeIdx, visibleMultiOutcomeOptions]);

useEffect(() => {
  if (!isMultiOutcomeMarket && selectedMultiOutcomeSide !== "yes") {
    setSelectedMultiOutcomeSide("yes");
  }
}, [isMultiOutcomeMarket, selectedMultiOutcomeSide]);

useEffect(() => {
  if (isMultiOutcomeMarket && selectedOutcomeIdx === null && selectedMultiOutcomeSide !== "yes") {
    setSelectedMultiOutcomeSide("yes");
  }
}, [isMultiOutcomeMarket, selectedOutcomeIdx, selectedMultiOutcomeSide]);

  const resultNumber = (value: any): number | null =>
    typeof value === "number" && !Number.isNaN(value) ? value : null;

  const getOutcomeYesPrice = (outcome?: ExtendedOutcome | null) => {
    if (!outcome) return null;
    const yesPrice =
      resultNumber((outcome as any).priceCents) ??
      resultNumber((outcome as any).yesPriceCents) ??
      resultNumber(outcome.midpointCents) ??
      resultNumber(outcome.bestBidCents) ??
      resultNumber(outcome.bestAskCents);
    return yesPrice;
  };

  const getOutcomeNoPrice = (outcome?: ExtendedOutcome | null) => {
    if (!outcome) return null;
    const stored = resultNumber((outcome as any).noPriceCents);
    if (stored !== null) return stored;
    const yesPrice = getOutcomeYesPrice(outcome);
    return typeof yesPrice === "number" ? Math.max(0, parseFloat((100 - yesPrice).toFixed(2))) : null;
  };

  const getOutcomeYesTokenId = (outcome?: ExtendedOutcome | null) => {
    if (!outcome) return null;
    return (outcome as any).yesTokenId || outcome.tokenId || null;
  };

  const getOutcomeNoTokenId = (outcome?: ExtendedOutcome | null) => {
    if (!outcome) return null;
    return (outcome as any).noTokenId || null;
  };

  const getOutcomeVolume = (outcome?: ExtendedOutcome | null) => {
    if (!outcome) return null;
    // Check multiple possible volume fields
    const volume = 
      (outcome as any).volume ?? 
      outcome.volume24h ?? 
      (outcome as any).volumeNum ??
      (outcome as any).volumeClob;
    return resultNumber(volume);
  };

  const getOutcomeLiquidity = (outcome?: ExtendedOutcome | null) => {
    if (!outcome) return null;
    const liquidity = (outcome as any).liquidity;
    return resultNumber(liquidity);
  };

  const truncateToken = (value?: string | null, size = 6) => {
    if (!value) return "—";
    if (value.length <= size * 2) return value;
    return `${value.slice(0, size)}…${value.slice(-size)}`;
  };

  const selectedOutcomeYesPrice = useMemo(
    () => getOutcomeYesPrice(selectedOutcome),
    [selectedOutcome]
  );

  const selectedOutcomeNoPrice = useMemo(
    () => getOutcomeNoPrice(selectedOutcome),
    [selectedOutcome]
  );

  const selectedOutcomePriceCents = useMemo(() => {
    if (!selectedOutcome) return null;
    return selectedMultiOutcomeSide === "yes"
      ? selectedOutcomeYesPrice
      : selectedOutcomeNoPrice;
  }, [selectedOutcome, selectedMultiOutcomeSide, selectedOutcomeYesPrice, selectedOutcomeNoPrice]);

  // Calculate order details when amount and position are provided
  const calculation = useMemo(() => {
    // Multi-outcome calculation not supported yet
    if (isMultiOutcomeMarket) return null;
    if (!selectedPosition || !market) return null;
    
    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) return null;

    const price = selectedPosition === "yes" ? market.yesPrice : market.noPrice;
    const feeRate = 0.02; // 2% trading fee
    const fees = amountNum * feeRate;
    const amountAfterFee = amountNum - fees;
    const shares = (amountAfterFee / price) * 100;
    
    // If you win, each share pays out 100 cents ($1)
    const potentialReturn = shares;
    const profit = potentialReturn - amountNum;
    const profitPercentage = amountNum > 0 ? (profit / amountNum) * 100 : 0;

    return {
      avgPrice: price,
      shares: Math.floor(shares * 100) / 100,
      fees: Math.round(fees * 100) / 100,
      potentialReturn: Math.round(potentialReturn * 100) / 100,
      profit: Math.round(profit * 100) / 100,
      profitPercentage: Math.round(profitPercentage * 100) / 100,
    };
  }, [selectedPosition, amount, market, isMultiOutcomeMarket]);

  const multiOutcomeCalculation = useMemo(() => {
    if (!isMultiOutcomeMarket || !selectedOutcome) return null;
    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) return null;
    const price = selectedOutcomePriceCents ?? 0;
    if (price <= 0 || price > 100) return null;

    const feeRate = 0.02;
    const fees = amountNum * feeRate;
    const amountAfterFee = amountNum - fees;
    const shares = Math.floor(((amountAfterFee / price) * 100) * 100) / 100;
    const potentialReturn = Math.round(shares * 100) / 100;
    const profit = potentialReturn - amountNum;
    const profitPercentage = amountNum > 0 ? (profit / amountNum) * 100 : 0;

    return {
      avgPrice: price,
      shares,
      fees: Math.round(fees * 100) / 100,
      potentialReturn,
      profit: Math.round(profit * 100) / 100,
      profitPercentage: Math.round(profitPercentage * 100) / 100,
    };
  }, [isMultiOutcomeMarket, selectedOutcome, selectedOutcomePriceCents, amount]);

  const activeCalculation = isMultiOutcomeMarket ? multiOutcomeCalculation : calculation;
  const displayAvgPriceCents = isMultiOutcomeMarket
    ? selectedOutcomePriceCents
    : selectedPosition
      ? selectedPosition === "yes"
        ? market?.yesPrice ?? null
        : market?.noPrice ?? null
      : null;

  const formatAmount = useMemo(() => {
    return (value: number) => {
      if (isMultiOutcomeMarket) {
        return `${value.toFixed(2)} pts`;
      }
      return `$${value.toFixed(2)}`;
    };
  }, [isMultiOutcomeMarket]);

  const usdFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }),
    []
  );

  const formatCurrencyValue = (value?: number | null, fallback: string = "—") => {
    if (value === null || value === undefined || Number.isNaN(value)) return fallback;
    return usdFormatter.format(value);
  };

  const formatProbability = (value?: number) => {
    if (value === undefined || value === null || Number.isNaN(value)) return "—";
    return `${value.toFixed(2)}%`;
  };

  const compactNumberFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 1,
      }),
    []
  );

  const polymarketMeta = polymarketOutcomes?.meta;
  const polymarketLink = polymarketMeta?.sourceUrl;

  // Check available balance based on currency
  const availableBalance = useMemo(() => {
    if (!balance) return 0;
    if (currency === "POINTS") {
      return balance.availablePoints || 0;
    }
    return balance.availableSolBalance || 0;
  }, [balance, currency]);

  // Handle place order
  const handlePlaceOrder = async () => {
    if (!isSignedIn) {
      toast.error("Please sign in to place an order");
      return;
    }

    // Check if user has wallet connected
    // For SOL currency, we require Solana wallet connection
    // Database wallet sync happens automatically via useEffect
    const hasSolanaWallet = connected && address;
    
    // For SOL currency, require Solana wallet connection
    // If wallet is connected but not in database, auto-sync will handle it
    if (currency === "SOL" && !hasSolanaWallet) {
      setShowWalletDialog(true);
      return;
    }

    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (isMultiOutcomeMarket) {
      if (!selectedOutcome) {
        toast.error("Please select an outcome");
        return;
      }

      if (amountNum > availableBalance) {
        toast.error(`Insufficient points. Available: ${availableBalance.toFixed(2)}`);
        return;
      }

      setIsPlacingOrder(true);
      try {
        const selectedToken =
          selectedMultiOutcomeSide === "yes"
            ? getOutcomeYesTokenId(selectedOutcome)
            : getOutcomeNoTokenId(selectedOutcome);

        if (!selectedToken) {
          toast.error("Unable to determine token for the selected side");
          return;
        }

        await tradingApi.placeOutcomeOrder({
          marketId: id!,
          outcomeIndex: selectedOutcome.index,
          outcomeLabel: selectedOutcome.label,
          tokenId: selectedToken,
          amount: amountNum,
          currency: "POINTS",
          side: selectedMultiOutcomeSide,
        });

        toast.success(
          `Placed ${selectedMultiOutcomeSide === "yes" ? "Yes" : "No"} order for ${selectedOutcome.label}`
        );
        setAmount("");
        queryClient.invalidateQueries({ queryKey: ["wallet", "balance"] });
        queryClient.invalidateQueries({ queryKey: ["market", id] });
        queryClient.invalidateQueries({ queryKey: ["market-outcomes", id] });
        queryClient.invalidateQueries({ queryKey: ["predictions"] });
      } catch (error: any) {
        toast.error(error.message || "Failed to place outcome order");
      } finally {
        setIsPlacingOrder(false);
      }
      return;
    }

    if (!selectedPosition) {
      toast.error("Please select Yes or No");
      return;
    }

    if (amountNum > availableBalance) {
      toast.error(`Insufficient ${currency === "POINTS" ? "points" : "balance"}. Available: ${availableBalance.toFixed(2)}`);
      return;
    }

    // For SOL, wallet must be connected
    if (currency === "SOL" && !connected) {
      toast.error("Please connect your Solana wallet");
      return;
    }

    setIsPlacingOrder(true);
    try {
      await tradingApi.placeOrder({
        marketId: id!,
        position: selectedPosition,
        amount: amountNum,
        currency: currency,
        orderType: "market",
      });
      
      toast.success(`Order placed successfully!`);
      // Reset form
      setAmount("");
      setSelectedPosition(null);
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["wallet", "balance"] });
      queryClient.invalidateQueries({ queryKey: ["market", id] });
      queryClient.invalidateQueries({ queryKey: ["predictions"] });
    } catch (error: any) {
      toast.error(error.message || "Failed to place order");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const timePattern = timeframe === "1H" || timeframe === "6H" ? "HH:mm" : timeframe === "1D" || timeframe === "1W" ? "MMM d" : "MMM d, yyyy";

  // Use multi-outcome chart data if available, otherwise use regular chart data
  const activeChartData = isMultiOutcomeMarket && chartTokenId ? multiOutcomeChartData : chartData;
  const activeChartLoading = isMultiOutcomeMarket && chartTokenId ? multiOutcomeChartLoading : chartLoading;
  
  const formattedChartData: FormattedChartPoint[] = (activeChartData || []).map((point) => {
    const ts = new Date(point.timestamp);
    return {
      time: format(ts, timePattern),
      timestamp: point.timestamp,
      yes: point.yesPrice,
      no: point.noPrice,
    };
  });

  const [realtimePoints, setRealtimePoints] = useState<FormattedChartPoint[]>([]);
  const lastRealtimePriceRef = useRef<{ yes: number; no: number } | null>(null);

  useEffect(() => {
    setRealtimePoints([]);
    lastRealtimePriceRef.current = null;
  }, [id, timeframe, chartTokenId]);

  useEffect(() => {
    if (!id) return;

    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["market", id] });
      if (isMultiOutcomeMarket) {
        queryClient.invalidateQueries({ queryKey: ["market-outcomes", id] });
      }
    }, 2000); // Invalidate every 2 seconds for faster updates

    return () => clearInterval(interval);
  }, [id, queryClient, isMultiOutcomeMarket]);

  useEffect(() => {
    if (activeChartLoading) return;

    const yesPrice = isMultiOutcomeMarket ? selectedOutcomeYesPrice : market?.yesPrice;
    const noPrice = isMultiOutcomeMarket ? selectedOutcomeNoPrice : market?.noPrice;

    if (yesPrice == null || noPrice == null) {
      return;
    }

    const previous = lastRealtimePriceRef.current;
    if (
      previous &&
      Math.abs(previous.yes - yesPrice) < 0.01 &&
      Math.abs(previous.no - noPrice) < 0.01
    ) {
      return;
    }

    lastRealtimePriceRef.current = { yes: yesPrice, no: noPrice };

    const now = new Date();
    const timestamp = now.toISOString();

    setRealtimePoints((prev) => {
      const time = format(now, timePattern);
      const next = [...prev];
      const lastPoint = next[next.length - 1];
      if (lastPoint && Math.abs(new Date(lastPoint.timestamp).getTime() - now.getTime()) < 1000) {
        next[next.length - 1] = { time, timestamp, yes: yesPrice, no: noPrice };
      } else {
        next.push({ time, timestamp, yes: yesPrice, no: noPrice });
      }
      if (next.length > 180) {
        next.splice(0, next.length - 180);
      }
      return next;
    });
  }, [
    activeChartLoading,
    isMultiOutcomeMarket,
    market?.yesPrice,
    market?.noPrice,
    selectedOutcomeYesPrice,
    selectedOutcomeNoPrice,
    timePattern,
  ]);

  const combinedChartData = useMemo<FormattedChartPoint[]>(() => {
    const merged = [...formattedChartData, ...realtimePoints];
    merged.sort((a, b) => {
      const aTime = new Date(a.timestamp).getTime();
      const bTime = new Date(b.timestamp).getTime();
      return aTime - bTime;
    });

    const seen = new Set<string>();
    const deduped: FormattedChartPoint[] = [];
    for (const point of merged) {
      const key = point.timestamp || `${point.time}-${deduped.length}`;
      if (seen.has(key)) continue;
      seen.add(key);
      deduped.push(point);
    }

    return deduped.slice(-200);
  }, [formattedChartData, realtimePoints]);

  const lineChartData = combinedChartData;

  const longTimeframeDurations: Record<"1M" | "ALL", number> = {
    "1M": 30 * 24 * 60 * 60 * 1000,
    "ALL": 60 * 24 * 60 * 60 * 1000,
  };

  const chartSpanMs = useMemo(() => {
    if (lineChartData.length < 2) return 0;
    const firstTs = new Date(lineChartData[0].timestamp).getTime();
    const lastTs = new Date(lineChartData[lineChartData.length - 1].timestamp).getTime();
    if (Number.isNaN(firstTs) || Number.isNaN(lastTs)) return 0;
    return Math.max(0, lastTs - firstTs);
  }, [lineChartData]);

  const requiresExtendedHistory = timeframe === "1M" || timeframe === "ALL";
  const requiredSpanMs = requiresExtendedHistory ? longTimeframeDurations[timeframe] : 0;
  const hasSufficientHistory = !requiresExtendedHistory || chartSpanMs >= requiredSpanMs;

  // Calculate dynamic Y-axis domain based on actual data range
  // Focus on YES prices only (since NO = 100 - YES, they're complementary)
  // Ultra-sensitive zoom to show maximum price variation
  const yAxisDomain = useMemo(() => {
    if (lineChartData.length === 0) return [0, 100];
    
    // Only use YES prices for domain calculation (NO prices are just 100 - YES)
    const yesPrices = lineChartData.map(p => p.yes).filter((v): v is number => typeof v === "number");
    
    if (yesPrices.length === 0) return [0, 100];
    
    const minPrice = Math.min(...yesPrices);
    const maxPrice = Math.max(...yesPrices);
    const range = maxPrice - minPrice;
    const centerPrice = (minPrice + maxPrice) / 2;
    
    // Ultra-sensitive zoom: minimal padding to maximize visible variation
    if (range > 0) {
      // Use minimal padding (10-50% of range) to maximize the visible variation
      // This makes even tiny changes take up most of the chart height
      const paddingPercent = range < 0.1 ? 0.5 : range < 0.5 ? 0.3 : range < 1 ? 0.2 : range < 5 ? 0.15 : 0.1;
      const padding = range * paddingPercent;
      
      let domainMin = Math.max(0, minPrice - padding);
      let domainMax = Math.min(100, maxPrice + padding);
      
      // For very small ranges, ensure we show at least 2-3x the range to make it visible
      const finalRange = domainMax - domainMin;
      const minVisibleRange = Math.max(range * 2.5, centerPrice * 0.15, 2); // At least 2.5x the range, 15% of center, or 2¢
      
      if (finalRange < minVisibleRange) {
        const extraPadding = (minVisibleRange - finalRange) / 2;
        domainMin = Math.max(0, domainMin - extraPadding);
        domainMax = Math.min(100, domainMax + extraPadding);
      }
      
      return [domainMin, domainMax];
    }
    
    // If all YES prices are identical, show a moderate range around that price
    if (minPrice === maxPrice && minPrice > 0 && minPrice < 100) {
      const padding = Math.max(minPrice * 0.2, 4); // 20% of price or at least 4¢
      return [
        Math.max(0, minPrice - padding),
        Math.min(100, minPrice + padding)
      ];
    }
    
    return [0, 100];
  }, [lineChartData]);

  const latestPoint = lineChartData[lineChartData.length - 1];
  const basePoint = lineChartData[0];

  const latestYesPrice =
    latestPoint?.yes ??
    (isMultiOutcomeMarket ? selectedOutcomeYesPrice ?? null : market?.yesPrice ?? null);
  const latestNoPrice =
    latestPoint?.no ??
    (isMultiOutcomeMarket ? selectedOutcomeNoPrice ?? null : market?.noPrice ?? null);

  const priceDelta =
    latestYesPrice != null && basePoint?.yes != null ? latestYesPrice - basePoint.yes : null;
  const pricePercentChange =
    priceDelta != null && basePoint?.yes
      ? (priceDelta / basePoint.yes) * 100
      : null;

  const lastUpdatedLabel = useMemo(() => {
    if (!latestPoint?.timestamp) return null;
    const timestamp = new Date(latestPoint.timestamp);
    if (Number.isNaN(timestamp.getTime())) return null;
    return formatDistanceToNow(timestamp, { addSuffix: true });
  }, [latestPoint?.timestamp]);

  const hasChartData = lineChartData.length > 0;
  const shouldRenderChart = hasChartData && hasSufficientHistory;

  if (marketLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center">
          <p className="text-muted-foreground">Loading market...</p>
        </div>
      </div>
    );
  }

  if (!market) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Market not found</h1>
          <Link to="/">
            <Button variant="outline">Back to Markets</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container py-4 md:py-8 px-4 md:px-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors mb-4 md:mb-6">
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back to Markets</span>
          <span className="sm:hidden">Back</span>
        </Link>

        <div className="space-y-4 md:space-y-6">
            {/* Market Header */}
            <div className="bg-card border border-border rounded-lg p-3 md:p-4">
              <div>
                <Badge className="mb-1.5 md:mb-2 text-[10px] md:text-xs">{market.category}</Badge>
                <h1 className="text-lg md:text-xl lg:text-2xl font-bold mb-2 md:mb-3 leading-tight">{market.title}</h1>
                <div className="flex flex-wrap items-center gap-2 md:gap-4 text-[10px] md:text-xs text-muted-foreground mb-3 md:mb-4">
                  <div className="flex items-center gap-1 md:gap-1.5">
                    <TrendingUp className="h-3 w-3 md:h-3.5 md:w-3.5" />
                    <span>{formatCurrencyValue(polymarketMeta?.totalVolume ?? parseFloat(market.volume?.replace(/[^0-9.]/g, "") || "0"))} volume</span>
                  </div>
                  <div className="flex items-center gap-1 md:gap-1.5">
                    <Users className="h-3 w-3 md:h-3.5 md:w-3.5" />
                    <span>{market.traderCount || 0} traders</span>
                  </div>
                  {polymarketMeta?.lastUpdated && (
                    <div className="flex items-center gap-1 md:gap-1.5">
                      <span className="text-[9px] md:text-[10px] uppercase tracking-wide">Updated</span>
                      <span className="hidden sm:inline">{format(new Date(polymarketMeta.lastUpdated), "MMM d, yyyy HH:mm")}</span>
                      <span className="sm:hidden">{format(new Date(polymarketMeta.lastUpdated), "MMM d")}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-start gap-1.5 pt-2 md:pt-3 border-t border-border/50">
                  <Info className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="text-[10px] md:text-xs text-muted-foreground leading-relaxed">
                    {market.description || `This market resolves to "Yes" if the specified event occurs before ${format(new Date(market.endDate), "MMM d, yyyy")}. All trades are final and resolution will be determined by official sources and community consensus.`}
                  </p>
              </div>
            </div>
                </div>

            {/* Chart and Bet Picker - Side by side */}
            <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
            {/* Price Chart */}
              <div className="bg-card border border-border rounded-lg p-3 md:p-4 flex-1">
              <div className="flex flex-col gap-2 md:gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 md:gap-3">
                  <div>
                    <h2 className="text-sm md:text-base font-semibold">Price History</h2>
                    {isMultiOutcomeMarket && selectedOutcomeIdx !== null && multiOutcomeOptions[selectedOutcomeIdx] && (
                      <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {multiOutcomeOptions[selectedOutcomeIdx].label}
                      </p>
                    )}
                  </div>
                  <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as any)} className="w-full sm:w-auto">
                    <TabsList className="grid w-full sm:w-auto grid-cols-6 h-8 md:h-7">
                      <TabsTrigger value="1H" className="text-[9px] md:text-[10px] px-0.5 md:px-2">1H</TabsTrigger>
                      <TabsTrigger value="6H" className="text-[9px] md:text-[10px] px-0.5 md:px-2">6H</TabsTrigger>
                      <TabsTrigger value="1D" className="text-[9px] md:text-[10px] px-0.5 md:px-2">1D</TabsTrigger>
                      <TabsTrigger value="1W" className="text-[9px] md:text-[10px] px-0.5 md:px-2">1W</TabsTrigger>
                      <TabsTrigger value="1M" className="text-[9px] md:text-[10px] px-0.5 md:px-2">1M</TabsTrigger>
                      <TabsTrigger value="ALL" className="text-[9px] md:text-[10px] px-0.5 md:px-2">ALL</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 md:gap-3">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-xl md:text-2xl font-semibold text-foreground">
                        {latestYesPrice != null ? `${latestYesPrice.toFixed(2)}¢` : "—"}
                      </span>
                      {priceDelta != null && pricePercentChange != null && (
                        <span
                          className={`text-[10px] md:text-xs font-medium ${
                            priceDelta >= 0 ? "text-emerald-500" : "text-destructive"
                          }`}
                        >
                          {priceDelta >= 0 ? "+" : ""}
                          {priceDelta.toFixed(2)}¢ ({pricePercentChange >= 0 ? "+" : ""}
                          {pricePercentChange.toFixed(2)}%)
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 md:gap-2 text-[9px] md:text-[10px] text-muted-foreground">
                      {latestNoPrice != null && <span>No {latestNoPrice.toFixed(2)}¢</span>}
                    </div>
                    <p className="text-[9px] md:text-[10px] text-muted-foreground hidden sm:block">
                      {isMultiOutcomeMarket && selectedOutcome
                        ? `Real-time Polymarket odds for ${selectedOutcome.label}`
                        : "Real-time Polymarket YES price"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] md:text-[10px] text-muted-foreground">
                    <span className="flex h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                    <span>Live</span>
                    {lastUpdatedLabel && <span className="hidden sm:inline">· {lastUpdatedLabel}</span>}
                  </div>
                </div>

                <div className="h-40 md:h-48 -mx-1 px-1">
                  {activeChartLoading && !shouldRenderChart ? (
                    <div className="h-full rounded-lg bg-secondary/30 animate-pulse" />
                  ) : !hasChartData ? (
                    <div className="flex h-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border/60 px-4 text-center text-xs text-muted-foreground">
                      <span>No historical price data yet. Once trading picks up, we'll plot it here.</span>
                      {polymarketLink && (
                        <a
                          href={polymarketLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline text-[10px]"
                        >
                          View on Polymarket
                        </a>
                      )}
                    </div>
                  ) : !hasSufficientHistory ? (
                    <div className="flex h-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border/60 px-4 text-center text-xs text-muted-foreground">
                      <span>
                        Not enough history for the {timeframe === "ALL" ? "all-time" : "30-day"} view yet. Please
                        check back once we record more data.
                      </span>
                      <Button size="xs" variant="outline" onClick={() => setTimeframe("1W")}>
                        View 1W instead
                      </Button>
                    </div>
                  ) : (
                    <ChartContainer
                      config={{
                        yes: { label: "Yes", color: "hsl(142, 76%, 36%)" },
                        no: { label: "No", color: "hsl(346, 77%, 49%)" },
                      }}
                      className="h-full w-full aspect-auto"
                    >
                      <AreaChart 
                        data={lineChartData} 
                        margin={{ top: 12, right: 8, left: 0, bottom: 4 }}
                      >
                        <defs>
                          <linearGradient id="yesGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.05} />
                          </linearGradient>
                          <linearGradient id="noGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(346, 77%, 49%)" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="hsl(346, 77%, 49%)" stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid 
                          strokeDasharray="3 3" 
                          stroke="hsl(var(--border))" 
                          opacity={0.1}
                          vertical={false}
                        />
                        <XAxis
                          dataKey="time"
                          tickLine={false}
                          axisLine={false}
                          minTickGap={32}
                          tick={{ 
                            fill: "hsl(var(--muted-foreground))", 
                            fontSize: 10,
                            fontWeight: 400
                          }}
                          height={20}
                        />
                        <YAxis 
                          domain={yAxisDomain} 
                          hide 
                        />
                        <ChartTooltip
                          cursor={{ 
                            stroke: "hsl(var(--muted-foreground))", 
                            strokeWidth: 1,
                            strokeOpacity: 0.15,
                            strokeDasharray: "4 4"
                          }}
                          content={<MinimalTooltip />}
                        />
                        <Area
                          type="monotone"
                          dataKey="yes"
                          stroke="hsl(142, 76%, 36%)"
                          strokeWidth={1.5}
                          fill="url(#yesGradient)"
                          fillOpacity={1}
                          isAnimationActive={true}
                          animationDuration={600}
                          animationEasing="ease-out"
                          dot={false}
                          activeDot={{ r: 3, fill: "hsl(142, 76%, 36%)", strokeWidth: 0 }}
                        />
                        <Area
                          type="monotone"
                          dataKey="no"
                          stroke="hsl(346, 77%, 49%)"
                          strokeWidth={1.5}
                          fill="url(#noGradient)"
                          fillOpacity={1}
                          isAnimationActive={true}
                          animationDuration={600}
                          animationEasing="ease-out"
                          dot={false}
                          activeDot={{ r: 3, fill: "hsl(346, 77%, 49%)", strokeWidth: 0 }}
                        />
                      </AreaChart>
                    </ChartContainer>
                  )}
                </div>
              </div>
            </div>

              {/* Place Order Section */}
              <div className="bg-card border border-border rounded-xl p-4 md:p-6 flex-1 lg:max-w-md">
                <h2 className="text-base md:text-lg font-semibold mb-6">Place Order</h2>
                
                <div className="space-y-4">
                  {/* Currency Selector - Minimal */}
                  {!isMultiOutcomeMarket && (
                    <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                      <span className="text-xs text-muted-foreground">Pay with</span>
                      <Tabs value={currency} onValueChange={(v) => setCurrency(v as "SOL" | "POINTS")} className="flex-1">
                        <TabsList className="grid w-full max-w-xs grid-cols-2 h-9">
                          <TabsTrigger value="POINTS" className="text-xs">
                            Points
                          </TabsTrigger>
                          <TabsTrigger value="SOL" className="text-xs">
                            SOL
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                      {balance && (
                        <span className="text-xs text-muted-foreground ml-auto">
                          {currency === "POINTS" 
                            ? `${balance.availablePoints?.toFixed(0) || 0} available`
                            : `$${balance.availableSolBalance?.toFixed(2) || "0.00"} available`}
                        </span>
                      )}
                    </div>
                  )}

                  {isMultiOutcomeMarket && balance && (
                    <div className="pb-2 border-b border-border/50">
                      <span className="text-xs text-muted-foreground">
                        Points only · {balance.availablePoints?.toFixed(0) || 0} available
                      </span>
                    </div>
                  )}

                  {/* Position Selection - Simplified */}
                  {!isMultiOutcomeMarket && (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPosition("yes");
                          if (amount) setAmount(amount);
                        }}
                        className={`relative rounded-lg p-4 transition-all ${
                          selectedPosition === "yes"
                            ? "bg-emerald-500/10 border-2 border-emerald-500"
                            : "bg-muted/30 border-2 border-transparent hover:border-border"
                        }`}
                      >
                        <div className="text-xs text-muted-foreground mb-1">Yes</div>
                        <div className={`text-xl font-semibold ${selectedPosition === "yes" ? "text-emerald-500" : "text-foreground"}`}>
                          {market.yesPrice.toFixed(2)}¢
                        </div>
                        {selectedPosition === "yes" && (
                          <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-500" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPosition("no");
                          if (amount) setAmount(amount);
                        }}
                        className={`relative rounded-lg p-4 transition-all ${
                          selectedPosition === "no"
                            ? "bg-rose-500/10 border-2 border-rose-500"
                            : "bg-muted/30 border-2 border-transparent hover:border-border"
                        }`}
                      >
                        <div className="text-xs text-muted-foreground mb-1">No</div>
                        <div className={`text-xl font-semibold ${selectedPosition === "no" ? "text-rose-500" : "text-foreground"}`}>
                          {market.noPrice.toFixed(2)}¢
                        </div>
                        {selectedPosition === "no" && (
                          <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500" />
                        )}
                      </button>
                    </div>
                  )}

                  {isMultiOutcomeMarket && (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedMultiOutcomeSide("yes")}
                        disabled={!selectedOutcome || getOutcomeYesPrice(selectedOutcome) == null}
                        className={`relative rounded-lg p-4 transition-all ${
                          selectedOutcome && getOutcomeYesPrice(selectedOutcome) != null
                            ? selectedMultiOutcomeSide === "yes"
                              ? "bg-emerald-500/10 border-2 border-emerald-500"
                              : "bg-muted/30 border-2 border-transparent hover:border-border"
                            : "bg-muted/20 border-2 border-transparent opacity-50 cursor-not-allowed"
                        }`}
                      >
                        <div className="text-xs text-muted-foreground mb-1">Buy Yes</div>
                        <div className={`text-xl font-semibold ${
                          selectedOutcome && getOutcomeYesPrice(selectedOutcome) != null && selectedMultiOutcomeSide === "yes"
                            ? "text-emerald-500"
                            : "text-foreground"
                        }`}>
                          {selectedOutcomeYesPrice != null ? `${selectedOutcomeYesPrice.toFixed(2)}¢` : "—"}
                        </div>
                        {selectedOutcome && getOutcomeYesPrice(selectedOutcome) != null && selectedMultiOutcomeSide === "yes" && (
                          <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-500" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedMultiOutcomeSide("no")}
                        disabled={
                          !selectedOutcome ||
                          getOutcomeNoPrice(selectedOutcome) == null ||
                          !getOutcomeNoTokenId(selectedOutcome)
                        }
                        className={`relative rounded-lg p-4 transition-all ${
                          selectedOutcome &&
                          getOutcomeNoPrice(selectedOutcome) != null &&
                          getOutcomeNoTokenId(selectedOutcome)
                            ? selectedMultiOutcomeSide === "no"
                              ? "bg-rose-500/10 border-2 border-rose-500"
                              : "bg-muted/30 border-2 border-transparent hover:border-border"
                            : "bg-muted/20 border-2 border-transparent opacity-50 cursor-not-allowed"
                        }`}
                      >
                        <div className="text-xs text-muted-foreground mb-1">Buy No</div>
                        <div className={`text-xl font-semibold ${
                          selectedOutcome &&
                          getOutcomeNoPrice(selectedOutcome) != null &&
                          getOutcomeNoTokenId(selectedOutcome) &&
                          selectedMultiOutcomeSide === "no"
                            ? "text-rose-500"
                            : "text-foreground"
                        }`}>
                          {selectedOutcomeNoPrice != null ? `${selectedOutcomeNoPrice.toFixed(2)}¢` : "—"}
                        </div>
                        {selectedOutcome &&
                          getOutcomeNoPrice(selectedOutcome) != null &&
                          getOutcomeNoTokenId(selectedOutcome) &&
                          selectedMultiOutcomeSide === "no" && (
                          <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500" />
                        )}
                      </button>
                    </div>
                  )}

                  {isMultiOutcomeMarket && selectedOutcome && (
                    <div className="rounded-lg bg-muted/20 p-3 border border-border/50">
                      <div className="text-xs font-medium text-foreground mb-2">{selectedOutcome.label}</div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Yes: {selectedOutcomeYesPrice != null ? `${selectedOutcomeYesPrice.toFixed(2)}¢` : "—"}</span>
                        <span>No: {selectedOutcomeNoPrice != null ? `${selectedOutcomeNoPrice.toFixed(2)}¢` : "—"}</span>
                      </div>
                    </div>
                  )}

                  {/* Amount Input - Clean */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "" || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
                          setAmount(value);
                        }
                      }}
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-base font-medium"
                    />
                    {amount && parseFloat(amount) > availableBalance && (
                      <p className="text-xs text-destructive">
                        Insufficient {currency === "POINTS" ? "points" : "balance"}
                      </p>
                    )}
                  </div>

                  {/* Order Summary - Minimal */}
                  {activeCalculation && (
                    <div className="rounded-lg bg-muted/20 p-4 space-y-2.5 border border-border/50">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Avg price</span>
                        <span className="font-medium">
                          {displayAvgPriceCents != null ? `${Number(displayAvgPriceCents).toFixed(2)}¢` : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Shares</span>
                        <span className="font-medium">{activeCalculation.shares.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Potential return</span>
                        <span className="font-semibold text-emerald-500">
                          {formatAmount(activeCalculation.potentialReturn)}
                        </span>
                      </div>
                      {activeCalculation.profit !== 0 && (
                        <div className="pt-2.5 border-t border-border/50 flex justify-between text-sm">
                          <span className="text-muted-foreground">Profit if you win</span>
                          <span className={`font-semibold ${activeCalculation.profit >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                            {activeCalculation.profit >= 0 ? "+" : ""}{formatAmount(activeCalculation.profit)}
                            <span className="ml-1 text-xs opacity-70">
                              ({activeCalculation.profitPercentage >= 0 ? "+" : ""}{activeCalculation.profitPercentage.toFixed(1)}%)
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Submit Button */}
                  {!isSignedIn ? (
                    <Button
                      onClick={() => window.location.href = "/auth"}
                      className="w-full h-11 text-sm"
                      variant="outline"
                    >
                      Sign in to place order
                    </Button>
                  ) : currency === "SOL" && !connected ? (
                    <WalletMultiButton className="w-full !bg-primary hover:!bg-primary/90 !text-primary-foreground !justify-center !h-11 !text-sm" />
                  ) : isMultiOutcomeMarket ? (
                    <Button
                      onClick={handlePlaceOrder}
                      disabled={
                        !selectedOutcome ||
                        !amount ||
                        parseFloat(amount) <= 0 ||
                        parseFloat(amount) > availableBalance ||
                        isPlacingOrder ||
                        selectedOutcomePriceCents == null ||
                        (selectedMultiOutcomeSide === "no" && !getOutcomeNoTokenId(selectedOutcome))
                      }
                      className="w-full h-11 text-sm font-medium"
                    >
                      {isPlacingOrder
                        ? "Placing order..."
                        : `Place ${selectedMultiOutcomeSide === "yes" ? "Yes" : "No"} order`}
                    </Button>
                  ) : (
                    <Button
                      onClick={handlePlaceOrder}
                      disabled={!selectedPosition || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > availableBalance || isPlacingOrder}
                      className="w-full h-11 text-sm font-medium"
                    >
                      {isPlacingOrder ? "Placing order..." : `Place ${selectedPosition === "yes" ? "Yes" : selectedPosition === "no" ? "No" : "Order"}`}
                    </Button>
                  )}
                </div>
                </div>
              </div>

            {/* Options Section - Below Chart and Bet Picker */}
            {isMultiOutcomeMarket && multiOutcomeOptions.length > 0 && (
              <div className="bg-card border border-border rounded-lg p-3 md:p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-3 mb-2 md:mb-3">
                  <h2 className="text-sm md:text-base font-semibold">Available Outcomes</h2>
                  {polymarketLink && (
                    <a
                      href={polymarketLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] md:text-xs text-primary hover:underline"
                    >
                      View on Polymarket
                    </a>
                  )}
                </div>

                <div className="space-y-1.5 md:space-y-2">
                  <div className="hidden md:grid grid-cols-[minmax(0,2.2fr)_minmax(0,1.1fr)_minmax(0,1.1fr)_minmax(0,1.3fr)] text-[10px] uppercase tracking-wide text-muted-foreground/80 px-3">
                    <span>Outcome</span>
                    <span className="text-center">Buy Yes</span>
                    <span className="text-center">Buy No</span>
                    <span className="text-right">Market Stats</span>
                  </div>
                  {/* Active Outcomes */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 md:gap-2">
                    {activeOutcomes.map((outcome) => {
                      const idx = outcome.index;
                      const yesPrice = getOutcomeYesPrice(outcome);
                      const noPrice = getOutcomeNoPrice(outcome);
                      const probability =
                        outcome.probability ??
                        (typeof yesPrice === "number" ? yesPrice / 100 : undefined);
                      const isSelected = selectedOutcomeIdx === idx;
                      const isYesSelected = isSelected && selectedMultiOutcomeSide === "yes";
                      const isNoSelected = isSelected && selectedMultiOutcomeSide === "no";
                      const yesTokenId = getOutcomeYesTokenId(outcome);
                      const noTokenId = getOutcomeNoTokenId(outcome);
                      const volume = getOutcomeVolume(outcome);
                      const liquidity = getOutcomeLiquidity(outcome);
                      const yesDisabled = yesPrice == null || !yesTokenId;
                      const noDisabled = noPrice == null || !noTokenId;

                      return (
                        <div
                          key={`${yesTokenId || outcome.tokenId || outcome.label}-${idx}`}
                          onClick={() => {
                            setSelectedOutcomeIdx(idx);
                            const tokenId = yesTokenId || outcome.tokenId;
                            if (tokenId) {
                              setSelectedOutcomeTokenId(tokenId);
                            }
                          }}
                          className={`h-full rounded-lg border px-2.5 py-2 md:px-3 md:py-2.5 transition-all ${
                            isSelected
                              ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                              : "border-border bg-secondary/30 hover:bg-secondary/40 cursor-pointer"
                          }`}
                        >
                          <div className="flex h-full flex-col justify-between gap-2">
                            <div className="flex flex-col gap-1 text-xs">
                              <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                                <span className="font-semibold text-foreground line-clamp-2 text-xs md:text-sm">
                                  {outcome.label || `Outcome ${idx + 1}`}
                                </span>
                                {!yesTokenId && (
                                  <Badge
                                    variant="outline"
                                    className="text-[9px] md:text-[10px] text-muted-foreground"
                                  >
                                    Coming Soon
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center justify-between text-[9px] md:text-[10px] text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  {volume != null && (
                                    <span>Vol {compactNumberFormatter.format(volume)}</span>
                                  )}
                                  {liquidity != null && (
                                    <span className="hidden sm:inline">· Liq {compactNumberFormatter.format(liquidity)}</span>
                                  )}
                                </span>
                                <span className="text-[9px] md:text-[10px]">
                                  {probability != null ? `${(probability * 100).toFixed(1)}%` : "—"}
                                </span>
                              </div>
                            </div>

                            <div className="mt-auto pt-1.5 md:pt-2">
                              <div className="grid grid-cols-2 gap-1.5">
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setSelectedOutcomeIdx(idx);
                                    const tokenId = yesTokenId || outcome.tokenId;
                                    if (tokenId) {
                                      setSelectedOutcomeTokenId(tokenId);
                                    }
                                    setSelectedMultiOutcomeSide("yes");
                                  }}
                                  disabled={yesDisabled}
                                  className={`w-full rounded-md border px-2 py-2 md:px-3 md:py-2.5 text-[11px] md:text-xs font-semibold transition ${
                                    yesDisabled
                                      ? "border-border bg-muted text-muted-foreground cursor-not-allowed"
                                      : isYesSelected
                                        ? "border-success bg-success text-success-foreground shadow-inner"
                                        : "border-success/40 bg-success/10 text-success hover:bg-success/20"
                                  }`}
                                >
                                  <span>Yes </span>
                                  {yesPrice != null ? `${yesPrice.toFixed(2)}¢` : "—"}
                                </button>
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setSelectedOutcomeIdx(idx);
                                    const tokenId = yesTokenId || outcome.tokenId;
                                    if (tokenId) {
                                      setSelectedOutcomeTokenId(tokenId);
                                    }
                                    setSelectedMultiOutcomeSide("no");
                                  }}
                                  disabled={noDisabled}
                                  className={`w-full rounded-md border px-2 py-2 md:px-3 md:py-2.5 text-[11px] md:text-xs font-semibold transition ${
                                    noDisabled
                                      ? "border-border bg-muted text-muted-foreground cursor-not-allowed"
                                      : isNoSelected
                                        ? "border-destructive bg-destructive text-destructive-foreground shadow-inner"
                                        : "border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20"
                                  }`}
                                >
                                  <span>No </span>
                                  {noPrice != null ? `${noPrice.toFixed(2)}¢` : "—"}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Resolved Outcomes Section */}
                  {resolvedOutcomes.length > 0 && (
                    <div className="mt-4 border-t border-border/50 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowResolvedOutcomes(!showResolvedOutcomes)}
                        className="flex w-full items-center justify-between rounded-lg bg-muted/30 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          Resolved ({resolvedOutcomes.length})
                        </span>
                        {showResolvedOutcomes ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                      
                      {showResolvedOutcomes && (
                        <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-1.5 md:gap-2">
                          {resolvedOutcomes.map((outcome) => {
                            const idx = outcome.index;
                            const yesPrice = getOutcomeYesPrice(outcome);
                            const isWinner = typeof yesPrice === "number" && yesPrice >= 99.5;
                            const yesTokenId = getOutcomeYesTokenId(outcome);
                            const volume = getOutcomeVolume(outcome);

                            return (
                              <div
                                key={`resolved-${yesTokenId || outcome.tokenId || outcome.label}-${idx}`}
                                className={`h-full rounded-lg border px-2.5 py-2 md:px-3 md:py-2.5 transition-all ${
                                  isWinner
                                    ? "border-success/40 bg-success/5"
                                    : "border-border/50 bg-muted/20 opacity-60"
                                }`}
                              >
                                <div className="flex h-full flex-col gap-1.5">
                                  <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                                    <span className={`font-semibold line-clamp-2 text-xs md:text-sm ${
                                      isWinner ? "text-success" : "text-muted-foreground"
                                    }`}>
                                      {outcome.label || `Outcome ${idx + 1}`}
                                    </span>
                                    <Badge
                                      variant={isWinner ? "default" : "secondary"}
                                      className={`text-[9px] md:text-[10px] ${
                                        isWinner 
                                          ? "bg-success/20 text-success border-success/30" 
                                          : "bg-muted text-muted-foreground"
                                      }`}
                                    >
                                      {isWinner ? "Won" : "Lost"}
                                    </Badge>
                                  </div>
                                  <div className="text-[9px] md:text-[10px] text-muted-foreground">
                                    {volume != null && (
                                      <span>Vol {compactNumberFormatter.format(volume)}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            <AIAgentPicks
              marketId={id!}
              picks={aiPicks}
              isLoading={aiPicksLoading}
              onRefresh={() => refetchAIPicks()}
            />
        </div>
      </div>

      {/* Wallet Connection Dialog */}
      <Dialog open={showWalletDialog} onOpenChange={setShowWalletDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Wallet Required</DialogTitle>
            <DialogDescription>
              You need to connect your Solana wallet to place bets with SOL or PRED tokens. 
              Connect your wallet to continue.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowWalletDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowWalletDialog(false);
                navigate("/wallet");
              }}
            >
              Go to Wallet Page
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Market;
