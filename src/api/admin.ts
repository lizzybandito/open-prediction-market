import { apiClient } from "./client";

export interface AdminStats {
  users: {
    total: number;
  };
  markets: {
    total: number;
    active: number;
    resolved: number;
    closed: number;
  };
  trading: {
    totalVolume: number;
    totalOrders: number;
    totalPositions: number;
  };
  recentActivity: Array<{
    id: string;
    user: string;
    market: string;
    position: string;
    amount: number;
    shares: number;
    status: string;
    createdAt: string;
  }>;
}

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  createdAt: string;
  evmWalletAddress?: string;
  solWalletAddress?: string;
  stats: {
    orders: number;
    positions: number;
    transactions: number;
    points: number;
    totalPointsEarned: number;
    tokenBalance: number;
    totalTrades: number;
    winRate: number;
    referrals: number;
  };
  presale: {
    participated: boolean;
    solContributed?: number;
    totalTokens?: number | null;
    presaleName?: string;
    presaleStatus?: string;
  };
}

export interface AdminUserFilters {
  minPoints?: number;
  maxPoints?: number;
  minTokens?: number;
  maxTokens?: number;
  presale?: "participated" | "not_participated";
  minReferrals?: number;
  maxReferrals?: number;
  joinedAfter?: string;
  joinedBefore?: string;
}

export interface AdminUserListParams extends AdminUserFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export interface AdminMarket {
  id: string;
  title: string;
  category: string;
  status: string;
  resolution?: string;
  yesPrice: number;
  noPrice: number;
  volume: number;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  creator: string | null;
  orderCount: number;
  positionCount: number;
  isMultiOutcome?: boolean;
}

export interface AdminUserProfile {
  id: string;
  email?: string;
  username: string;
  avatar?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  walletAddress?: string | null;
  solWalletAddress?: string | null;
  evmWalletAddress?: string | null;
  referralCode?: string | null;
  referredBy?: string | null;
  referrer?: {
    id: string;
    username: string;
    email?: string | null;
  } | null;
}

export interface AdminUserStatsDetail {
  orders: number;
  positions: number;
  transactions: number;
  points: number;
  totalPointsEarned: number;
  tokenBalance: number;
  totalVolume: number;
  totalTrades: number;
  winRate: number;
  lastActiveDate?: string | null;
  seasonsPlayed: number;
  engagementScore: number;
  referrals: number;
  presale: {
    totalSol: number;
    totalTokens: number;
  };
}

export interface AdminUserDetailTimelineEntry {
  id: string;
  type: string;
  title: string;
  timestamp: string;
  amount?: number;
  status?: string;
  meta?: Record<string, unknown>;
}

export interface AdminUserDetail {
  profile: AdminUserProfile;
  stats: AdminUserStatsDetail;
  engagement?: Record<string, unknown> | null;
  tokenBalance?: Record<string, unknown> | null;
  transactions: Array<{
    id: string;
    type: string;
    amount: number;
    status: string;
    createdAt: string;
    description?: string | null;
    txHash?: string | null;
    market?: {
      id: string;
      title: string;
    } | null;
  }>;
  orders: Array<{
    id: string;
    position: string;
    amount: number;
    shares: number;
    price: number;
    status: string;
    createdAt: string;
    market?: {
      id: string;
      title: string;
    } | null;
  }>;
  positions: Array<{
    id: string;
    position: string;
    shares: number;
    avgPrice: number;
    totalInvested: number;
    createdAt: string;
    updatedAt: string;
    market?: {
      id: string;
      title: string;
      status?: string;
    } | null;
  }>;
  presaleContributions: Array<{
    id: string;
    presale?: {
      id: string;
      name: string;
      status: string;
    } | null;
    solContributed: number;
    totalTokens?: number | null;
    referralCodeUsed?: string | null;
    txHash?: string | null;
    createdAt: string;
  }>;
  referrals: {
    count: number;
    users: Array<{
      id: string;
      username: string;
      email?: string | null;
      createdAt: string;
    }>;
  };
  referralBonuses: Array<{
    id: string;
    type: string;
    baseAmount: number;
    bonusAmount: number;
    status: string;
    createdAt: string;
  }>;
  engagementAwards: Array<{
    id: string;
    source: string;
    points: number;
    status: string;
    createdAt: string;
  }>;
  activityTimeline: AdminUserDetailTimelineEntry[];
}

export interface AdminSeason {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  totalRewardPool: number;
  topRewardPercent: number;
  top10Percent: number;
  remainingPercent: number;
  createdAt: string;
  completedAt?: string;
}

export interface AdminPresaleParticipant {
  id: string;
  walletAddress: string;
  solContributed: number;
  baseTokens?: number | null;
  referralBonus: number;
  bettingBonus: number;
  totalTokens?: number | null;
  referralCodeUsed?: string | null;
  txHash?: string | null;
  linkedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    username: string;
    email?: string | null;
    solWalletAddress?: string | null;
    evmWalletAddress?: string | null;
  } | null;
}

export interface AdminPresaleParticipantsResponse extends PaginatedResponse<AdminPresaleParticipant> {
  summary: {
    totalSol: number;
    totalTokens: number;
    linkedCount: number;
    unlinkedCount: number;
  };
  presale: {
    id: string;
    name: string;
    status: string;
  };
}

export interface AdminAnalyticsOverview {
  windowDays: number;
  userGrowth: {
    totalUsers: number;
    newUsers: number;
    series: Array<{ date: string; value: number }>;
  };
  tradingVolume: {
    totalVolume: number;
    totalOrders: number;
    series: Array<{ date: string; value: number }>;
  };
  presale: {
    totalContributions: number;
    participantCount: number;
    series: Array<{ date: string; value: number }>;
  };
  points: {
    topUsers: Array<{ id: string | null | undefined; username: string; email?: string | null; points: number }>;
  };
  referrals: {
    totalReferrals: number;
    topReferrers: Array<{ id: string | null | undefined; username: string; email?: string | null; referrals: number }>;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MarketSuggestion {
  id: string;
  title: string;
  category: string;
  description?: string;
  proposedEndDate?: string;
  resolutionCriteria?: string;
  sourceType: "NEWS_API" | "SOCIAL_MEDIA" | "EVENTS" | "AI_ANALYSIS" | "USER_SUBMIT" | "TRENDS";
  sourceUrl?: string;
  sourceData?: any;
  confidence: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CREATED" | "DUPLICATE";
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewer?: {
    id: string;
    username: string;
  };
  marketId?: string;
  market?: {
    id: string;
    title: string;
    status: string;
  };
}

export const adminApi = {
  getStats: async (): Promise<AdminStats> => {
    const response = await apiClient.get<AdminStats>("/admin/stats");
    return response.data;
  },

  getUsers: async (params?: AdminUserListParams): Promise<PaginatedResponse<AdminUser>> => {
    const response = await apiClient.get<any>("/admin/users", params);
    // API returns { success: true, data: [...], pagination: {...} }
    // We need to reconstruct PaginatedResponse
    return {
      data: response.data || [],
      pagination: response.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 },
    };
  },

  getUser: async (userId: string): Promise<AdminUserDetail> => {
    const response = await apiClient.get<AdminUserDetail>(`/admin/users/${userId}`);
    return response.data;
  },

  getMarkets: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<PaginatedResponse<AdminMarket>> => {
    const response = await apiClient.get<any>("/admin/markets", params);
    // API returns { success: true, data: [...], pagination: {...} }
    // We need to reconstruct PaginatedResponse
    return {
      data: response.data || [],
      pagination: response.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 },
    };
  },

  resolveMarket: async (marketId: string, resolution: "yes" | "no"): Promise<any> => {
    const response = await apiClient.post(`/admin/markets/${marketId}/resolve`, { resolution });
    return response.data;
  },

  resolveMarketOutcome: async (marketId: string, winningOutcome: string): Promise<any> => {
    const response = await apiClient.post(`/admin/markets/${marketId}/resolve-outcome`, {
      winningOutcome,
    });
    return response.data;
  },

  updateMarket: async (marketId: string, data: {
    status?: string;
    resolution?: string;
  }): Promise<any> => {
    const response = await apiClient.patch(`/admin/markets/${marketId}`, data);
    return response.data;
  },

  bulkDeleteMarkets: async (marketIds: string[]): Promise<any> => {
    const response = await apiClient.post(`/admin/markets/bulk-delete`, { marketIds });
    return response.data;
  },

  getSeasons: async (): Promise<AdminSeason[]> => {
    const response = await apiClient.get<AdminSeason[]>("/admin/seasons");
    return response.data;
  },

  createSeason: async (season: Partial<AdminSeason>): Promise<AdminSeason> => {
    const response = await apiClient.post<AdminSeason>("/admin/seasons", season);
    return response.data;
  },

  updateSeason: async (seasonId: string, season: Partial<AdminSeason>): Promise<AdminSeason> => {
    const response = await apiClient.post<AdminSeason>("/admin/seasons", { id: seasonId, ...season });
    return response.data;
  },

  completeSeason: async (seasonId: string): Promise<void> => {
    await apiClient.post(`/admin/seasons/${seasonId}/complete`);
  },

  // Market Suggestions
  getMarketSuggestions: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
  }): Promise<PaginatedResponse<MarketSuggestion>> => {
    const response = await apiClient.get<any>("/market-suggestions", params);
    // API returns { success: true, data: [...], pagination: {...} }
    // We need to reconstruct PaginatedResponse
    return {
      data: response.data || [],
      pagination: response.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 },
    };
  },

  getMarketSuggestion: async (id: string): Promise<MarketSuggestion> => {
    const response = await apiClient.get<MarketSuggestion>(`/market-suggestions/${id}`);
    return response.data;
  },

  approveSuggestion: async (id: string): Promise<MarketSuggestion> => {
    const response = await apiClient.post<MarketSuggestion>(`/market-suggestions/${id}/approve`);
    return response.data;
  },

  bulkApproveSuggestions: async (suggestionIds: string[]): Promise<any> => {
    const response = await apiClient.post(`/market-suggestions/bulk/approve`, { suggestionIds });
    return response.data;
  },

  rejectSuggestion: async (id: string, rejectionReason?: string): Promise<MarketSuggestion> => {
    const response = await apiClient.post<MarketSuggestion>(`/market-suggestions/${id}/reject`, {
      rejectionReason,
    });
    return response.data;
  },

  createMarketFromSuggestion: async (id: string): Promise<any> => {
    const response = await apiClient.post(`/market-suggestions/${id}/create-market`);
    return response.data;
  },

  bulkCreateMarketsFromSuggestions: async (suggestionIds: string[]): Promise<any> => {
    const response = await apiClient.post(`/market-suggestions/bulk/create-markets`, { suggestionIds });
    return response.data;
  },

  detectMarkets: async (): Promise<void> => {
    await apiClient.post("/market-suggestions/detect");
  },

  importPolymarketMarkets: async (params: { limit?: number; max?: number; pageSize?: number; mode?: string; slug?: string } | number = 100): Promise<any> => {
    // Accept either number or object
    const p = typeof params === "number" ? { limit: params } : (params || {});
    const mode = p.mode || "markets";
    const slug = p.slug;
    // Prefer query-string to bypass any JSON parsing middlewares in some setups
    const qs = new URLSearchParams({
      mode: String(mode),
      ...(p.limit ? { limit: String(p.limit) } : {}),
      ...(p.max ? { max: String(p.max) } : {}),
      ...(p.pageSize ? { pageSize: String(p.pageSize) } : {}),
      ...(slug ? { slug } : {}),
      replace: "true",
    }).toString();
    const response = await apiClient.post<any>(`/markets/import/polymarket?${qs}`);
    return response;
  },

  importPolymarketEvents: async (params: { limit?: number; slug?: string } = {}): Promise<any> => {
    const qs = new URLSearchParams({
      mode: "events",
      ...(params.limit ? { limit: String(params.limit) } : {}),
      ...(params.slug ? { slug: params.slug } : {}),
      replace: "true",
    }).toString();
    const response = await apiClient.post<any>(`/markets/import/polymarket?${qs}`);
    return response;
  },

  // Presale management
  getActivePresale: async (): Promise<any> => {
    const response = await apiClient.get<any>("/presale/active");
    return response.data;
  },

  getAllPresales: async (): Promise<any[]> => {
    const response = await apiClient.get<any>("/presale/admin/all");
    return response.data || [];
  },

  scanPresaleWallet: async (presaleId: string): Promise<any> => {
    const response = await apiClient.post<any>(`/presale/admin/${presaleId}/scan`);
    return response.data;
  },

  closePresale: async (presaleId: string): Promise<any> => {
    const response = await apiClient.post<any>(`/presale/admin/${presaleId}/close`);
    return response.data;
  },

  distributePresaleTokens: async (presaleId: string, seasonId: string): Promise<any> => {
    const response = await apiClient.post<any>(`/presale/admin/${presaleId}/distribute`, { seasonId });
    return response.data;
  },

  getPresaleParticipants: async (
    presaleId: string,
    params?: { page?: number; limit?: number; search?: string; linked?: "linked" | "unlinked" }
  ): Promise<AdminPresaleParticipantsResponse> => {
    const response = await apiClient.get<any>(`/admin/presale/${presaleId}/participants`, params);
    return {
      data: response.data || [],
      pagination: response.pagination || { page: 1, limit: 25, total: 0, totalPages: 0 },
      summary: response.summary || { totalSol: 0, totalTokens: 0, linkedCount: 0, unlinkedCount: 0 },
      presale: response.presale || { id: presaleId, name: "", status: "" },
    };
  },

  getAnalyticsOverview: async (params?: { days?: number }): Promise<AdminAnalyticsOverview> => {
    const response = await apiClient.get<AdminAnalyticsOverview>("/admin/analytics/overview", params);
    return response.data;
  },
};

