import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { getMarketUrl } from "@/utils/marketUrl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Activity,
  Award,
  BarChart3,
  Calendar,
  CheckCircle2,
  DollarSign,
  Download,
  Eye,
  ExternalLink,
  Filter,
  LineChart,
  RefreshCw,
  Settings,
  Sparkles,
  Trash2,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import {
  useActivePresale,
  useAdminMarkets,
  useAdminSeasons,
  useAdminStats,
  useAdminAnalyticsOverview,
  useAdminUserDetail,
  useAdminUsers,
  useAllPresales,
  useApproveSuggestion,
  useBulkApproveSuggestions,
  useBulkCreateMarketsFromSuggestions,
  useBulkDeleteMarkets,
  useClosePresale,
  useCompleteSeason,
  useCreateMarketFromSuggestion,
  useDetectMarkets,
  useDistributePresaleTokens,
  useImportPolymarket,
  useMarketSuggestions,
  usePresaleParticipants,
  useRejectSuggestion,
  useResolveMarket,
  useResolveMarketOutcome,
  useScanPresaleWallet,
  useUpdateMarket,
} from "@/hooks/use-admin";
import { useCreateMarket, useCategories, useMarket } from "@/hooks/use-markets";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAdminXReviewList, useAdminXReviewAction } from "@/hooks/use-admin-x";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, BarChart as RechartsBarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts";
import type { AdminUserListParams } from "@/api/admin";

type UserFilterState = {
  minPoints: string;
  maxPoints: string;
  minTokens: string;
  maxTokens: string;
  minReferrals: string;
  maxReferrals: string;
  presale: "all" | "participated" | "not_participated";
  joinedAfter: string;
  joinedBefore: string;
};

const initialUserFilters: UserFilterState = {
  minPoints: "",
  maxPoints: "",
  minTokens: "",
  maxTokens: "",
  minReferrals: "",
  maxReferrals: "",
  presale: "all",
  joinedAfter: "",
  joinedBefore: "",
};

const Admin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [bulkMax, setBulkMax] = useState<number | undefined>(undefined);
  const [bulkPageSize, setBulkPageSize] = useState<number | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [userPage, setUserPage] = useState(1);
  const [marketPage, setMarketPage] = useState(1);
  const [marketPageSize, setMarketPageSize] = useState(20);
  const [userSearch, setUserSearch] = useState("");
  const [marketSearch, setMarketSearch] = useState("");
  const [marketStatusFilter, setMarketStatusFilter] = useState<string>("all");
  const [suggestionPage, setSuggestionPage] = useState(1);
  const [suggestionPageSize, setSuggestionPageSize] = useState(20);
  const [suggestionStatusFilter, setSuggestionStatusFilter] = useState<string>("all");
  const [suggestionCategoryFilter, setSuggestionCategoryFilter] = useState<string>("all");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [resolveMarketId, setResolveMarketId] = useState<string | null>(null);
  const [resolveResolution, setResolveResolution] = useState<"yes" | "no">("yes");
  const [resolveWinningOutcome, setResolveWinningOutcome] = useState<string>("");
  const [resolveIsMultiOutcome, setResolveIsMultiOutcome] = useState<boolean>(false);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [createMarketDialogOpen, setCreateMarketDialogOpen] = useState(false);
  const [selectedMarketIds, setSelectedMarketIds] = useState<string[]>([]);
  const [selectedSuggestionIds, setSelectedSuggestionIds] = useState<string[]>([]);
  const [newMarket, setNewMarket] = useState({
    title: "",
    category: "",
    description: "",
    image: "/placeholder.svg",
    endDate: "",
  });
  const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
  const [userDetailDialogOpen, setUserDetailDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [presaleParticipantsPage, setPresaleParticipantsPage] = useState(1);
  const [presaleParticipantsSearch, setPresaleParticipantsSearch] = useState("");
  const [presaleLinkedFilter, setPresaleLinkedFilter] = useState<"all" | "linked" | "unlinked">("all");
  const [userFilters, setUserFilters] = useState<UserFilterState>(initialUserFilters);
  const [userFiltersDraft, setUserFiltersDraft] = useState<UserFilterState>(initialUserFilters);
  const [userFiltersDialogOpen, setUserFiltersDialogOpen] = useState(false);

  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const normalizedUserFilters = useMemo<Partial<AdminUserListParams>>(() => {
    const payload: Partial<AdminUserListParams> = {};
    if (userFilters.minPoints.trim()) payload.minPoints = Number(userFilters.minPoints);
    if (userFilters.maxPoints.trim()) payload.maxPoints = Number(userFilters.maxPoints);
    if (userFilters.minTokens.trim()) payload.minTokens = Number(userFilters.minTokens);
    if (userFilters.maxTokens.trim()) payload.maxTokens = Number(userFilters.maxTokens);
    if (userFilters.minReferrals.trim()) payload.minReferrals = Number(userFilters.minReferrals);
    if (userFilters.maxReferrals.trim()) payload.maxReferrals = Number(userFilters.maxReferrals);
    if (userFilters.presale !== "all") payload.presale = userFilters.presale;
    if (userFilters.joinedAfter) payload.joinedAfter = new Date(userFilters.joinedAfter).toISOString();
    if (userFilters.joinedBefore) payload.joinedBefore = new Date(userFilters.joinedBefore).toISOString();
    return payload;
  }, [userFilters]);
  const userQueryParams = useMemo<AdminUserListParams>(() => {
    return {
      page: userPage,
      limit: 20,
      search: userSearch || undefined,
      ...normalizedUserFilters,
    };
  }, [userPage, userSearch, normalizedUserFilters]);
  const normalizedUserFiltersKey = JSON.stringify(normalizedUserFilters);
  const { data: usersData, isLoading: usersLoading } = useAdminUsers(userQueryParams);
  const { data: activePresale, isLoading: presaleLoading } = useActivePresale();
  const { data: allPresales, isLoading: allPresalesLoading } = useAllPresales();
  const scanPresaleMutation = useScanPresaleWallet();
  const closePresaleMutation = useClosePresale();
  const distributePresaleMutation = useDistributePresaleTokens();
  const { data: marketsData, isLoading: marketsLoading } = useAdminMarkets({
    page: marketPage,
    limit: marketPageSize,
    status: marketStatusFilter === "all" ? undefined : marketStatusFilter,
    search: marketSearch || undefined,
  });
  const { data: seasons, isLoading: seasonsLoading } = useAdminSeasons();
  const {
    data: userDetailData,
    isLoading: userDetailLoading,
    isFetching: userDetailFetching,
  } = useAdminUserDetail(selectedUserId ?? undefined);
  const presaleParticipantsParams = useMemo(
    () => ({
      page: presaleParticipantsPage,
      limit: 25,
      search: presaleParticipantsSearch || undefined,
      linked: presaleLinkedFilter === "all" ? undefined : presaleLinkedFilter,
    }),
    [presaleParticipantsPage, presaleParticipantsSearch, presaleLinkedFilter]
  );
  const {
    data: presaleParticipantsData,
    isLoading: presaleParticipantsLoading,
    isFetching: presaleParticipantsFetching,
  } = usePresaleParticipants(activePresale?.presale?.id, presaleParticipantsParams);
  const { data: analyticsData, isLoading: analyticsLoading } = useAdminAnalyticsOverview();
  const { data: resolveMarketData } = useMarket(resolveMarketId ?? undefined);

  const resolveMarketMutation = useResolveMarket();
  const resolveMarketOutcomeMutation = useResolveMarketOutcome();
  const updateMarketMutation = useUpdateMarket();
  const bulkDeleteMarketsMutation = useBulkDeleteMarkets();
  const bulkApproveSuggestionsMutation = useBulkApproveSuggestions();
  const bulkCreateMarketsFromSuggestionsMutation = useBulkCreateMarketsFromSuggestions();
  const completeSeasonMutation = useCompleteSeason();
  const importPolymarketMutation = useImportPolymarket();
  const createMarketMutation = useCreateMarket();
  const { data: categories } = useCategories();

  // Market Suggestions hooks
  const { data: suggestionsData, isLoading: suggestionsLoading, error: suggestionsError } = useMarketSuggestions({
    page: suggestionPage,
    limit: suggestionPageSize,
    status: suggestionStatusFilter === "all" ? undefined : suggestionStatusFilter,
    category: suggestionCategoryFilter === "all" ? undefined : suggestionCategoryFilter,
  });

  if (suggestionsError) {
    // eslint-disable-next-line no-console
    console.error("Suggestions load error", suggestionsError);
  }
  const approveSuggestionMutation = useApproveSuggestion();
  const rejectSuggestionMutation = useRejectSuggestion();
  const createMarketFromSuggestionMutation = useCreateMarketFromSuggestion();
  const detectMarketsMutation = useDetectMarkets();

  // Admin X review
  const { data: xReviewItems, isLoading: xReviewLoading } = useAdminXReviewList();
  const xReviewAction = useAdminXReviewAction();
  const [xRejectReason, setXRejectReason] = useState("");
  const [xApprovePoints, setXApprovePoints] = useState<string>("");

  const handleXApprove = async (id: string) => {
    const pts = xApprovePoints ? parseInt(xApprovePoints, 10) : undefined;
    await xReviewAction.mutateAsync({ id, action: "approve", points: pts });
    setXApprovePoints("");
  };
  const handleXReject = async (id: string) => {
    await xReviewAction.mutateAsync({ id, action: "reject", reason: xRejectReason || undefined });
    setXRejectReason("");
  };

  const handleResolveMarket = async () => {
    if (!resolveMarketId) return;

    try {
      if (resolveIsMultiOutcome) {
        if (!resolveWinningOutcome) {
          toast.error("Please select a winning outcome");
          return;
        }
        await resolveMarketOutcomeMutation.mutateAsync({
          marketId: resolveMarketId,
          winningOutcome: resolveWinningOutcome,
        });
        toast.success(`Multi-outcome market resolved: ${resolveWinningOutcome}`);
      } else {
        await resolveMarketMutation.mutateAsync({
          marketId: resolveMarketId,
          resolution: resolveResolution,
        });
        toast.success(`Market resolved to ${resolveResolution.toUpperCase()}`);
      }
      setResolveDialogOpen(false);
      setResolveMarketId(null);
      setResolveWinningOutcome("");
      setResolveIsMultiOutcome(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to resolve market");
    }
  };

  const handleUpdateMarketStatus = async (marketId: string, status: string) => {
    try {
      await updateMarketMutation.mutateAsync({
        marketId,
        data: { status },
      });
      toast.success("Market status updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to update market");
    }
  };

  const handleCompleteSeason = async (seasonId: string) => {
    try {
      await completeSeasonMutation.mutateAsync(seasonId);
      toast.success("Season marked as completed");
    } catch (error: any) {
      toast.error(error.message || "Failed to complete season");
    }
  };

  const handleCreateMarket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Convert datetime-local format to ISO string
      const endDateISO = newMarket.endDate 
        ? new Date(newMarket.endDate).toISOString()
        : "";
      
      await createMarketMutation.mutateAsync({
        title: newMarket.title,
        category: newMarket.category,
        description: newMarket.description,
        image: newMarket.image,
        endDate: endDateISO,
      });
      setCreateMarketDialogOpen(false);
      setNewMarket({
        title: "",
        category: "",
        description: "",
        image: "/placeholder.svg",
        endDate: "",
      });
      // Markets list will auto-refresh due to query invalidation in useCreateMarket hook
      // Also invalidate admin markets query
      queryClient.invalidateQueries({ queryKey: ["admin", "markets"] });
    } catch (error: any) {
      // Error is already handled by the hook
    }
  };

  const handleApproveSuggestion = async (id: string) => {
    try {
      await approveSuggestionMutation.mutateAsync(id);
      toast.success("Suggestion approved");
    } catch (error: any) {
      toast.error(error.message || "Failed to approve suggestion");
    }
  };

  const handleRejectSuggestion = async () => {
    if (!selectedSuggestionId) return;
    try {
      await rejectSuggestionMutation.mutateAsync({
        id: selectedSuggestionId,
        rejectionReason: rejectionReason || undefined,
      });
      toast.success("Suggestion rejected");
      setRejectDialogOpen(false);
      setSelectedSuggestionId(null);
      setRejectionReason("");
    } catch (error: any) {
      toast.error(error.message || "Failed to reject suggestion");
    }
  };

  const handleCreateMarketFromSuggestion = async (id: string) => {
    try {
      const result = await createMarketFromSuggestionMutation.mutateAsync(id);
      toast.success("Market created successfully");
      if (result?.data) {
        navigate(getMarketUrl(result.data));
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create market");
    }
  };

  const handleDetectMarkets = async () => {
    try {
      await detectMarketsMutation.mutateAsync();
      toast.success("Market detection started. Results will appear shortly.");
    } catch (error: any) {
      toast.error(error.message || "Failed to start market detection");
    }
  };

  const activeUserFilterCount = useMemo(() => {
    let count = 0;
    const numericFields: Array<keyof UserFilterState> = [
      "minPoints",
      "maxPoints",
      "minTokens",
      "maxTokens",
      "minReferrals",
      "maxReferrals",
    ];
    numericFields.forEach((field) => {
      if (userFilters[field].trim()) {
        count += 1;
      }
    });
    if (userFilters.presale !== "all") {
      count += 1;
    }
    if (userFilters.joinedAfter) {
      count += 1;
    }
    if (userFilters.joinedBefore) {
      count += 1;
    }
    return count;
  }, [userFilters]);
  const hasActiveUserFilters = activeUserFilterCount > 0;

  const handleFilterDraftChange = (field: keyof UserFilterState, value: string) => {
    setUserFiltersDraft((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleApplyUserFilters = () => {
    setUserFilters(userFiltersDraft);
    setUserFiltersDialogOpen(false);
  };

  const handleResetUserFilters = () => {
    setUserFilters(initialUserFilters);
    setUserFiltersDraft(initialUserFilters);
    setUserFiltersDialogOpen(false);
  };

  const handleExportUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (userSearch) {
        params.set("search", userSearch);
      }
      Object.entries(normalizedUserFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.set(key, String(value));
        }
      });
      const token = localStorage.getItem("authToken");
      const qs = params.toString();
      const response = await fetch(
        `${apiBaseUrl}/admin/users/export${qs ? `?${qs}` : ""}`,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to export users");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `users-export-${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Users export ready");
    } catch (error: any) {
      toast.error(error.message || "Failed to export users");
    }
  };

  const handleViewUser = (userId: string) => {
    setSelectedUserId(userId);
    setUserDetailDialogOpen(true);
  };

  const handleExportParticipants = async () => {
    if (!activePresale?.presale?.id) return;
    try {
      const params = new URLSearchParams();
      if (presaleParticipantsSearch) {
        params.set("search", presaleParticipantsSearch);
      }
      if (presaleLinkedFilter !== "all") {
        params.set("linked", presaleLinkedFilter);
      }
      const token = localStorage.getItem("authToken");
      const qs = params.toString();
      const response = await fetch(
        `${apiBaseUrl}/admin/presale/${activePresale.presale.id}/participants/export${qs ? `?${qs}` : ""}`,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to export participants");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `presale-${activePresale.presale.id}-participants.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Export ready");
    } catch (error: any) {
      toast.error(error.message || "Failed to export participants");
    }
  };

  // Keep selections in sync with currently visible markets
  useEffect(() => {
    if (!marketsData?.data) {
      setSelectedMarketIds([]);
      return;
    }
    setSelectedMarketIds((prev) => prev.filter((id) => marketsData.data.some((market) => market.id === id)));
  }, [marketsData?.data]);

  useEffect(() => {
    setUserPage(1);
  }, [normalizedUserFiltersKey]);

  useEffect(() => {
    if (!suggestionsData?.data) {
      setSelectedSuggestionIds([]);
      return;
    }
    setSelectedSuggestionIds((prev) => prev.filter((id) => suggestionsData.data.some((suggestion) => suggestion.id === id)));
  }, [suggestionsData?.data]);

  useEffect(() => {
    if (!userDetailDialogOpen) {
      setSelectedUserId(null);
    }
  }, [userDetailDialogOpen]);

  useEffect(() => {
    if (userFiltersDialogOpen) {
      setUserFiltersDraft(userFilters);
    }
  }, [userFiltersDialogOpen, userFilters]);

  useEffect(() => {
    setPresaleParticipantsPage(1);
  }, [presaleParticipantsSearch, presaleLinkedFilter, activePresale?.presale?.id]);

  const handleToggleMarketSelection = (marketId: string, checked: boolean) => {
    setSelectedMarketIds((prev) => {
      if (checked) {
        if (prev.includes(marketId)) return prev;
        return [...prev, marketId];
      }
      return prev.filter((id) => id !== marketId);
    });
  };

  const handleSelectAllMarkets = (checked: boolean, currentMarketIds: string[]) => {
    if (!checked) {
      setSelectedMarketIds((prev) => prev.filter((id) => !currentMarketIds.includes(id)));
      return;
    }
    setSelectedMarketIds((prev) => {
      const merged = new Set([...prev, ...currentMarketIds]);
      return Array.from(merged);
    });
  };

  const handleBulkDeleteMarkets = async () => {
    if (selectedMarketIds.length === 0) return;
    try {
      await bulkDeleteMarketsMutation.mutateAsync(selectedMarketIds);
      toast.success(`Deleted ${selectedMarketIds.length} market${selectedMarketIds.length === 1 ? "" : "s"}`);
      setSelectedMarketIds([]);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete selected markets");
    }
  };

  const handleToggleSuggestionSelection = (suggestionId: string, checked: boolean) => {
    setSelectedSuggestionIds((prev) => {
      if (checked) {
        if (prev.includes(suggestionId)) return prev;
        return [...prev, suggestionId];
      }
      return prev.filter((id) => id !== suggestionId);
    });
  };

  const handleSelectAllSuggestions = (checked: boolean, currentSuggestionIds: string[]) => {
    if (!checked) {
      setSelectedSuggestionIds((prev) => prev.filter((id) => !currentSuggestionIds.includes(id)));
      return;
    }
    setSelectedSuggestionIds((prev) => {
      const merged = new Set([...prev, ...currentSuggestionIds]);
      return Array.from(merged);
    });
  };

  const handleBulkApproveSuggestions = async () => {
    if (selectedSuggestionIds.length === 0) return;
    try {
      const result = await bulkApproveSuggestionsMutation.mutateAsync(selectedSuggestionIds);
      const updated = result?.updated ?? selectedSuggestionIds.length;
      const failures = result?.failures?.length || 0;
      const failedIds = result?.failures?.map((failure: any) => failure.id) || [];
      toast.success(`Approved ${updated} suggestion${updated === 1 ? "" : "s"}${failures ? ` (${failures} failed)` : ""}`);
      setSelectedSuggestionIds(failedIds);
    } catch (error: any) {
      toast.error(error.message || "Failed to approve selected suggestions");
    }
  };

  const handleBulkCreateMarketsFromSuggestions = async () => {
    if (selectedSuggestionIds.length === 0) return;
    try {
      const result = await bulkCreateMarketsFromSuggestionsMutation.mutateAsync(selectedSuggestionIds);
      const created = result?.created ?? (result?.data?.length || 0);
      const failures = result?.failures?.length || 0;
      const failedIds = result?.failures?.map((failure: any) => failure.id) || [];
      toast.success(
        `Created ${created} market${created === 1 ? "" : "s"}${failures ? ` (${failures} failed)` : ""}`,
        { duration: 5000 }
      );
      setSelectedSuggestionIds(failedIds);
    } catch (error: any) {
      toast.error(error.message || "Failed to create markets from selected suggestions");
    }
  };

  const formatShortDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) {
      return dateStr;
    }
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const userGrowthChartData = useMemo(() => {
    if (!analyticsData?.userGrowth?.series) return [];
    return analyticsData.userGrowth.series.map((point) => ({
      date: point.date,
      users: point.value,
    }));
  }, [analyticsData]);

  const tradingVolumeChartData = useMemo(() => {
    if (!analyticsData?.tradingVolume?.series) return [];
    return analyticsData.tradingVolume.series.map((point) => ({
      date: point.date,
      volume: point.value,
    }));
  }, [analyticsData]);

  const presaleChartData = useMemo(() => {
    if (!analyticsData?.presale?.series) return [];
    return analyticsData.presale.series.map((point) => ({
      date: point.date,
      sol: point.value,
    }));
  }, [analyticsData]);

  const analyticsWindowDays = analyticsData?.windowDays ?? 30;
  const totalUsersCount = analyticsData?.userGrowth?.totalUsers ?? 0;
  const newUsersCount = analyticsData?.userGrowth?.newUsers ?? 0;
  const totalTradingVolume = analyticsData?.tradingVolume?.totalVolume ?? 0;
  const totalOrdersPlaced = analyticsData?.tradingVolume?.totalOrders ?? 0;
  const totalPresaleContributions = analyticsData?.presale?.totalContributions ?? 0;
  const totalPresaleParticipants = analyticsData?.presale?.participantCount ?? 0;
  const topPointUsers = analyticsData?.points?.topUsers ?? [];
  const topReferrers = analyticsData?.referrals?.topReferrers ?? [];
  const totalReferrals = analyticsData?.referrals?.totalReferrals ?? 0;

  const currentPageMarkets = marketsData?.data || [];
  const currentPageMarketIds = currentPageMarkets.map((market) => market.id);
  const allCurrentPageSelected =
    currentPageMarketIds.length > 0 && currentPageMarketIds.every((id) => selectedMarketIds.includes(id));
  const hasSelectionOnPage = currentPageMarketIds.some((id) => selectedMarketIds.includes(id));
  const headerCheckboxState = allCurrentPageSelected ? true : hasSelectionOnPage ? "indeterminate" : false;
  const hasMarketSelection = selectedMarketIds.length > 0;
  const isBulkDeleting = bulkDeleteMarketsMutation.isPending;
  const currentPageSuggestions = suggestionsData?.data || [];
  const currentPageSuggestionIds = currentPageSuggestions.map((suggestion) => suggestion.id);
  const allSuggestionsSelectedOnPage =
    currentPageSuggestionIds.length > 0 &&
    currentPageSuggestionIds.every((id) => selectedSuggestionIds.includes(id));
  const hasSuggestionSelectedOnPage = currentPageSuggestionIds.some((id) => selectedSuggestionIds.includes(id));
  const suggestionHeaderCheckboxState = allSuggestionsSelectedOnPage
    ? true
    : hasSuggestionSelectedOnPage
    ? "indeterminate"
    : false;
  const hasSuggestionSelection = selectedSuggestionIds.length > 0;
  const isBulkApprovingSuggestions = bulkApproveSuggestionsMutation.isPending;
  const isBulkCreatingMarketsFromSuggestions = bulkCreateMarketsFromSuggestionsMutation.isPending;
  const suggestionsBulkBusy = isBulkApprovingSuggestions || isBulkCreatingMarketsFromSuggestions;

  if (statsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">Manage markets, users, and system settings</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="analytics">
              <TrendingUp className="h-4 w-4 mr-2 inline" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="markets">Markets</TabsTrigger>
            <TabsTrigger value="suggestions">
              <Sparkles className="h-4 w-4 mr-2 inline" />
              AI Suggestions
            </TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="presale">Presale</TabsTrigger>
            <TabsTrigger value="seasons">Seasons</TabsTrigger>
            <TabsTrigger value="x">X Content</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {statsLoading ? (
              <div className="text-center py-8">Loading dashboard stats...</div>
            ) : stats ? (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.users?.total || 0}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Markets</CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.markets?.total || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        {stats.markets?.active || 0} active, {stats.markets?.resolved || 0} resolved
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        ${(stats.trading?.totalVolume || 0).toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.trading?.totalOrders || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        {stats.trading?.totalPositions || 0} positions
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest orders and transactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Market</TableHead>
                            <TableHead>Position</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Shares</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Time</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {stats.recentActivity.map((activity) => (
                          <TableRow key={activity.id}>
                            <TableCell className="font-medium">{activity.user}</TableCell>
                            <TableCell>{activity.market}</TableCell>
                            <TableCell>
                              <Badge variant={activity.position === "YES" ? "default" : "secondary"}>
                                {activity.position}
                              </Badge>
                            </TableCell>
                            <TableCell>${activity.amount.toFixed(2)}</TableCell>
                            <TableCell>{activity.shares.toFixed(2)}</TableCell>
                            <TableCell>
                              <Badge variant={activity.status === "FILLED" ? "default" : "outline"}>
                                {activity.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(activity.createdAt).toLocaleString()}
                            </TableCell>
                          </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">No recent activity</div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">Failed to load stats</div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {analyticsLoading ? (
              <div className="text-center py-8">Loading analytics...</div>
            ) : analyticsData ? (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{totalUsersCount.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">
                        {newUsersCount.toLocaleString()} new in last {analyticsWindowDays}d
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Trading Volume ({analyticsWindowDays}d)</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">${totalTradingVolume.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">
                        {totalOrdersPlaced.toLocaleString()} orders placed
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Presale Contributions</CardTitle>
                      <LineChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{totalPresaleContributions.toFixed(2)} SOL</div>
                      <p className="text-xs text-muted-foreground">
                        {totalPresaleParticipants.toLocaleString()} participants
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{totalReferrals.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">Across the entire platform</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>User Growth ({analyticsWindowDays}d)</CardTitle>
                      <CardDescription>Daily signups</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {userGrowthChartData.length > 0 ? (
                        <ChartContainer
                          config={{
                            users: { label: "New Users", color: "hsl(var(--chart-1))" },
                          }}
                          className="w-full"
                        >
                          <AreaChart data={userGrowthChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tickFormatter={formatShortDate} tickLine={false} axisLine={false} />
                            <YAxis hide />
                            <ChartTooltip content={<ChartTooltipContent nameKey="users" labelKey="date" />} />
                            <Area
                              type="monotone"
                              dataKey="users"
                              stroke="var(--color-users)"
                              fill="var(--color-users)"
                              fillOpacity={0.2}
                            />
                          </AreaChart>
                        </ChartContainer>
                      ) : (
                        <div className="text-center text-sm text-muted-foreground py-4">Not enough data</div>
                      )}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Trading Volume</CardTitle>
                      <CardDescription>Orders executed per day</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {tradingVolumeChartData.length > 0 ? (
                        <ChartContainer
                          config={{
                            volume: { label: "Volume", color: "hsl(var(--chart-2))" },
                          }}
                          className="w-full"
                        >
                          <RechartsBarChart data={tradingVolumeChartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="date" tickFormatter={formatShortDate} tickLine={false} axisLine={false} />
                            <YAxis hide />
                            <ChartTooltip content={<ChartTooltipContent nameKey="volume" labelKey="date" />} />
                            <Bar dataKey="volume" fill="var(--color-volume)" radius={[4, 4, 0, 0]} />
                          </RechartsBarChart>
                        </ChartContainer>
                      ) : (
                        <div className="text-center text-sm text-muted-foreground py-4">Not enough data</div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Presale Contributions</CardTitle>
                      <CardDescription>Incoming SOL per day</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {presaleChartData.length > 0 ? (
                        <ChartContainer
                          config={{
                            sol: { label: "SOL", color: "hsl(var(--chart-3))" },
                          }}
                          className="w-full"
                        >
                          <AreaChart data={presaleChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tickFormatter={formatShortDate} tickLine={false} axisLine={false} />
                            <YAxis hide />
                            <ChartTooltip content={<ChartTooltipContent nameKey="sol" labelKey="date" />} />
                            <Area
                              type="monotone"
                              dataKey="sol"
                              stroke="var(--color-sol)"
                              fill="var(--color-sol)"
                              fillOpacity={0.25}
                            />
                          </AreaChart>
                        </ChartContainer>
                      ) : (
                        <div className="text-center text-sm text-muted-foreground py-4">No presale data</div>
                      )}
                    </CardContent>
                  </Card>
                  <div className="grid gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Points Leaderboard</CardTitle>
                        <CardDescription>Top engagement scores</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {topPointUsers.length > 0 ? (
                          <div className="space-y-3">
                            {topPointUsers.map((user, index) => (
                              <div key={`${user.id ?? index}-points`} className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">{user.username}</p>
                                  {user.email && <p className="text-xs text-muted-foreground">{user.email}</p>}
                                </div>
                                <Badge variant="secondary">{user.points.toLocaleString()} pts</Badge>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center">No data yet</p>
                        )}
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Referral Leaders</CardTitle>
                        <CardDescription>Top inviters</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {topReferrers.length > 0 ? (
                          <div className="space-y-3">
                            {topReferrers.map((user, index) => (
                              <div key={`${user.id ?? index}-ref`} className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">{user.username}</p>
                                  {user.email && <p className="text-xs text-muted-foreground">{user.email}</p>}
                                </div>
                                <Badge variant="outline">{user.referrals.toLocaleString()} referrals</Badge>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center">No referral data yet</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">Failed to load analytics</div>
            )}
          </TabsContent>

          <TabsContent value="markets" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Market Management</CardTitle>
                    <CardDescription>Create, resolve markets and manage their status</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Max (e.g. 2000)"
                      className="w-28"
                      onChange={(e) => setBulkMax(parseInt(e.target.value || "0", 10) || undefined)}
                    />
                    <Input
                      type="number"
                      placeholder="PageSize (e.g. 500)"
                      className="w-32"
                      onChange={(e) => setBulkPageSize(parseInt(e.target.value || "0", 10) || undefined)}
                    />
                    <Button
                      variant="outline"
                      onClick={async () => {
                        try {
                          const params = bulkMax ? { max: bulkMax, pageSize: bulkPageSize || 500 } : { limit: 500 };
                          const res = await importPolymarketMutation.mutateAsync(params as any);
                          const payload = res?.data || res;
                          const created = payload?.created || 0;
                          const skipped = payload?.skipped || 0;
                          const errors = payload?.errors || 0;
                          toast.success(
                            `Imported ${created}, skipped ${skipped}, errors ${errors}. Check AI Suggestions tab.`,
                            { duration: 6000 }
                          );
                          setActiveTab("suggestions");
                          await queryClient.invalidateQueries({ queryKey: ["admin", "market-suggestions"] });
                        } catch (e: any) {
                          toast.error(e?.message || "Import failed");
                        }
                      }}
                      disabled={importPolymarketMutation.isPending}
                    >
                      {importPolymarketMutation.isPending ? "Importing..." : "Import from Polymarket"}
                    </Button>
                    <Dialog open={createMarketDialogOpen} onOpenChange={setCreateMarketDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>Create Market</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Create New Market</DialogTitle>
                          <DialogDescription>
                            Create a new prediction market. Title, category, and end date are required.
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateMarket} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                              id="title"
                              placeholder="Will Bitcoin reach $100,000 by end of 2025?"
                              value={newMarket.title}
                              onChange={(e) => setNewMarket({ ...newMarket, title: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="category">Category *</Label>
                            <Select
                              value={newMarket.category}
                              onValueChange={(value) => setNewMarket({ ...newMarket, category: value })}
                              required
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories && categories.length > 0 ? (
                                  categories.map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                      {cat}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <>
                                    <SelectItem value="Crypto">Crypto</SelectItem>
                                    <SelectItem value="Politics">Politics</SelectItem>
                                    <SelectItem value="Sports">Sports</SelectItem>
                                    <SelectItem value="Entertainment">Entertainment</SelectItem>
                                    <SelectItem value="Technology">Technology</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                  </>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                              id="description"
                              placeholder="Optional description of the market..."
                              value={newMarket.description}
                              onChange={(e) => setNewMarket({ ...newMarket, description: e.target.value })}
                              rows={4}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="image">Image URL</Label>
                            <Input
                              id="image"
                              placeholder="/placeholder.svg"
                              value={newMarket.image}
                              onChange={(e) => setNewMarket({ ...newMarket, image: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="endDate">End Date *</Label>
                            <Input
                              id="endDate"
                              type="datetime-local"
                              value={newMarket.endDate}
                              onChange={(e) => setNewMarket({ ...newMarket, endDate: e.target.value })}
                              required
                              min={new Date().toISOString().slice(0, 16)}
                            />
                          </div>
                          <DialogFooter>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setCreateMarketDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button type="submit" disabled={createMarketMutation.isPending}>
                              {createMarketMutation.isPending ? "Creating..." : "Create Market"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="flex gap-2 items-center flex-wrap">
                    <Input
                      placeholder="Search markets..."
                      value={marketSearch}
                      onChange={(e) => setMarketSearch(e.target.value)}
                      className="flex-1"
                    />
                    <Select value={marketStatusFilter} onValueChange={setMarketStatusFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="CLOSED">Closed</SelectItem>
                        <SelectItem value="RESOLVED">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={String(marketPageSize)} onValueChange={(v) => { setMarketPageSize(parseInt(v, 10)); setMarketPage(1); }}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Page size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 / page</SelectItem>
                        <SelectItem value="20">20 / page</SelectItem>
                        <SelectItem value="50">50 / page</SelectItem>
                        <SelectItem value="100">100 / page</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {hasMarketSelection && (
                    <div className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-4 py-2">
                      <p className="text-sm text-muted-foreground">
                        {selectedMarketIds.length} market{selectedMarketIds.length === 1 ? "" : "s"} selected
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedMarketIds([])}
                          disabled={isBulkDeleting}
                        >
                          Clear
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleBulkDeleteMarkets}
                          disabled={isBulkDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
                          {isBulkDeleting ? "Deleting..." : "Delete Selected"}
                        </Button>
                      </div>
                    </div>
                  )}

                  {marketsLoading ? (
                    <div className="text-center py-8">Loading markets...</div>
                  ) : marketsData && marketsData.data && marketsData.data.length > 0 ? (
                    <>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">
                              <Checkbox
                                aria-label="Select all markets on this page"
                                checked={headerCheckboxState}
                                onCheckedChange={(checked) =>
                                  handleSelectAllMarkets(checked === true, currentPageMarketIds)
                                }
                                disabled={currentPageMarketIds.length === 0}
                              />
                            </TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Volume</TableHead>
                            <TableHead>Orders</TableHead>
                            <TableHead>End Date</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentPageMarkets.map((market) => (
                            <TableRow key={market.id}>
                              <TableCell>
                                <Checkbox
                                  aria-label={`Select market ${market.title}`}
                                  checked={selectedMarketIds.includes(market.id)}
                                  onCheckedChange={(checked) =>
                                    handleToggleMarketSelection(market.id, checked === true)
                                  }
                                />
                              </TableCell>
                              <TableCell className="font-medium">{market.title}</TableCell>
                              <TableCell>{market.category}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    market.status === "active"
                                      ? "default"
                                      : market.status === "resolved"
                                      ? "secondary"
                                      : "outline"
                                  }
                                >
                                  {market.status}
                                </Badge>
                                {market.resolution && (
                                  <Badge variant="outline" className="ml-2">
                  {market.resolution}
                </Badge>
                                )}
                              </TableCell>
                              <TableCell>${market.volume.toFixed(2)}</TableCell>
                              <TableCell>{market.orderCount}</TableCell>
                              <TableCell>
                                {new Date(market.endDate).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  {market.status !== "resolved" && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          setResolveMarketId(market.id);
                                          setResolveIsMultiOutcome(Boolean((market as any).isMultiOutcome));
                                          setResolveWinningOutcome("");
                                          setResolveResolution("yes");
                                          setResolveDialogOpen(true);
                                        }}
                                      >
                                        Resolve
                                      </Button>
                                      {market.status === "active" && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() =>
                                            handleUpdateMarketStatus(market.id, "closed")
                                          }
                                        >
                                          Close
                                        </Button>
                                      )}
                                    </>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => navigate(getMarketUrl(market))}
                                  >
                                    View
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      {marketsData?.pagination && marketsData.pagination.totalPages > 1 && (
                        <div className="flex justify-between items-center gap-2 flex-wrap">
                          <p className="text-sm text-muted-foreground">
                            Page {marketsData.pagination.page} of {marketsData.pagination.totalPages}
                          </p>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setMarketPage((p) => Math.max(1, p - 1))}
                              disabled={marketPage === 1}
                            >
                              Previous
                            </Button>
                            {(() => {
                              const total = marketsData.pagination.totalPages;
                              const current = marketsData.pagination.page;
                              const pages: number[] = [];
                              const start = Math.max(1, current - 2);
                              const end = Math.min(total, current + 2);
                              if (start > 1) pages.push(1);
                              if (start > 2) pages.push(-1); // ellipsis marker
                              for (let i = start; i <= end; i++) pages.push(i);
                              if (end < total - 1) pages.push(-1);
                              if (end < total) pages.push(total);
                              return (
                                <div className="flex gap-1">
                                  {pages.map((p, idx) =>
                                    p === -1 ? (
                                      <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">…</span>
                                    ) : (
                                      <Button
                                        key={p}
                                        variant={p === current ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setMarketPage(p)}
                                      >
                                        {p}
                                      </Button>
                                    )
                                  )}
                                </div>
                              );
                            })()}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setMarketPage((p) => Math.min(marketsData.pagination.totalPages, p + 1))}
                              disabled={marketPage === marketsData.pagination.totalPages}
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : marketsData && marketsData.data && marketsData.data.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No markets found</div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">Failed to load markets</div>
                  )}
                </CardContent>
              </Card>

              <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Resolve Market</DialogTitle>
                    <DialogDescription>
                      Select the resolution for this market. This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    {resolveIsMultiOutcome ? (
                      <>
                        <p className="text-sm text-muted-foreground">
                          Select the winning outcome for this multi-outcome market.
                        </p>
                        <Select
                          value={resolveWinningOutcome}
                          onValueChange={(value: string) => setResolveWinningOutcome(value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select winning outcome" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.isArray((resolveMarketData as any)?.outcomes) &&
                              (resolveMarketData as any).outcomes.map((o: any) => (
                                <SelectItem key={o.label} value={o.label}>
                                  {o.label}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </>
                    ) : (
                      <Select
                        value={resolveResolution}
                        onValueChange={(value: "yes" | "no") => setResolveResolution(value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              YES
                            </div>
                          </SelectItem>
                          <SelectItem value="no">
                            <div className="flex items-center gap-2">
                              <XCircle className="h-4 w-4 text-red-500" />
                              NO
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setResolveDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleResolveMarket}
                      disabled={resolveMarketMutation.isPending || resolveMarketOutcomeMutation.isPending}
                    >
                      {resolveMarketMutation.isPending || resolveMarketOutcomeMutation.isPending
                        ? "Resolving..."
                        : "Resolve Market"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>

            <TabsContent value="suggestions" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>AI Market Suggestions</CardTitle>
                      <CardDescription>
                        Review and approve AI-generated market suggestions from news, trends, and events
                      </CardDescription>
                    </div>
                    <Button
                      onClick={handleDetectMarkets}
                      disabled={detectMarketsMutation.isPending}
                      variant="outline"
                    >
                      <RefreshCw
                        className={`h-4 w-4 mr-2 ${detectMarketsMutation.isPending ? "animate-spin" : ""}`}
                      />
                      {detectMarketsMutation.isPending ? "Detecting..." : "Detect Markets"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2 flex-wrap items-center">
                    <Select
                      value={suggestionStatusFilter}
                      onValueChange={setSuggestionStatusFilter}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="APPROVED">Approved</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                        <SelectItem value="CREATED">Created</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={suggestionCategoryFilter}
                      onValueChange={setSuggestionCategoryFilter}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories && categories.length > 0 ? (
                          categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))
                        ) : (
                          <>
                            <SelectItem value="Crypto">Crypto</SelectItem>
                            <SelectItem value="Politics">Politics</SelectItem>
                            <SelectItem value="Sports">Sports</SelectItem>
                            <SelectItem value="Entertainment">Entertainment</SelectItem>
                            <SelectItem value="Technology">Technology</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                    <Select value={String(suggestionPageSize)} onValueChange={(v) => { setSuggestionPageSize(parseInt(v, 10)); setSuggestionPage(1); }}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Page size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 / page</SelectItem>
                        <SelectItem value="20">20 / page</SelectItem>
                        <SelectItem value="50">50 / page</SelectItem>
                        <SelectItem value="100">100 / page</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {hasSuggestionSelection && (
                    <div className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-4 py-2">
                      <p className="text-sm text-muted-foreground">
                        {selectedSuggestionIds.length} suggestion{selectedSuggestionIds.length === 1 ? "" : "s"} selected
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedSuggestionIds([])}
                          disabled={suggestionsBulkBusy}
                        >
                          Clear
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={handleBulkApproveSuggestions}
                          disabled={suggestionsBulkBusy}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          {isBulkApprovingSuggestions ? "Approving..." : "Approve Selected"}
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleBulkCreateMarketsFromSuggestions}
                          disabled={suggestionsBulkBusy}
                        >
                          <Sparkles className="h-4 w-4" />
                          {isBulkCreatingMarketsFromSuggestions ? "Creating..." : "Create Markets"}
                        </Button>
                      </div>
                    </div>
                  )}

                  {suggestionsError ? (
                    <div className="text-center py-8 text-red-500">
                      Failed to load suggestions: {suggestionsError instanceof Error ? suggestionsError.message : "Unknown error"}
                    </div>
                  ) : suggestionsLoading ? (
                    <div className="text-center py-8">Loading suggestions...</div>
                  ) : suggestionsData && suggestionsData.data && suggestionsData.data.length > 0 ? (
                    <>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">
                              <Checkbox
                                aria-label="Select all suggestions on this page"
                                checked={suggestionHeaderCheckboxState}
                                onCheckedChange={(checked) =>
                                  handleSelectAllSuggestions(checked === true, currentPageSuggestionIds)
                                }
                                disabled={currentPageSuggestionIds.length === 0}
                              />
                            </TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Volume</TableHead>
                            <TableHead>Confidence</TableHead>
                            <TableHead>Source</TableHead>
                            <TableHead>End Date</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentPageSuggestions.map((suggestion) => (
                            <TableRow key={suggestion.id}>
                              <TableCell>
                                <Checkbox
                                  aria-label={`Select suggestion ${suggestion.title}`}
                                  checked={selectedSuggestionIds.includes(suggestion.id)}
                                  onCheckedChange={(checked) =>
                                    handleToggleSuggestionSelection(suggestion.id, checked === true)
                                  }
                                />
                              </TableCell>
                              <TableCell className="font-medium max-w-md">
                                <div className="space-y-1">
                                  <div>{suggestion.title}</div>
                                  {suggestion.description && (
                                    <div className="text-xs text-muted-foreground line-clamp-2">
                                      {suggestion.description}
                                    </div>
                                  )}
                                  {suggestion.sourceUrl && (
                                    <a
                                      href={suggestion.sourceUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                      Source
                                    </a>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{suggestion.category}</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    suggestion.status === "APPROVED"
                                      ? "default"
                                      : suggestion.status === "REJECTED"
                                      ? "destructive"
                                      : suggestion.status === "CREATED"
                                      ? "secondary"
                                      : "outline"
                                  }
                                >
                                  {suggestion.status}
                                </Badge>
                                {suggestion.market && (
                                  <Badge variant="outline" className="ml-2">
                                    Market Created
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {(() => {
                                  const sourceData = suggestion.sourceData as any;
                                  const volume = sourceData?.polymarket?.volume || sourceData?.polymarket?.aggregatedVolume;
                                  if (volume && typeof volume === "number" && volume > 0) {
                                    return (
                                      <div className="text-sm font-medium">
                                        ${volume.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                      </div>
                                    );
                                  }
                                  return <span className="text-muted-foreground text-sm">-</span>;
                                })()}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="text-sm font-medium">
                                    {(suggestion.confidence * 100).toFixed(0)}%
                                  </div>
                                  {suggestion.sourceData?.momentumScore && (
                                    <div className="text-xs text-muted-foreground">
                                      Momentum: {(suggestion.sourceData.momentumScore * 100).toFixed(0)}%
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">
                                  {suggestion.sourceType.replace("_", " ")}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {suggestion.proposedEndDate ? (
                                  <div className="text-sm">
                                    {new Date(suggestion.proposedEndDate).toLocaleDateString()}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground text-sm">Not set</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  {suggestion.status === "PENDING" && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="default"
                                        onClick={() => handleApproveSuggestion(suggestion.id)}
                                        disabled={approveSuggestionMutation.isPending}
                                      >
                                        <CheckCircle2 className="h-4 w-4 mr-1" />
                                        Approve
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => {
                                          setSelectedSuggestionId(suggestion.id);
                                          setRejectDialogOpen(true);
                                        }}
                                      >
                                        <XCircle className="h-4 w-4 mr-1" />
                                        Reject
                                      </Button>
                                    </>
                                  )}
                                  {suggestion.status === "APPROVED" && (
                                    <Button
                                      size="sm"
                                      variant="default"
                                      onClick={() => handleCreateMarketFromSuggestion(suggestion.id)}
                                      disabled={createMarketFromSuggestionMutation.isPending}
                                    >
                                      {createMarketFromSuggestionMutation.isPending
                                        ? "Creating..."
                                        : "Create Market"}
                                    </Button>
                                  )}
                                  {suggestion.marketId && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => navigate(`/market/${suggestion.marketId}`)} // Using ID since we don't have full market object
                                    >
                                      View Market
                                    </Button>
                                  )}
                                  {suggestion.status === "REJECTED" && suggestion.rejectionReason && (
                                    <div className="text-xs text-muted-foreground max-w-xs">
                                      {suggestion.rejectionReason}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      {suggestionsData?.pagination && suggestionsData.pagination.totalPages > 1 && (
                        <div className="flex justify-between items-center gap-2 flex-wrap">
                          <p className="text-sm text-muted-foreground">
                            Page {suggestionsData.pagination.page} of {suggestionsData.pagination.totalPages} ({suggestionsData.pagination.total} total)
                          </p>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSuggestionPage((p) => Math.max(1, p - 1))}
                              disabled={suggestionPage === 1}
                            >
                              Previous
                            </Button>
                            {(() => {
                              const total = suggestionsData.pagination.totalPages;
                              const current = suggestionsData.pagination.page;
                              const pages: number[] = [];
                              const start = Math.max(1, current - 2);
                              const end = Math.min(total, current + 2);
                              if (start > 1) pages.push(1);
                              if (start > 2) pages.push(-1);
                              for (let i = start; i <= end; i++) pages.push(i);
                              if (end < total - 1) pages.push(-1);
                              if (end < total) pages.push(total);
                              return (
                                <div className="flex gap-1">
                                  {pages.map((p, idx) =>
                                    p === -1 ? (
                                      <span key={`s-ellipsis-${idx}`} className="px-2 text-muted-foreground">…</span>
                                    ) : (
                                      <Button
                                        key={`s-page-${p}`}
                                        variant={p === current ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setSuggestionPage(p)}
                                      >
                                        {p}
                                      </Button>
                                    )
                                  )}
                                </div>
                              );
                            })()}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSuggestionPage((p) => Math.min(suggestionsData.pagination.totalPages, p + 1))}
                              disabled={suggestionPage === suggestionsData.pagination.totalPages}
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : suggestionsData && suggestionsData.data && suggestionsData.data.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No suggestions found. Click "Detect Markets" to generate new suggestions.
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Failed to load suggestions
                    </div>
                  )}
                </CardContent>
              </Card>

              <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reject Suggestion</DialogTitle>
                    <DialogDescription>
                      Provide a reason for rejecting this suggestion (optional)
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="rejectionReason">Rejection Reason</Label>
                      <Textarea
                        id="rejectionReason"
                        placeholder="Optional reason for rejection..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        rows={4}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleRejectSuggestion}
                      disabled={rejectSuggestionMutation.isPending}
                      variant="destructive"
                    >
                      {rejectSuggestionMutation.isPending ? "Rejecting..." : "Reject"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>View and manage user accounts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Input
                      placeholder="Search users by email, username, or wallet..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="flex-1 min-w-[220px]"
                    />
                    <Button variant="outline" onClick={() => setUserFiltersDialogOpen(true)}>
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                      {hasActiveUserFilters && (
                        <Badge variant="secondary" className="ml-2">
                          {activeUserFilterCount}
                        </Badge>
                      )}
                    </Button>
                    <Button variant="outline" onClick={handleExportUsers}>
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                  {hasActiveUserFilters && (
                    <p className="text-xs text-muted-foreground">
                      Filters applied. Reset or adjust filters from the Filters dialog.
                    </p>
                  )}

                  {usersLoading ? (
                    <div className="text-center py-8">Loading users...</div>
                  ) : usersData && usersData.data && usersData.data.length > 0 ? (
                    <>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Email</TableHead>
                            <TableHead>Username</TableHead>
                            <TableHead>Wallets</TableHead>
                            <TableHead>Points</TableHead>
                            <TableHead>Tokens</TableHead>
                            <TableHead>Presale</TableHead>
                            <TableHead>Orders</TableHead>
                            <TableHead>Positions</TableHead>
                            <TableHead>Referrals</TableHead>
                            <TableHead>Joined</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {usersData.data.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">{user.email}</TableCell>
                              <TableCell>{user.username}</TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-1 text-xs">
                                  {user.solWalletAddress && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-muted-foreground">SOL:</span>
                                      <span className="font-mono">{user.solWalletAddress.slice(0, 8)}...</span>
                                    </div>
                                  )}
                                  {user.evmWalletAddress && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-muted-foreground">EVM:</span>
                                      <span className="font-mono">{user.evmWalletAddress.slice(0, 8)}...</span>
                                    </div>
                                  )}
                                  {!user.solWalletAddress && !user.evmWalletAddress && (
                                    <span className="text-muted-foreground">No wallet</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-semibold">{user.stats.points.toLocaleString()}</span>
                                  <span className="text-xs text-muted-foreground">
                                    Total: {user.stats.totalPointsEarned.toLocaleString()}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="font-semibold">{user.stats.tokenBalance.toLocaleString()}</span>
                                <span className="text-xs text-muted-foreground ml-1">PRED</span>
                              </TableCell>
                              <TableCell>
                                {user.presale.participated ? (
                                  <div className="flex flex-col">
                                    <Badge variant="default" className="w-fit">Yes</Badge>
                                    <span className="text-xs text-muted-foreground mt-1">
                                      {user.presale.solContributed?.toFixed(2)} SOL
                                    </span>
                                    {user.presale.totalTokens && (
                                      <span className="text-xs text-muted-foreground">
                                        {user.presale.totalTokens.toLocaleString()} tokens
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <Badge variant="outline">No</Badge>
                                )}
                              </TableCell>
                              <TableCell>{user.stats.orders}</TableCell>
                              <TableCell>{user.stats.positions}</TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-semibold">{user.stats.referrals}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {user.stats.totalTrades > 0 ? `${user.stats.winRate.toFixed(1)}% win` : "No trades"}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {new Date(user.createdAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm" onClick={() => handleViewUser(user.id)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      {usersData?.pagination && usersData.pagination.totalPages > 1 && (
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-muted-foreground">
                            Page {usersData.pagination.page} of {usersData.pagination.totalPages}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                              disabled={userPage === 1}
                            >
                              Previous
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setUserPage((p) =>
                                  Math.min(usersData.pagination.totalPages, p + 1)
                                )
                              }
                              disabled={userPage === usersData.pagination.totalPages}
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : usersData && usersData.data && usersData.data.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No users found</div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">Failed to load users</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="presale" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Presale Management</CardTitle>
                  <CardDescription>Manage presale contributions and token distribution</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {presaleLoading ? (
                    <div className="text-center py-8">Loading presale data...</div>
                  ) : activePresale?.presale ? (
                    <>
                      <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Total Contributions</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-2xl font-bold">{activePresale.presale.totalContributions.toFixed(2)} SOL</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {activePresale.presale.participantCount} participants
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Token Allocation</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-2xl font-bold">{activePresale.presale.tokenAllocation.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground mt-1">PRED tokens</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Status</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Badge variant={activePresale.presale.status === "ACTIVE" ? "default" : "secondary"}>
                              {activePresale.presale.status}
                            </Badge>
                            <p className="text-sm text-muted-foreground mt-2">
                              {new Date(activePresale.presale.startDate).toLocaleDateString()} - {new Date(activePresale.presale.endDate).toLocaleDateString()}
                            </p>
                          </CardContent>
                        </Card>
                      </div>

                      <Card>
                        <CardHeader>
                          <CardTitle>Presale Wallet</CardTitle>
                          <CardDescription>Wallet address for direct SOL contributions</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2">
                            <code className="px-3 py-2 bg-muted rounded text-sm font-mono">
                              {activePresale.presale.presaleWalletAddress}
                            </code>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(activePresale.presale.presaleWalletAddress || "");
                                toast.success("Wallet address copied!");
                              }}
                            >
                              Copy
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                window.open(`https://solscan.io/account/${activePresale.presale.presaleWalletAddress}?cluster=devnet`, "_blank");
                              }}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View on Solscan
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            if (activePresale.presale.id) {
                              scanPresaleMutation.mutate(activePresale.presale.id);
                            }
                          }}
                          disabled={scanPresaleMutation.isPending || !activePresale.presale.id}
                        >
                          <RefreshCw className={`h-4 w-4 mr-2 ${scanPresaleMutation.isPending ? "animate-spin" : ""}`} />
                          Scan Wallet
                        </Button>
                        {activePresale.presale.status === "ACTIVE" && (
                          <Button
                            variant="destructive"
                            onClick={() => {
                              if (activePresale.presale.id && confirm("Are you sure you want to close this presale? This will calculate token allocations.")) {
                                closePresaleMutation.mutate(activePresale.presale.id);
                              }
                            }}
                            disabled={closePresaleMutation.isPending || !activePresale.presale.id}
                          >
                            Close Presale
                          </Button>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No active presale found.
                    </div>
                  )}

                  {allPresales && allPresales.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>All Presales</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Contributions</TableHead>
                              <TableHead>Participants</TableHead>
                              <TableHead>Dates</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {allPresales.map((presale: any) => (
                              <TableRow key={presale.id}>
                                <TableCell className="font-medium">{presale.name}</TableCell>
                                <TableCell>
                                  <Badge variant={presale.status === "ACTIVE" ? "default" : "secondary"}>
                                    {presale.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>{presale.totalContributions.toFixed(2)} SOL</TableCell>
                                <TableCell>{presale.participantCount}</TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {new Date(presale.startDate).toLocaleDateString()} - {new Date(presale.endDate).toLocaleDateString()}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  )}

                  {activePresale?.presale?.id && (
                    <Card>
                      <CardHeader>
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <CardTitle>Presale Participants</CardTitle>
                            <CardDescription>Track contributions and link wallets</CardDescription>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExportParticipants}
                            disabled={presaleParticipantsLoading || presaleParticipantsFetching}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Export CSV
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          <Input
                            className="flex-1 min-w-[220px]"
                            placeholder="Search wallet, tx hash, email..."
                            value={presaleParticipantsSearch}
                            onChange={(e) => setPresaleParticipantsSearch(e.target.value)}
                          />
                          <Select
                            value={presaleLinkedFilter}
                            onValueChange={(value) => setPresaleLinkedFilter(value as "all" | "linked" | "unlinked")}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All participants</SelectItem>
                              <SelectItem value="linked">Linked accounts</SelectItem>
                              <SelectItem value="unlinked">Wallet only</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {presaleParticipantsData?.summary && (
                          <div className="grid gap-4 md:grid-cols-4">
                            <div className="rounded-lg border border-border p-4">
                              <p className="text-sm text-muted-foreground">Total SOL</p>
                              <p className="text-2xl font-semibold">
                                {presaleParticipantsData.summary.totalSol.toFixed(2)} SOL
                              </p>
                            </div>
                            <div className="rounded-lg border border-border p-4">
                              <p className="text-sm text-muted-foreground">Total Tokens</p>
                              <p className="text-2xl font-semibold">
                                {presaleParticipantsData.summary.totalTokens.toLocaleString()}
                              </p>
                            </div>
                            <div className="rounded-lg border border-border p-4">
                              <p className="text-sm text-muted-foreground">Linked Users</p>
                              <p className="text-2xl font-semibold">{presaleParticipantsData.summary.linkedCount}</p>
                            </div>
                            <div className="rounded-lg border border-border p-4">
                              <p className="text-sm text-muted-foreground">Wallet-Only</p>
                              <p className="text-2xl font-semibold">{presaleParticipantsData.summary.unlinkedCount}</p>
                            </div>
                          </div>
                        )}

                        {presaleParticipantsLoading ? (
                          <div className="text-center py-8">Loading participants...</div>
                        ) : presaleParticipantsData && presaleParticipantsData.data.length > 0 ? (
                          <>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Wallet</TableHead>
                                  <TableHead>User</TableHead>
                                  <TableHead>SOL</TableHead>
                                  <TableHead>Tokens</TableHead>
                                  <TableHead>Referral</TableHead>
                                  <TableHead>Tx Hash</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {presaleParticipantsData.data.map((participant) => (
                                  <TableRow key={participant.id}>
                                    <TableCell className="font-mono text-xs">
                                      <div className="flex items-center gap-2">
                                        <span>{participant.walletAddress.slice(0, 8)}...</span>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => navigator.clipboard.writeText(participant.walletAddress)}
                                        >
                                          Copy
                                        </Button>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      {participant.user ? (
                                        <div className="flex flex-col">
                                          <span className="font-medium">{participant.user.username}</span>
                                          <span className="text-xs text-muted-foreground">{participant.user.email}</span>
                                        </div>
                                      ) : (
                                        <span className="text-muted-foreground text-sm">Not linked</span>
                                      )}
                                    </TableCell>
                                    <TableCell>{participant.solContributed.toFixed(2)} SOL</TableCell>
                                    <TableCell>
                                      {participant.totalTokens?.toLocaleString() ?? (
                                        <span className="text-muted-foreground text-sm">Pending</span>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      {participant.referralCodeUsed ? (
                                        <Badge variant="outline">{participant.referralCodeUsed}</Badge>
                                      ) : (
                                        <span className="text-muted-foreground text-sm">—</span>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      {participant.txHash ? (
                                        <a
                                          href={`https://solscan.io/tx/${participant.txHash}?cluster=devnet`}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-primary text-xs hover:underline"
                                        >
                                          {participant.txHash.slice(0, 10)}...
                                        </a>
                                      ) : (
                                        <span className="text-muted-foreground text-sm">—</span>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant={participant.user ? "default" : "outline"}>
                                        {participant.user ? "Linked" : "Wallet"}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {participant.user?.id ? (
                                        <Button variant="ghost" size="sm" onClick={() => handleViewUser(participant.user!.id)}>
                                          <Eye className="h-4 w-4 mr-2" />
                                          View
                                        </Button>
                                      ) : (
                                        <span className="text-muted-foreground text-sm">—</span>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>

                            {presaleParticipantsData.pagination.totalPages > 1 && (
                              <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                  Page {presaleParticipantsData.pagination.page} of{" "}
                                  {presaleParticipantsData.pagination.totalPages}
                                </p>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPresaleParticipantsPage((p) => Math.max(1, p - 1))}
                                    disabled={presaleParticipantsPage === 1}
                                  >
                                    Previous
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      setPresaleParticipantsPage((p) =>
                                        Math.min(presaleParticipantsData.pagination.totalPages, p + 1)
                                      )
                                    }
                                    disabled={presaleParticipantsPage === presaleParticipantsData.pagination.totalPages}
                                  >
                                    Next
                                  </Button>
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            No participants match your filters
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="seasons" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Season Management</CardTitle>
                  <CardDescription>Manage reward seasons and leaderboards</CardDescription>
                </CardHeader>
                <CardContent>
                  {seasonsLoading ? (
                    <div className="text-center py-8">Loading seasons...</div>
                  ) : seasons && seasons.length > 0 ? (
                    <div className="space-y-4">
                      {seasons.map((season) => (
                        <Card key={season.id}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle>{season.name}</CardTitle>
                                <CardDescription>
                                  {new Date(season.startDate).toLocaleDateString()} -{" "}
                                  {new Date(season.endDate).toLocaleDateString()}
                                </CardDescription>
                              </div>
                              <Badge
                                variant={
                                  season.status === "ACTIVE"
                                    ? "default"
                                    : season.status === "COMPLETED"
                                    ? "secondary"
                                    : "outline"
                                }
                              >
                                {season.status}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid gap-4 md:grid-cols-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Reward Pool</p>
                                <p className="text-lg font-semibold">
                                  ${season.totalRewardPool.toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Top 10%</p>
                                <p className="text-lg font-semibold">
                                  {(season.top10Percent * 100).toFixed(0)}%
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Top Reward</p>
                                <p className="text-lg font-semibold">
                                  {(season.topRewardPercent * 100).toFixed(0)}%
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Remaining</p>
                                <p className="text-lg font-semibold">
                                  {(season.remainingPercent * 100).toFixed(0)}%
                                </p>
                              </div>
                            </div>
                            {season.status === "ACTIVE" && (
                              <div className="mt-4">
                                <Button
                                  onClick={() => handleCompleteSeason(season.id)}
                                  disabled={completeSeasonMutation.isPending}
                                >
                                  {completeSeasonMutation.isPending
                                    ? "Completing..."
                                    : "Mark as Completed"}
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No seasons found. Create a new season to get started.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="x" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>X Content Review</CardTitle>
                  <CardDescription>Approve or reject user-submitted tweets</CardDescription>
                </CardHeader>
                <CardContent>
                  {xReviewLoading ? (
                    <div className="text-center py-8">Loading review queue...</div>
                  ) : xReviewItems && xReviewItems.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tweet</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {xReviewItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div className="space-y-1">
                                <a className="text-primary hover:underline" href={item.url} target="_blank" rel="noreferrer">{item.url}</a>
                                <div className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{item.status}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Input
                                  placeholder="Points"
                                  className="w-24"
                                  value={xApprovePoints}
                                  onChange={(e) => setXApprovePoints(e.target.value)}
                                />
                                <Button size="sm" variant="default" onClick={() => handleXApprove(item.id)} disabled={xReviewAction.isPending}>Approve</Button>
                                <Input
                                  placeholder="Reason"
                                  className="w-40"
                                  value={xRejectReason}
                                  onChange={(e) => setXRejectReason(e.target.value)}
                                />
                                <Button size="sm" variant="destructive" onClick={() => handleXReject(item.id)} disabled={xReviewAction.isPending}>Reject</Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">No items pending review</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>

      <Dialog open={userFiltersDialogOpen} onOpenChange={setUserFiltersDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Filters</DialogTitle>
            <DialogDescription>Refine the user list with advanced filters.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Points range</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={userFiltersDraft.minPoints}
                  onChange={(e) => handleFilterDraftChange("minPoints", e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={userFiltersDraft.maxPoints}
                  onChange={(e) => handleFilterDraftChange("maxPoints", e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Token balance (PRED)</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={userFiltersDraft.minTokens}
                  onChange={(e) => handleFilterDraftChange("minTokens", e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={userFiltersDraft.maxTokens}
                  onChange={(e) => handleFilterDraftChange("maxTokens", e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Referral count</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={userFiltersDraft.minReferrals}
                  onChange={(e) => handleFilterDraftChange("minReferrals", e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={userFiltersDraft.maxReferrals}
                  onChange={(e) => handleFilterDraftChange("maxReferrals", e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Presale participation</Label>
              <Select
                value={userFiltersDraft.presale}
                onValueChange={(value) => handleFilterDraftChange("presale", value as UserFilterState["presale"])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All users</SelectItem>
                  <SelectItem value="participated">Participated</SelectItem>
                  <SelectItem value="not_participated">Not participated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Joined between</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  value={userFiltersDraft.joinedAfter}
                  onChange={(e) => handleFilterDraftChange("joinedAfter", e.target.value)}
                />
                <Input
                  type="date"
                  value={userFiltersDraft.joinedBefore}
                  onChange={(e) => handleFilterDraftChange("joinedBefore", e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleResetUserFilters}>
              Reset
            </Button>
            <Button onClick={handleApplyUserFilters}>Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={userDetailDialogOpen} onOpenChange={setUserDetailDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>Comprehensive profile, presale history, and engagement</DialogDescription>
          </DialogHeader>
          {userDetailLoading || userDetailFetching ? (
            <div className="py-10 text-center text-muted-foreground">Loading user data...</div>
          ) : userDetailData ? (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-semibold">{userDetailData.profile.username}</h3>
                  <p className="text-sm text-muted-foreground">{userDetailData.profile.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Joined {new Date(userDetailData.profile.createdAt).toLocaleString()}
                  </p>
                </div>
                <Badge variant="outline">{userDetailData.profile.role}</Badge>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {[
                  { label: "Points", value: userDetailData.stats.points.toLocaleString() },
                  { label: "Token Balance", value: userDetailData.stats.tokenBalance.toLocaleString() },
                  { label: "Total Trades", value: userDetailData.stats.totalTrades.toLocaleString() },
                  { label: "Win Rate", value: `${userDetailData.stats.winRate.toFixed(1)}%` },
                  {
                    label: "Presale SOL",
                    value: `${userDetailData.stats.presale.totalSol.toFixed(2)} SOL`,
                  },
                  {
                    label: "Presale Tokens",
                    value: userDetailData.stats.presale.totalTokens.toLocaleString(),
                  },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-lg border border-border p-4">
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-xl font-semibold">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div>
                <h4 className="font-semibold mb-2">Wallets</h4>
                <div className="grid gap-2 md:grid-cols-2">
                  {[
                    { label: "SOL Wallet", value: userDetailData.profile.solWalletAddress },
                    { label: "EVM Wallet", value: userDetailData.profile.evmWalletAddress },
                    { label: "Legacy Wallet", value: userDetailData.profile.walletAddress },
                  ].map((wallet) => (
                    <div key={wallet.label} className="flex items-center justify-between rounded-md border border-dashed p-3">
                      <div>
                        <p className="text-xs text-muted-foreground">{wallet.label}</p>
                        <p className="font-mono text-sm">
                          {wallet.value ? `${wallet.value.slice(0, 12)}...` : "Not connected"}
                        </p>
                      </div>
                      {wallet.value && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigator.clipboard.writeText(wallet.value || "")}
                        >
                          Copy
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {userDetailData.presaleContributions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Presale Contributions</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Presale</TableHead>
                        <TableHead>SOL</TableHead>
                        <TableHead>Tokens</TableHead>
                        <TableHead>Referral</TableHead>
                        <TableHead>Tx Hash</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userDetailData.presaleContributions.slice(0, 8).map((contribution) => (
                        <TableRow key={contribution.id}>
                          <TableCell>{contribution.presale?.name || "Presale"}</TableCell>
                          <TableCell>{contribution.solContributed.toFixed(2)} SOL</TableCell>
                          <TableCell>{contribution.totalTokens?.toLocaleString() || "—"}</TableCell>
                          <TableCell>{contribution.referralCodeUsed || "—"}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {contribution.txHash ? `${contribution.txHash.slice(0, 10)}...` : "—"}
                          </TableCell>
                          <TableCell>{new Date(contribution.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {userDetailData.transactions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Recent Transactions</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {userDetailData.transactions.map((tx) => (
                      <div key={tx.id} className="rounded-md border border-border p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium capitalize">{tx.type.toLowerCase()}</p>
                            <p className="text-xs text-muted-foreground">{tx.description || tx.market?.title}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{tx.amount.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                        <Badge variant={tx.status === "COMPLETED" ? "default" : "outline"} className="mt-2">
                          {tx.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-semibold">Referrals</h4>
                {userDetailData.referrals.count > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {userDetailData.referrals.users.map((ref) => (
                      <div key={ref.id} className="rounded-md border border-border p-3">
                        <p className="font-medium">{ref.username}</p>
                        <p className="text-xs text-muted-foreground">{ref.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Joined {new Date(ref.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No referrals yet.</p>
                )}
              </div>

              {userDetailData.activityTimeline.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Activity Timeline</h4>
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {userDetailData.activityTimeline.map((event) => (
                      <div key={`${event.type}-${event.id}`} className="rounded-md border border-border p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{event.title}</p>
                            <p className="text-xs text-muted-foreground capitalize">{event.type}</p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(event.timestamp).toLocaleString()}
                          </p>
                        </div>
                        {typeof event.amount === "number" && (
                          <p className="text-sm font-semibold mt-2">{event.amount.toLocaleString()}</p>
                        )}
                        {event.status && (
                          <Badge variant="outline" className="mt-2">
                            {event.status}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-10 text-center text-muted-foreground">Select a user to view details.</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;

