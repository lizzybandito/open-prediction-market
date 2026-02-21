import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PnLPanel } from "@/components/profile/PnLPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { User, Mail, Calendar, TrendingUp, Award, TrendingDown, Edit3, Upload, Image as ImageIcon, Copy, CheckCircle2, Share2, Twitter, LogOut, Clock, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useProfile, useProfileStats, useUpdateProfile, useSavedMarkets } from "@/hooks/use-profile";
import { useMyPredictions } from "@/hooks/use-predictions";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useWallet } from "@solana/wallet-adapter-react";
import { useXChallenge, useXVerifyComplete, useXSubmitTweet, useXPosts } from "@/hooks/use-x";
import { CashOutDialog } from "@/components/trading/CashOutDialog";
import { PositionDetailsDialog } from "@/components/trading/PositionDetailsDialog";
import { exportPositionImage } from "@/utils/exportPositions";
import { getMarketUrl } from "@/utils/marketUrl";
import { useQueryClient } from "@tanstack/react-query";

const Profile = () => {
  const queryClient = useQueryClient();
  const { data: profile, isLoading: profileLoading, error: profileError } = useProfile();
  const { data: stats, isLoading: statsLoading } = useProfileStats();
  const { data: predictionsData, isLoading: predictionsLoading } = useMyPredictions();
  const updateProfile = useUpdateProfile();
  const { data: savedMarkets, isLoading: savedLoading } = useSavedMarkets();
  const { publicKey } = useWallet();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [xHandle, setXHandle] = useState("");
  const [avatar, setAvatar] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [isXDialogOpen, setIsXDialogOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [challenge, setChallenge] = useState<string>("");
  const [challengeExpiresAt, setChallengeExpiresAt] = useState<string>("");
  const [tweetUrl, setTweetUrl] = useState<string>("");
  const [cashOutDialogOpen, setCashOutDialogOpen] = useState(false);
  const [cashOutPrediction, setCashOutPrediction] = useState<any>(null);

  const sortByBetTimeDesc = (a: any, b: any) => {
    const aTime = new Date(a?.createdAt || a?.resolvedAt || 0).getTime();
    const bTime = new Date(b?.createdAt || b?.resolvedAt || 0).getTime();
    return bTime - aTime;
  };

  const activePredictions = (predictionsData?.active || []).slice().sort(sortByBetTimeDesc);
  const resolvedPredictions = (predictionsData?.resolved || []).slice().sort(sortByBetTimeDesc);

  const handleOpenCashOut = (prediction: any) => {
    setCashOutPrediction(prediction);
    setCashOutDialogOpen(true);
  };

  const walletAddress = publicKey?.toBase58();
  const startChallenge = useXChallenge(walletAddress);
  const completeVerify = useXVerifyComplete(walletAddress);
  const submitTweet = useXSubmitTweet();
  const { data: xPosts, isLoading: xPostsLoading } = useXPosts();

  // Initialize form when profile loads
  useEffect(() => {
    if (profile && !isEditing) {
      setUsername(profile.username);
      setEmail(profile.email);
      setBio(profile.bio || "");
      setAvatar(profile.avatar || "");
      setXHandle((profile as any).xHandle || (profile as any).twitterHandle || "");
      setAvatarUrl(profile.avatar || "");
    }
  }, [profile, isEditing]);

  // Initialize avatar URL when dialog opens
  useEffect(() => {
    if (isAvatarDialogOpen && profile) {
      setAvatarUrl(profile.avatar || "");
    }
  }, [isAvatarDialogOpen, profile]);

  // Real-time price updates: invalidate predictions and related market queries every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Invalidate predictions to refresh prices
      queryClient.invalidateQueries({ queryKey: ["predictions", "me"] });
      
      // Also invalidate market queries for markets in active predictions to get fresh prices
      const marketIds = activePredictions.map((p: any) => p.marketId).filter(Boolean);
      marketIds.forEach((marketId: string) => {
        queryClient.invalidateQueries({ queryKey: ["market", marketId] });
        queryClient.invalidateQueries({ queryKey: ["market-outcomes", marketId] });
      });
    }, 2000); // Invalidate every 2 seconds for faster updates (same as market page)

    return () => clearInterval(interval);
  }, [queryClient, activePredictions]);

  const handleAvatarClick = () => {
    setIsAvatarDialogOpen(true);
  };

  const handleAvatarSave = async () => {
    if (!profile) return;
    await updateProfile.mutateAsync({ avatar: avatarUrl || undefined });
    setIsAvatarDialogOpen(false);
  };

  const handleXSave = async () => {
    if (!profile) return;
    const clean = (xHandle || "").replace(/^@/, "");
    await updateProfile.mutateAsync({ xHandle: clean || undefined });
    setIsXDialogOpen(false);
  };

  const handleStartVerify = async () => {
    try {
      const res = await startChallenge.mutateAsync();
      setChallenge(res.challenge);
      setChallengeExpiresAt(res.expiresAt);
      toast.success("Challenge generated. Post it on X and paste the tweet URL.");
    } catch (e: any) {
      toast.error(e.message || "Failed to start verification");
    }
  };

  const handleCompleteVerify = async () => {
    if (!tweetUrl || !challenge) {
      toast.error("Enter tweet URL and generate challenge first");
      return;
    }
    try {
      const res = await completeVerify.mutateAsync({ tweetUrl, challenge });
      toast.success(`Verified X: @${res.handle}`);
    } catch (e: any) {}
  };

  const handleSubmitTweet = async () => {
    if (!tweetUrl) {
      toast.error("Enter tweet URL");
      return;
    }
    try {
      await submitTweet.mutateAsync({ tweetUrl });
      setTweetUrl("");
    } catch (e: any) {}
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    const updates: { username?: string; email?: string; avatar?: string; bio?: string; xHandle?: string } = {};
    if (username !== profile.username) updates.username = username;
    if (email !== profile.email) updates.email = email;
    if (avatar !== (profile.avatar || "")) updates.avatar = avatar || undefined;
    if (bio !== (profile.bio || "")) updates.bio = bio || undefined;
    if (xHandle !== ((profile as any).xHandle || (profile as any).twitterHandle || "")) updates.xHandle = xHandle || undefined;

    if (Object.keys(updates).length > 0) {
      await updateProfile.mutateAsync(updates);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (profile) {
      setUsername(profile.username);
      setEmail(profile.email);
      setBio(profile.bio || "");
      setAvatar(profile.avatar || "");
    }
    setIsEditing(false);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMMM yyyy");
    } catch {
      return "N/A";
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

  const formatFullDateTime = (dateString?: string): string => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "N/A";
    return date.toLocaleString();
  };

  const handleExportPosition = async (prediction: any) => {
    if (!profile) return;
    await exportPositionImage({
      position: {
        ...prediction,
        username: profile.username,
        referralCode: profile.referralCode,
      },
      filename: `tutarmi-position-${prediction.id || Date.now()}.png`,
    });
  };

  const displayStats = [
    {
      label: "Total Predictions",
      value: stats?.totalPredictions?.toString() || "0",
      icon: TrendingUp,
    },
    {
      label: "Win Rate",
      value: stats?.winRate ? `${stats.winRate.toFixed(1)}%` : "0%",
      icon: Award,
    },
    {
      label: "Total Winnings",
      value: stats?.totalWinnings ? `$${stats.totalWinnings.toFixed(2)}` : "$0.00",
      icon: TrendingUp,
    },
  ];

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
      <main className="container py-8">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Profile</h1>
        </div>

        {(profileLoading || statsLoading) && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        )}

        {profileError && (
          <div className="text-center py-12">
            <p className="text-destructive">Failed to load profile. Please try again later.</p>
          </div>
        )}

        {!profileLoading && !profileError && profile && (
          <>
            {/* New header layout: left user card, right P/L card */}
            <div className="grid gap-6 md:grid-cols-2 mb-6">
            <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative group">
                        <Avatar className="h-16 w-16 cursor-pointer border" onClick={handleAvatarClick}>
                          <AvatarImage src={profile.avatar} />
                          <AvatarFallback className="text-lg">{getInitials(profile.username)}</AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-full transition-opacity cursor-pointer" onClick={handleAvatarClick}>
                          <Edit3 className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-xl">{profile.username}</CardTitle>
                          {(xHandle || (profile as any).twitterHandle) ? (
                            <a href={`https://x.com/${xHandle || (profile as any).twitterHandle}`} target="_blank" rel="noreferrer" aria-label="X profile">
                              <Badge variant="outline" className="gap-1">
                                <Twitter className="h-3.5 w-3.5" />
                                @{xHandle || (profile as any).twitterHandle}
                              </Badge>
                            </a>
                          ) : (
                            <Button variant="ghost" size="sm" className="h-7 px-2 gap-1" onClick={() => setIsXDialogOpen(true)}>
                              <Twitter className="h-3.5 w-3.5" /> Add X
                            </Button>
                          )}
                        </div>
                        <CardDescription>Joined {formatDate(profile.createdAt)}</CardDescription>
                        {stats && stats.winRate >= 70 && (
                          <Badge variant="outline" className="mt-2"><Award className="h-3 w-3 mr-1" />Top Trader</Badge>
                        )}
                      </div>
                    </div>
                    {!isEditing && (
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} disabled={updateProfile.isPending}>
                        <Edit3 className="h-4 w-4 mr-2" />Edit
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const positionsValue = (predictionsData?.active || []).reduce((s: number, p: any) => s + (p.currentValue ?? 0), 0);
                    const biggestWin = Math.max(0, ...((predictionsData?.resolved || []).map((p: any) => p.profit ?? 0)));
                    const predictionsCount = (predictionsData?.active?.length || 0) + (predictionsData?.resolved?.length || 0);
                    return (
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Positions Value</div>
                          <div className="text-xl font-semibold">${positionsValue.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Biggest Win</div>
                          <div className="text-xl font-semibold">{biggestWin === 0 ? "—" : `$${biggestWin.toFixed(2)}`}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Predictions</div>
                          <div className="text-xl font-semibold">{predictionsCount}</div>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              <PnLPanel
                title="Profit / Loss"
                description="Track realized vs unrealized gains"
                resolved={resolvedPredictions || []}
                active={activePredictions || []}
              />
            </div>


            {/* Positions section styled like screenshot */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <div>
                <CardTitle>Positions</CardTitle>
                <CardDescription>Your active and closed positions</CardDescription>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Active: {activePredictions.length} · Closed: {resolvedPredictions.length}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="current" className="w-full">
                  <TabsList className="grid w-full max-w-sm grid-cols-2">
                    <TabsTrigger value="current">Active</TabsTrigger>
                    <TabsTrigger value="previous">Closed</TabsTrigger>
                  </TabsList>
                  <TabsContent value="current" className="mt-6 space-y-4">
                    {predictionsLoading ? (
                      <div className="text-center py-8 text-muted-foreground">Loading positions...</div>
                    ) : activePredictions.length === 0 ? (
                      <div className="text-center py-10 text-muted-foreground">
                        <p className="text-sm">No active positions</p>
                        <p className="text-xs mt-1">Open a trade from the markets page to see it here.</p>
                      </div>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {activePredictions.map((prediction: any) => (
                        <Dialog key={prediction.id}>
                          <DialogTrigger asChild>
                            <Card className="relative h-full cursor-pointer overflow-hidden border border-border/80 bg-card hover:border-primary/40 transition-colors">
                              <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-emerald-400 via-primary to-transparent opacity-60" />
                              <CardHeader className="pb-3">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                  <div className="flex-1 space-y-1.5">
                                    <CardTitle className="text-base leading-snug line-clamp-2">
                                      <Link
                                        to={getMarketUrl({ id: prediction.marketId, slug: (prediction as any).marketSlug })}
                                        className="hover:underline"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                    {prediction.question}
                                  </Link>
                                </CardTitle>
                                    <div className="flex flex-wrap items-center gap-2 text-xs">
                                  {prediction.optionName && (
                                        <Badge variant="outline" className="bg-muted/60">
                                      {prediction.optionName}
                                    </Badge>
                                  )}
                                      {(prediction.pickName || prediction.position) && (
                                        <Badge
                                          variant={
                                            (prediction.pickName || prediction.position)?.toUpperCase?.() === "YES"
                                              ? "default"
                                              : "destructive"
                                          }
                                          className="px-2 py-0.5 text-[11px]"
                                        >
                                          {(prediction.pickName || prediction.position)?.toUpperCase?.()}
                                    </Badge>
                                  )}
                                      {prediction.currentOdds && (
                                        <span className="rounded-full bg-muted/60 px-2 py-0.5 text-[11px] text-muted-foreground">
                                          @ {prediction.currentOdds}
                                        </span>
                                      )}
                                </div>
                              </div>
                                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-1">
                                    <span
                                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${getProfitColorClasses(
                                        prediction.profit
                                      )}`}
                                    >
                                      {getProfitIcon(prediction.profit)}
                                      <span>
                                        {prediction.profit >= 0 ? "+" : "-"}$
                                        {Math.abs(prediction.profit ?? 0).toFixed(2)}
                                      </span>
                                    </span>
                                    {typeof prediction.profitPercentage === "number" && (
                                      <span className="text-xs text-muted-foreground">
                                        {prediction.profitPercentage >= 0 ? "+" : "-"}
                                        {Math.abs(prediction.profitPercentage).toFixed(1)}%
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
                                      {prediction.shares ? prediction.shares.toFixed(3) : "—"}
                              </div>
                              </div>
                                  <div className="space-y-0.5">
                                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                                      Invested
                              </div>
                                    <div className="text-sm font-semibold">
                                      ${(prediction.invested ?? 0).toFixed(2)}
                            </div>
                                  </div>
                                  <div className="space-y-0.5">
                                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                                      Entry Price
                                    </div>
                                    <div className="text-sm font-semibold">
                                      {(prediction.entryPrice ?? prediction.avgPrice)
                                        ? `${((prediction.entryPrice ?? prediction.avgPrice) as number).toFixed(3)}¢`
                                        : "—"}
                                    </div>
                                  </div>
                                  <div className="space-y-0.5">
                                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                                      Current Value
                                    </div>
                                    <div className="text-sm font-semibold">
                                      ${(prediction.currentValue ?? 0).toFixed(2)}
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-4 flex gap-2">
                            <Button
                              variant="outline"
                              className="flex-1"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenCashOut(prediction);
                                    }}
                            >
                              <LogOut className="h-4 w-4 mr-2" />
                              Cash Out
                            </Button>
                          </div>
                          </CardContent>
                        </Card>
                          </DialogTrigger>
                          <PositionDetailsDialog
                            title={prediction.question}
                            position={prediction}
                            variant="active"
                            onShareImage={() => handleExportPosition(prediction)}
                          />
                        </Dialog>
                        ))}
                      </div>
                    )}
                    <div className="text-center text-xs text-muted-foreground">End of results</div>
                  </TabsContent>
                  <TabsContent value="previous" className="mt-6 space-y-4">
                    {predictionsLoading ? (
                      <div className="text-center py-8 text-muted-foreground">Loading positions...</div>
                    ) : resolvedPredictions.length === 0 ? (
                      <div className="text-center py-10 text-muted-foreground">
                        <p className="text-sm">No closed positions</p>
                        <p className="text-xs mt-1">Once markets resolve, your results will appear here.</p>
                      </div>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {resolvedPredictions.map((prediction: any) => (
                        <Dialog key={prediction.id}>
                          <DialogTrigger asChild>
                            <Card className="relative h-full cursor-pointer overflow-hidden border border-border/80 bg-card hover:border-primary/40 transition-colors">
                              <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-emerald-400 via-primary to-transparent opacity-60" />
                              <CardHeader className="pb-3">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                  <div className="flex-1 space-y-1.5">
                                    <CardTitle className="text-base leading-snug line-clamp-2">
                                      <Link
                                        to={getMarketUrl({ id: prediction.marketId, slug: (prediction as any).marketSlug })}
                                        className="hover:underline"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                    {prediction.question}
                                  </Link>
                                </CardTitle>
                                    <div className="flex flex-wrap items-center gap-2 text-xs">
                                  {prediction.optionName && (
                                        <Badge variant="outline" className="bg-muted/60">
                                      {prediction.optionName}
                                    </Badge>
                                  )}
                                      {(prediction.pickName || prediction.position) && (
                                        <Badge
                                          variant={
                                            (prediction.pickName || prediction.position)?.toUpperCase?.() === "YES"
                                              ? "default"
                                              : "destructive"
                                          }
                                          className="px-2 py-0.5 text-[11px]"
                                        >
                                          {(prediction.pickName || prediction.position)?.toUpperCase?.()}
                                    </Badge>
                                  )}
                                      <Badge
                                        variant="outline"
                                        className={
                                          prediction.outcome === "won"
                                            ? "bg-green-500/10 text-green-600 border-green-500/30"
                                            : "bg-red-500/10 text-red-600 border-red-500/30"
                                        }
                                      >
                                    {prediction.outcome === "won" ? "Won" : "Lost"}
                                  </Badge>
                                </div>
                              </div>
                                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-1">
                                    <span
                                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${getProfitColorClasses(
                                        prediction.profit
                                      )}`}
                                    >
                                      {getProfitIcon(prediction.profit)}
                                      <span>
                                        {prediction.profit >= 0 ? "+" : "-"}$
                                        {Math.abs(prediction.profit ?? 0).toFixed(2)}
                                      </span>
                                    </span>
                                    {typeof prediction.profitPercentage === "number" && (
                                      <span className="text-xs text-muted-foreground">
                                        {prediction.profitPercentage >= 0 ? "+" : "-"}
                                        {Math.abs(prediction.profitPercentage).toFixed(1)}%
                                      </span>
                                    )}
                              </div>
                            </div>
                          </CardHeader>
                              <CardContent className="pt-0 pb-4">
                                <div className="grid gap-3 grid-cols-2 md:grid-cols-5">
                                  <div className="space-y-0.5">
                                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                                      Shares
                              </div>
                                    <div className="text-sm font-semibold">
                                      {prediction.shares ? prediction.shares.toFixed(3) : "—"}
                              </div>
                                  </div>
                                  <div className="space-y-0.5">
                                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                                      Invested
                                    </div>
                                    <div className="text-sm font-semibold">
                                      ${(prediction.invested ?? 0).toFixed(2)}
                                    </div>
                                  </div>
                                  <div className="space-y-0.5">
                                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                                      Entry Price
                                    </div>
                                    <div className="text-sm font-semibold">
                                      {(prediction.entryPrice ?? prediction.avgPrice)
                                        ? `${((prediction.entryPrice ?? prediction.avgPrice) as number).toFixed(3)}¢`
                                        : "—"}
                                    </div>
                              </div>
                                  <div className="space-y-0.5">
                                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                                      Payout
                              </div>
                                    <div className="text-sm font-semibold">
                                      ${(prediction.payout ?? 0).toFixed(2)}
                                    </div>
                                  </div>
                                  <div className="space-y-0.5">
                                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                                      Return
                                    </div>
                                    <div
                                      className={`text-sm font-semibold ${
                                        (prediction.profitPercentage ?? 0) >= 0
                                          ? "text-green-600"
                                          : "text-red-600"
                                      }`}
                                    >
                                      {(prediction.profitPercentage ?? 0) >= 0 ? "+" : "-"}
                                      {Math.abs(prediction.profitPercentage ?? 0).toFixed(1)}%
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                          </DialogTrigger>
                          <PositionDetailsDialog
                            title={prediction.question}
                            position={prediction}
                            variant="resolved"
                            onShareImage={() => handleExportPosition(prediction)}
                          />
                        </Dialog>
                        ))}
                      </div>
                    )}
                    <div className="text-center text-xs text-muted-foreground">End of results</div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>


            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Saved Bets</CardTitle>
                <CardDescription>Your saved markets</CardDescription>
              </CardHeader>
              <CardContent>
                {savedLoading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading saved markets...</p>
                  </div>
                ) : !savedMarkets || savedMarkets.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-muted-foreground">No saved markets yet</p>
                      <Link to="/">
                        <Button variant="outline" className="mt-4">Browse Markets</Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {savedMarkets.map((item) => (
                      <Card key={item.id}>
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="text-sm">
                            <div className="font-semibold">Saved Market</div>
                            <div className="text-muted-foreground">ID: {item.marketId}</div>
                          </div>
                          <Link to={`/market/${item.marketId}`} className="text-primary hover:underline text-sm">
                            View
                          </Link>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* X Account and Referral - Side by side */}
            <div className="flex flex-col lg:flex-row gap-6 mt-6">
              {/* Earn on X */}
              <Card className="flex-1">
                <CardHeader>
                  <CardTitle>Earn Points on X</CardTitle>
                  <CardDescription>Prove ownership and submit tweets to earn season points</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="text-sm font-medium">1) Verify your X account</div>
                      <div className="space-y-2">
                        <Button variant="outline" size="sm" onClick={handleStartVerify} disabled={!walletAddress || startChallenge.isPending}>
                          {startChallenge.isPending ? "Generating..." : walletAddress ? "Generate Challenge" : "Connect Wallet"}
                        </Button>
                        {challenge && (
                          <div className="rounded-md border p-3 bg-muted/30">
                            <div className="text-xs text-muted-foreground">Tweet this exact string:</div>
                            <div className="font-mono text-sm break-all select-all">{challenge}</div>
                            {challengeExpiresAt && (
                              <div className="text-xs text-muted-foreground mt-1">Expires at: {new Date(challengeExpiresAt).toLocaleString()}</div>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Input placeholder="Paste your tweet URL" value={tweetUrl} onChange={(e) => setTweetUrl(e.target.value)} />
                          <Button size="sm" onClick={handleCompleteVerify} disabled={completeVerify.isPending || !challenge}>
                            {completeVerify.isPending ? "Verifying..." : "Complete"}
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">2) Submit content tweets</div>
                      <div className="flex items-center gap-2">
                        <Input placeholder="Tweet URL to earn points" value={tweetUrl} onChange={(e) => setTweetUrl(e.target.value)} />
                        <Button size="sm" variant="default" onClick={handleSubmitTweet} disabled={submitTweet.isPending}>
                          {submitTweet.isPending ? "Submitting..." : "Submit"}
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground">Daily caps apply. Engagement may adjust points after 24h.</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-2">Your submitted tweets</div>
                    {xPostsLoading ? (
                      <div className="text-muted-foreground text-sm">Loading...</div>
                    ) : !xPosts || xPosts.length === 0 ? (
                      <div className="text-muted-foreground text-sm">No tweets submitted yet.</div>
                    ) : (
                      <div className="space-y-2">
                        {xPosts.map((p: any) => (
                          <div key={p.id} className="flex items-center justify-between rounded-md border p-3">
                            <div className="truncate">
                              <a className="text-sm text-primary hover:underline" href={p.url} target="_blank" rel="noreferrer">{p.url}</a>
                              <div className="text-xs text-muted-foreground">Status: {p.status}{p.reason ? ` — ${p.reason}` : ""}</div>
                            </div>
                            <div className="text-xs text-muted-foreground">{p.tweetCreatedAt ? new Date(p.tweetCreatedAt).toLocaleString() : ""}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Referral */}
              {profile.referralCode && (
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
                              {profile.referralCode}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(profile.referralCode || "");
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

        {/* X handle dialog */}
        <Dialog open={isXDialogOpen} onOpenChange={setIsXDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Connect X account</DialogTitle>
              <DialogDescription>Add your X (Twitter) handle to display on your profile.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <label className="text-sm font-medium mb-2 block">X Handle</label>
                <div className="flex items-center gap-2">
                  <div className="px-2 py-2 border rounded-md text-sm text-muted-foreground">@</div>
                  <Input value={xHandle} onChange={(e) => setXHandle(e.target.value.replace(/^@/, ""))} placeholder="yourhandle" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsXDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleXSave} disabled={updateProfile.isPending}>{updateProfile.isPending ? "Saving..." : "Save"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Avatar Edit Dialog */}
        <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Avatar</DialogTitle>
              <DialogDescription>
                Enter an image URL or upload an image file for your avatar.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex justify-center">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="text-3xl">
                    {avatarUrl ? <ImageIcon className="h-12 w-12" /> : getInitials(profile?.username)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Avatar URL</label>
                <Input
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Or upload an image</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Note: File uploads will be converted to data URLs. For production, upload to a server.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAvatarDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAvatarSave} disabled={updateProfile.isPending}>
                {updateProfile.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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

export default Profile;
