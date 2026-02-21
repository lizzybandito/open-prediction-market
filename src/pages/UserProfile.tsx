import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award, Calendar, Edit3, BarChart3, DollarSign, Target, TrendingUp, TrendingDown, Clock, CheckCircle2, XCircle, Twitter, Share2, Copy, LogOut, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { usePublicProfile } from "@/hooks/use-profile";
import { useCurrentUser } from "@/hooks/use-auth";
import { format } from "date-fns";
import { toast } from "sonner";
import { CashOutDialog } from "@/components/trading/CashOutDialog";
import { PositionDetailsDialog } from "@/components/trading/PositionDetailsDialog";
import { PnLPanel } from "@/components/profile/PnLPanel";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { exportPositionImage } from "@/utils/exportPositions";
import { useQueryClient } from "@tanstack/react-query";

const UserProfile = () => {
  const queryClient = useQueryClient();
  const { username } = useParams<{ username: string }>();
  const { data: profile, isLoading: profileLoading, error: profileError } = usePublicProfile(username || "");
  const { data: currentUser } = useCurrentUser();
  const isOwnProfile = currentUser?.username === username;
  const [cashOutDialogOpen, setCashOutDialogOpen] = useState(false);
  const [cashOutPrediction, setCashOutPrediction] = useState<any>(null);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM yyyy");
    } catch {
      return "N/A";
    }
  };

  const formatBetDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch {
      return "";
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleOpenCashOut = (prediction: any) => {
    if (!isOwnProfile) return;
    setCashOutPrediction(prediction);
    setCashOutDialogOpen(true);
  };

  const recentBets = Array.isArray(profile?.recentBets) ? profile.recentBets : [];
  const activeBets = recentBets.filter((b) => b.status === "active");
  const closedBets = recentBets.filter((b) => b.status === "closed" || b.status === "resolved");

  // Real-time price updates: invalidate profile and related market queries every 2 seconds
  useEffect(() => {
    if (!username) return;
    
    const interval = setInterval(() => {
      // Invalidate profile to refresh bet prices
      queryClient.invalidateQueries({ queryKey: ["profile", username] });
      
      // Also invalidate market queries for markets in active bets to get fresh prices
      const marketIds = activeBets.map((b: any) => b.marketId).filter(Boolean);
      marketIds.forEach((marketId: string) => {
        queryClient.invalidateQueries({ queryKey: ["market", marketId] });
        queryClient.invalidateQueries({ queryKey: ["market-outcomes", marketId] });
      });
    }, 2000); // Invalidate every 2 seconds for faster updates (same as market page)

    return () => clearInterval(interval);
  }, [queryClient, username, activeBets]);

  const displayStats = [
    {
      label: "Total Predictions",
      value: profile?.stats?.totalPredictions?.toString() || "0",
      icon: BarChart3,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Win Rate",
      value: profile?.stats?.winRate ? `${profile.stats.winRate.toFixed(1)}%` : "0%",
      icon: Target,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Total Winnings",
      value: profile?.stats?.totalWinnings ? `$${profile.stats.totalWinnings.toFixed(2)}` : "$0.00",
      icon: DollarSign,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
  ];

  const formatFullDateTime = (dateString?: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString();
  };

  const handleExportBet = async (bet: any) => {
    if (!profile) return;
    await exportPositionImage({
      position: {
        ...bet,
        username: profile.username,
        referralCode: (profile as any).referralCode,
      },
      filename: `tutarmi-position-${bet.id || Date.now()}.png`,
    });
  };

  const getProfitColorClasses = (profit: number) => {
    if (profit > 0) return "text-green-600 bg-green-500/10 border-green-500/30";
    if (profit < 0) return "text-red-600 bg-red-500/10 border-red-500/30";
    return "text-muted-foreground bg-muted/40 border-border";
  };

  const getProfitIcon = (profit: number) => {
    if (profit > 0) return <ArrowUpRight className="h-3.5 w-3.5" />;
    if (profit < 0) return <ArrowDownRight className="h-3.5 w-3.5" />;
    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-5xl py-8">
        {profileLoading && (
          <div className="text-center py-20">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-4 text-muted-foreground">Loading profile...</p>
          </div>
        )}

        {profileError && (
          <Card className="text-center py-12">
            <CardContent className="pt-6">
              <p className="text-destructive mb-4">Failed to load profile. User may not exist.</p>
              <Link to="/">
                <Button variant="outline">Back to Home</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {!profileLoading && !profileError && profile && (
          <>
            <div className="grid gap-6 md:grid-cols-2 mb-6">
            {/* User summary (left) */}
            <Card className="relative">
              <CardContent className="pt-6">
                {/* Joined date in top left */}
                <div className="absolute top-4 left-4">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(profile.createdAt)}</span>
                  </div>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <Avatar className="h-24 w-24 md:h-28 md:w-28 ring-2 ring-primary/20">
                      <AvatarImage src={profile.avatar} />
                      <AvatarFallback className="text-3xl md:text-4xl font-semibold">
                        {getInitials(profile.username)}
                      </AvatarFallback>
                    </Avatar>
                    {profile.stats && profile.stats.winRate >= 70 && (
                      <Badge 
                        className="absolute -bottom-1 -right-1 shadow-md" 
                        variant="default"
                      >
                        <Award className="h-3 w-3 mr-1" />
                        Top Trader
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-col items-center gap-2 mb-4">
                    <div className="flex items-center gap-3">
                      <h1 className="text-2xl md:text-3xl font-bold">@{profile.username}</h1>
                      {((profile as any).xHandle || (profile as any).twitterHandle) && (
                        <a href={`https://x.com/${(profile as any).xHandle || (profile as any).twitterHandle}`} target="_blank" rel="noreferrer" className="inline-flex items-center">
                          <Badge variant="outline" className="gap-1">
                            <Twitter className="h-3.5 w-3.5" />
                            @{(profile as any).xHandle || (profile as any).twitterHandle}
                          </Badge>
                        </a>
                      )}
                      {isOwnProfile && (
                        <Link to="/profile">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                  {profile.bio && (
                    <p className="text-sm text-foreground/80 max-w-md leading-relaxed">
                      {profile.bio}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
            <PnLPanel
              title="Profit / Loss"
              description="Realized vs unrealized gains"
              resolved={closedBets}
              active={activeBets}
            />
            </div>

            {/* Positions (active / closed) */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <div>
                <CardTitle>Positions</CardTitle>
                <CardDescription>Active and closed positions</CardDescription>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Active: {activeBets.length} · Closed: {closedBets.length}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {(() => {
                  // Ensure recentBets exists and is an array
                  return (
                    <>
                      <Tabs defaultValue="active" className="w-full">
                        <TabsList className="grid w-full max-w-sm grid-cols-2">
                          <TabsTrigger value="active">Active</TabsTrigger>
                          <TabsTrigger value="closed">Closed</TabsTrigger>
                        </TabsList>
                        <TabsContent value="active" className="mt-6 space-y-4">
                          {activeBets.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">
                              <p className="text-sm">No active positions</p>
                              <p className="text-xs mt-1">
                                {isOwnProfile
                                  ? "Open a trade from the markets page to see it here."
                                  : "This user has no currently open positions."}
                              </p>
                            </div>
                          ) : (
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                              {activeBets.map((bet: any) => (
                              <Dialog key={bet.id}>
                                <DialogTrigger asChild>
                                  <Card className="relative h-full cursor-pointer overflow-hidden border border-border/80 bg-card hover:border-primary/40 transition-colors">
                                    <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-emerald-400 via-primary to-transparent opacity-60" />
                                    <CardHeader className="pb-3">
                                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="flex-1 space-y-1.5">
                                          <CardTitle className="text-base leading-snug line-clamp-2">
                                            <Link
                                              to={`/market/${bet.marketId}`}
                                              className="hover:underline"
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                          {bet.marketTitle}
                                        </Link>
                                      </CardTitle>
                                          <div className="flex flex-wrap items-center gap-2 text-xs">
                                        {bet.optionName && (
                                              <Badge variant="outline" className="bg-muted/60">
                                            {bet.optionName}
                                          </Badge>
                                        )}
                                            {(bet.pickName || bet.position) && (
                                              <Badge
                                                variant={
                                                  (bet.pickName || bet.position)?.toUpperCase?.() === "YES"
                                                    ? "default"
                                                    : "destructive"
                                                }
                                                className="px-2 py-0.5 text-[11px]"
                                              >
                                                {(bet.pickName || bet.position)?.toUpperCase?.()}
                                          </Badge>
                                        )}
                                            <span className="rounded-full bg-muted/60 px-2 py-0.5 text-[11px] text-muted-foreground">
                                          @ {bet.currentOdds || (bet.odds ? `${bet.odds.toFixed(1)}%` : "—")}
                                        </span>
                                      </div>
                                    </div>
                                        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-1">
                                          <span
                                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${getProfitColorClasses(
                                              bet.profit ?? 0
                                            )}`}
                                          >
                                            {getProfitIcon(bet.profit ?? 0)}
                                            <span>
                                              {(bet.profit ?? 0) >= 0 ? "+" : "-"}$
                                              {Math.abs(bet.profit ?? 0).toFixed(2)}
                                            </span>
                                          </span>
                                          {typeof bet.profitPercentage === "number" && (
                                            <span className="text-xs text-muted-foreground">
                                              {bet.profitPercentage >= 0 ? "+" : "-"}
                                              {Math.abs(bet.profitPercentage).toFixed(1)}%
                                            </span>
                                          )}
                                    </div>
                                  </div>
                                </CardHeader>
                                    <CardContent className="pt-0 pb-4">
                                      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
                                        <div className="space-y-0.5">
                                          <div className="text-xs uppercase tracking-wide text-muted-foreground">
                                            Shares
                                          </div>
                                          <div className="text-sm font-semibold">
                                            {bet.shares ? bet.shares.toFixed(3) : "—"}
                                          </div>
                                        </div>
                                        <div className="space-y-0.5">
                                          <div className="text-xs uppercase tracking-wide text-muted-foreground">
                                            Invested
                                          </div>
                                          <div className="text-sm font-semibold">
                                            ${(bet.invested ?? bet.amount ?? 0).toFixed(2)}
                                          </div>
                                    </div>
                                        <div className="space-y-0.5">
                                          <div className="text-xs uppercase tracking-wide text-muted-foreground">
                                            Entry Price
                                    </div>
                                          <div className="text-sm font-semibold">
                                            {(bet.entryPrice ?? bet.avgPrice)
                                              ? `${((bet.entryPrice ?? bet.avgPrice) as number).toFixed(3)}¢`
                                              : "—"}
                                          </div>
                                    </div>
                                        <div className="space-y-0.5">
                                          <div className="text-xs uppercase tracking-wide text-muted-foreground">
                                            Current Value
                                          </div>
                                          <div className="text-sm font-semibold">
                                            ${bet.currentValue
                                              ? bet.currentValue.toFixed(2)
                                              : bet.amount
                                                ? parseFloat(String(bet.amount).toString().replace("$", "")).toFixed(2)
                                                : "0.00"}
                                          </div>
                                    </div>
                                  </div>
                              {isOwnProfile && (
                                <div className="flex gap-2 mt-4">
                                  <Button
                                    variant="outline"
                                    className="flex-1"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleOpenCashOut(bet);
                                            }}
                                  >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Cash Out
                                  </Button>
                                </div>
                              )}
                                </CardContent>
                              </Card>
                                </DialogTrigger>
                                <PositionDetailsDialog
                                  title={bet.marketTitle}
                                  position={bet}
                                  variant="active"
                                  onShareImage={() => handleExportBet(bet)}
                                />
                              </Dialog>
                              ))}
                            </div>
                          )}
                          <div className="text-center text-xs text-muted-foreground">End of results</div>
                        </TabsContent>
                        <TabsContent value="closed" className="mt-6 space-y-4">
                          {closedBets.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">
                              <p className="text-sm">No closed positions</p>
                              <p className="text-xs mt-1">
                                Resolved trades will show here once their markets settle.
                              </p>
                            </div>
                          ) : (
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                              {closedBets.map((bet: any) => {
                              // Use profit from backend (already calculated correctly)
                              // Backend sends: profit, invested, payout
                              const profit = bet.profit !== undefined && bet.profit !== null 
                                ? bet.profit 
                                  : (bet.payout || 0) - (bet.invested || bet.amount || 0);
                              const investedAmount = bet.invested || bet.amount || 0;
                                const profitPercentage = investedAmount > 0 ? (profit / investedAmount) * 100 : 0;
                              return (
                                <Dialog key={bet.id}>
                                  <DialogTrigger asChild>
                                    <Card className="relative h-full cursor-pointer overflow-hidden border border-border/80 bg-card hover:border-primary/40 transition-colors">
                                      <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-emerald-400 via-primary to-transparent opacity-60" />
                                      <CardHeader className="pb-3">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                          <div className="flex-1 space-y-1.5">
                                            <CardTitle className="text-base leading-snug line-clamp-2">
                                              <Link
                                                to={`/market/${bet.marketId}`}
                                                className="hover:underline"
                                                onClick={(e) => e.stopPropagation()}
                                              >
                                            {bet.marketTitle}
                                          </Link>
                                        </CardTitle>
                                            <div className="flex flex-wrap items-center gap-2 text-xs">
                                          {bet.optionName && (
                                                <Badge variant="outline" className="bg-muted/60">
                                              {bet.optionName}
                                            </Badge>
                                          )}
                                              {(bet.pickName || bet.position) && (
                                                <Badge
                                                  variant={
                                                    (bet.pickName || bet.position)?.toUpperCase?.() === "YES"
                                                      ? "default"
                                                      : "destructive"
                                                  }
                                                  className="px-2 py-0.5 text-[11px]"
                                                >
                                                  {(bet.pickName || bet.position)?.toUpperCase?.()}
                                            </Badge>
                                          )}
                                              <Badge
                                                variant="outline"
                                                className={
                                                  bet.outcome === "won"
                                                    ? "bg-green-500/10 text-green-600 border-green-500/30"
                                                    : "bg-red-500/10 text-red-600 border-red-500/30"
                                                }
                                              >
                                            {bet.outcome === "won" ? "Won" : "Lost"}
                                          </Badge>
                                        </div>
                                      </div>
                                          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-1">
                                            <span
                                              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${getProfitColorClasses(
                                                profit
                                              )}`}
                                            >
                                              {getProfitIcon(profit)}
                                              <span>
                                                {profit >= 0 ? "+" : "-"}$
                                                {Math.abs(profit).toFixed(2)}
                                              </span>
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                              {profitPercentage >= 0 ? "+" : "-"}
                                              {Math.abs(profitPercentage).toFixed(1)}%
                                            </span>
                                      </div>
                                    </div>
                                  </CardHeader>
                                      <CardContent className="pt-0 pb-4">
                                        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
                                          <div className="space-y-0.5">
                                            <div className="text-xs uppercase tracking-wide text-muted-foreground">
                                              Shares
                                            </div>
                                            <div className="text-sm font-semibold">
                                              {bet.shares ? bet.shares.toFixed(3) : "—"}
                                            </div>
                                          </div>
                                          <div className="space-y-0.5">
                                            <div className="text-xs uppercase tracking-wide text-muted-foreground">
                                              Invested
                                            </div>
                                            <div className="text-sm font-semibold">
                                              ${investedAmount ? investedAmount.toFixed(2) : "0.00"}
                                            </div>
                                      </div>
                                          <div className="space-y-0.5">
                                            <div className="text-xs uppercase tracking-wide text-muted-foreground">
                                              Entry Price
                                      </div>
                                            <div className="text-sm font-semibold">
                                              {(bet.entryPrice ?? bet.avgPrice)
                                                ? `${((bet.entryPrice ?? bet.avgPrice) as number).toFixed(3)}¢`
                                                : "—"}
                                            </div>
                                      </div>
                                          <div className="space-y-0.5">
                                            <div className="text-xs uppercase tracking-wide text-muted-foreground">
                                              Payout
                                            </div>
                                            <div className="text-sm font-semibold">
                                              ${(bet.payout ?? 0).toFixed(2)}
                                            </div>
                                      </div>
                                    </div>
                                        <div className="mt-4 pt-3 border-t">
                                          <div className="flex items-center justify-between">
                                            <span className="text-xs text-muted-foreground">Return</span>
                                            <span
                                              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-semibold ${getProfitColorClasses(
                                                profit
                                              )}`}
                                            >
                                              {getProfitIcon(profit)}
                                              <span>
                                                {profitPercentage >= 0 ? "+" : "-"}
                                                {Math.abs(profitPercentage).toFixed(1)}%
                                              </span>
                                            </span>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                                  </DialogTrigger>
                                  <PositionDetailsDialog
                                    title={bet.marketTitle}
                                    position={bet}
                                    variant="resolved"
                                    onShareImage={() => handleExportBet(bet)}
                                  />
                                </Dialog>
                              );
                              })}
                            </div>
                          )}
                          <div className="text-center text-xs text-muted-foreground">End of results</div>
                        </TabsContent>
                      </Tabs>
                    </>
                  );
                })()}
              </CardContent>
            </Card>

            {/* X Account and Referral - Side by side */}
            <div className="flex flex-col lg:flex-row gap-6 mt-6">
              {/* X Account Section */}
              <Card className="flex-1">
                <CardHeader>
                  <CardTitle>X Account</CardTitle>
                  <CardDescription>Connected X (Twitter) account</CardDescription>
                </CardHeader>
                <CardContent>
                  {((profile as any).xHandle || (profile as any).twitterHandle) ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/30">
                        <div className="p-2 rounded-full bg-primary/10">
                          <Twitter className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">@{((profile as any).xHandle || (profile as any).twitterHandle)}</div>
                          <div className="text-xs text-muted-foreground">Verified X account</div>
                        </div>
                        <a 
                          href={`https://x.com/${(profile as any).xHandle || (profile as any).twitterHandle}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-primary hover:underline text-sm"
                        >
                          View Profile
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Twitter className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No X account connected</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Referral Section - Only show if own profile */}
              {isOwnProfile && (profile as any).referralCode && (
                <Card className="flex-1">
                  <CardHeader>
                    <CardTitle>Referral</CardTitle>
                    <CardDescription>Share your code and earn bonuses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative p-6 rounded-lg border bg-gradient-to-br from-primary/5 via-background to-background border-primary/20">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-primary/10 shrink-0">
                          <Share2 className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="text-xs font-semibold mb-2 block text-primary uppercase tracking-wide">
                            Your Referral Code
                          </label>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 px-4 py-2 bg-background border border-primary/30 rounded-md font-mono text-sm font-semibold text-primary">
                              {(profile as any).referralCode}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText((profile as any).referralCode || "");
                                toast.success("Referral code copied to clipboard!");
                              }}
                              className="shrink-0"
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copy
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Share this code with friends to earn bonuses when they join and trade.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            
          </>
        )}
        <CashOutDialog
          open={cashOutDialogOpen}
          prediction={cashOutPrediction}
          onOpenChange={(open) => {
            setCashOutDialogOpen(open);
            if (!open) {
              setCashOutPrediction(null);
            }
          }}
        />
      </main>
    </div>
  );
};

export default UserProfile;

