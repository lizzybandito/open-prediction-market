// Base API types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  meta?: Record<string, unknown>;
  nextRefreshAt?: string;
  retryAt?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
  retryAt?: string;
  nextRefreshAt?: string;
  meta?: Record<string, unknown>;
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

// Auth types
export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
  username?: string;
  referralCode?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface User {
  id: string;
  email?: string;
  username: string;
  avatar?: string;
  bio?: string;
  xHandle?: string; // X (Twitter) handle without @
  twitterHandle?: string; // backward compatibility if server returns twitterHandle
  createdAt: string;
  referralCode?: string;
  stats?: UserStats;
  recentBets?: RecentBet[];
  role?: "USER" | "ADMIN" | "STAFF";
}

export interface RecentBet {
  id: string;
  marketId: string;
  marketTitle: string;
  position: "yes" | "no";
  amount: number;
  invested?: number;
  shares?: number;
  avgPrice?: number;
  odds?: number;
  payout?: number;
  profit?: number;
  profitPercentage?: number;
  outcome?: "won" | "lost";
  status: "active" | "resolved" | "closed";
  createdAt: string;
}

export interface UserStats {
  totalPredictions: number;
  winRate: number;
  totalWinnings: number;
  activePositions: number;
  level?: number;
}

// Market types
export interface Market {
  id: string;
  title: string;
  slug?: string;
  category: string;
  image: string;
  yesPrice: number;
  noPrice: number;
  volume: string;
  volumeNumber: number;
  endDate: string;
  description?: string;
  status: "active" | "closed" | "resolved";
  resolution?: "yes" | "no";
  isMultiOutcome?: boolean;
  topOptions?: Array<{
    label: string;
    volume: number;
    yesPriceCents?: number;
    noPriceCents?: number;
  }>;
  traderCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface MarketFilters {
  category?: string;
  status?: "active" | "closed" | "resolved";
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "volume" | "endDate" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface MarketChartData {
  timestamp: string;
  yesPrice: number;
  noPrice: number;
  volume: number;
}

// Trading types
export interface PlaceOrderRequest {
  marketId: string;
  position: "yes" | "no";
  amount: number;
  currency?: "SOL" | "POINTS" | "PRED";
  orderType?: "market" | "limit";
  limitPrice?: number;
}

export interface PlaceOutcomeOrderRequest {
  marketId: string;
  outcomeSnapshotId?: string;
  outcomeIndex?: number;
  outcomeLabel: string;
  tokenId?: string;
  amount: number;
  currency?: "SOL" | "POINTS" | "PRED";
  side?: "yes" | "no";
}

export interface Order {
  id: string;
  marketId: string;
  marketTitle: string;
  position: "yes" | "no";
  amount: number;
  shares: number;
  price: number;
  status: "pending" | "filled" | "cancelled";
  createdAt: string;
}

export interface OrderCalculation {
  shares: number;
  avgPrice: number;
  potentialReturn: number;
  fees: number;
}

export interface OutcomeOrder {
  id: string;
  marketId: string;
  outcomeSnapshotId?: string;
  outcomeLabel: string;
  side: "yes" | "no";
  tokenId?: string;
  amount: number;
  shares: number;
  price: number;
  status: "pending" | "filled" | "cancelled" | "failed";
  currency: "sol" | "pred" | "points";
  createdAt: string;
}

// Prediction types
export interface Prediction {
  id: string;
  marketId: string;
  marketSlug?: string;
  question: string;
  position: "yes" | "no";
  pickName?: string; // The specific choice (YES/NO or outcome label)
  optionName?: string; // Option name for multi-outcome markets
  isOutcomePosition?: boolean;
  outcomeLabel?: string;
  outcomeSide?: "YES" | "NO";
  amount: number;
  currentOdds: string;
  currentOddsNumber: number;
  invested: number;
  currentValue: number;
  profit: number;
  profitPercentage: number;
  positive: boolean;
  shares?: number;
  createdAt: string;
}

export interface ResolvedPrediction {
  id: string;
  marketId: string;
  marketSlug?: string;
  question: string;
  position: "yes" | "no";
  pickName?: string; // The specific choice (YES/NO or outcome label)
  optionName?: string; // Option name for multi-outcome markets
  isOutcomePosition?: boolean;
  outcomeLabel?: string;
  outcomeSide?: "YES" | "NO";
  outcome: "won" | "lost";
  invested: number;
  payout: number;
  profit: number;
  positive: boolean;
  shares?: number;
  resolvedAt: string;
}

// Wallet types
export interface WalletBalance {
  solBalance: number;
  availableSolBalance: number;
  lockedInSolOrders: number;
  predBalance: number;
  availablePredBalance: number;
  lockedInPredOrders: number;
  points?: number;
  availablePoints?: number;
  lockedInPointOrders?: number;
  availableBalance: number;
  totalBalance: number;
  lockedInOrders: number;
  activePositions: number;
  totalWinnings: number;
}

export interface Transaction {
  id: string;
  type: "deposit" | "withdraw" | "bet" | "win" | "refund" | "reward" | "cashout" | "presale";
  amount: number | string;
  date: string;
  status: "pending" | "completed" | "failed";
  description?: string;
  marketId?: string;
  txHash?: string;
}

export interface DepositRequest {
  amount: number;
  txHash?: string;
  paymentMethod?: string;
}

export interface WithdrawRequest {
  amount: number;
  address?: string;
}

// Activity types
export interface Activity {
  id: string;
  type:
    | "bet"
    | "win"
    | "deposit"
    | "withdraw"
    | "market_resolved"
    | "reward"
    | "cashout"
    | "presale";
  market?: string;
  marketId?: string;
  position?: "yes" | "no";
  pickName?: string; // The specific choice (YES/NO or outcome label)
  optionName?: string; // Option name for multi-outcome markets
  amount: number;
  time: string;
  positive?: boolean;
  status?: string;
  transactionId?: string;
  orderId?: string;
  userId?: string;
  username?: string; // Username of the user who made the transaction
  entryPrice?: number;
  cashoutPrice?: number;
  shares?: number;
}

// Leaderboard types
export interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar?: string;
  totalWinnings: number;
  accuracy: number;
  predictions: number;
  userId: string;
}

export interface LeaderboardFilters {
  timeframe?: "all" | "week" | "month" | "year";
  category?: string;
  page?: number;
  limit?: number;
}

// Profile types
export interface ProfileUpdateRequest {
  username?: string;
  email?: string;
  avatar?: string;
  bio?: string;
  xHandle?: string;
}

// AI Agent Picks types
export interface AgentPick {
  id: string;
  marketId: string;
  agentProvider: "openai" | "gemini" | "claude" | "deepseek" | "grok";
  agentName: string;
  position: "yes" | "no";
  confidence: number;
  reasoning?: string;
  priceTarget?: number;
  marketYesPrice: number;
  marketNoPrice: number;
  createdAt: string;
  updatedAt: string;
  market?: {
    id: string;
    title: string;
    status: string;
  };
}

export interface AgentRaceStat {
  agentId: string;
  agentName: string;
  provider: string;
  startingCapital: number;
  availableCapital: number;
  realizedPnl: number;
  unrealizedPnl: number;
  totalTrades: number;
  openTrades: number;
  wins: number;
  losses: number;
  avgConfidence: number;
  bestTradePnl: number;
  worstTradePnl: number;
  lastTradeAt?: string | null;
  nextTradeAt?: string | null;
}

export interface AgentRaceTrade {
  id: string;
  marketId: string;
  marketTitle: string;
  category?: string;
  provider: string;
  position: string;
  confidence: number;
  priceTarget?: number | null;
  amount: number;
  shares: number;
  entryPrice: number;
  exitPrice?: number | null;
  pnl?: number | null;
  status: string;
  openedAt: string;
  closedAt?: string | null;
}

export interface PolymarketOutcome {
  index: number;
  label: string;
  tokenId?: string;
  probability?: number;
  priceCents?: number;
  bestBidCents?: number;
  bestAskCents?: number;
  midpointCents?: number;
  liquidity?: number;
  volume24h?: number;
  sourcePrice?: "orderbook" | "gamma" | "token";
}

export interface PolymarketEventPick {
  label: string;
  yesTokenId: string;
  yesPriceCents?: number;
}

export interface PolymarketEventPicksSummary {
  picks: PolymarketEventPick[];
  lastUpdated: string;
  markets?: any[];
}

export interface PolymarketOutcomeMeta {
  eventTitle?: string | null;
  eventSlug?: string | null;
  eventImageUrl?: string | null;
  conditionId?: string;
  sourceUrl?: string | null;
  totalVolume?: number | null;
  totalLiquidity?: number | null;
  picksCount?: number;
  lastUpdated?: string;
  markets?: any[];
}

export interface PolymarketOutcomeResponse {
  conditionId?: string;
  marketType: "binary" | "multi" | "unknown";
  outcomes: PolymarketOutcome[];
  outcomeLabels?: string[];
  tokenIds?: string[];
  outcomePrices?: number[];
  midpoints?: number[];
  orderbooks?: any;
  eventPicks?: PolymarketEventPicksSummary;
  lastUpdated?: string;
  meta?: PolymarketOutcomeMeta;
}


