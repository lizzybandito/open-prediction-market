import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, LogOut, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useMyPredictions } from "@/hooks/use-predictions";
import { Loader2 } from "lucide-react";
import { CashOutDialog } from "@/components/trading/CashOutDialog";
import { getMarketUrl } from "@/utils/marketUrl";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { PositionDetailsDialog } from "@/components/trading/PositionDetailsDialog";

const MyPredictions = () => {
  const { data: predictionsData, isLoading } = useMyPredictions();
  const sortByBetTimeDesc = (a: any, b: any) => {
    const aTime = new Date(a?.createdAt || a?.resolvedAt || 0).getTime();
    const bTime = new Date(b?.createdAt || b?.resolvedAt || 0).getTime();
    return bTime - aTime;
  };

  const activePredictions = (predictionsData?.active || []).slice().sort(sortByBetTimeDesc);
  const resolvedPredictions = (predictionsData?.resolved || []).slice().sort(sortByBetTimeDesc);

  const [cashOutDialogOpen, setCashOutDialogOpen] = useState(false);
  const [selectedPrediction, setSelectedPrediction] = useState<any>(null);

  const handleCashOutClick = (prediction: any) => {
    setSelectedPrediction(prediction);
    setCashOutDialogOpen(true);
  };

  const getProfitColorClasses = (profit: number) => {
    if (profit > 0) return "text-success bg-success/10 border-success/30";
    if (profit < 0) return "text-danger bg-danger/10 border-danger/30";
    return "text-muted-foreground bg-muted/40 border-border";
  };

  const getProfitIcon = (profit: number) => {
    if (profit > 0) return <ArrowUpRight className="h-3.5 w-3.5" />;
    if (profit < 0) return <ArrowDownRight className="h-3.5 w-3.5" />;
    return null;
  };

  const getSummaryStats = () => {
    const activeValue = activePredictions.reduce(
      (sum: number, p: any) => sum + (p.currentValue ?? 0),
      0
    );
    const realizedProfit = resolvedPredictions.reduce(
      (sum: number, p: any) => sum + (p.profit ?? 0),
      0
    );
    const wins = resolvedPredictions.filter((p: any) => p.outcome === "won").length;
    const totalResolved = resolvedPredictions.length;
    const winRate =
      totalResolved > 0 ? (wins / totalResolved) * 100 : 0;

    return {
      activeValue,
      realizedProfit,
      winRate,
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="mb-8 space-y-4">
          <div>
          <h1 className="text-4xl font-bold mb-2">My Predictions</h1>
            <p className="text-muted-foreground">
              Track, manage, and cash out your positions in real time.
            </p>
          </div>

          {/* Summary strip */}
          <Card className="border-dashed bg-gradient-to-r from-primary/5 via-background to-emerald-500/5">
            <CardContent className="py-4">
              {(() => {
                const { activeValue, realizedProfit, winRate } = getSummaryStats();
                return (
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Active Exposure
                      </p>
                      <p className="text-xl font-semibold">
                        ${activeValue.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Sum of current value across all open positions.
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Realized PnL
                      </p>
                      <div
                        className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-semibold ${getProfitColorClasses(
                          realizedProfit
                        )}`}
                      >
                        {getProfitIcon(realizedProfit)}
                        <span>
                          {realizedProfit >= 0 ? "+" : "-"}$
                          {Math.abs(realizedProfit).toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Total profit/loss from resolved positions.
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Win Rate
                      </p>
                      <p className="text-xl font-semibold">
                        {winRate.toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Percentage of resolved markets you&apos;ve won.
                      </p>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4 mt-6">
            {activePredictions.length === 0 ? (
              <Card className="border-dashed">
                <CardHeader className="pb-2 text-center">
                  <CardTitle className="text-base">No active predictions yet</CardTitle>
                  <CardDescription>
                    Start making picks to build your track record.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-6 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <p className="text-sm text-muted-foreground max-w-sm">
                      Browse live markets and place your first position. Your open trades will
                      show up here with real-time PnL.
                    </p>
                    <Button asChild>
                      <Link to="/">Browse Markets</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {activePredictions.map((prediction: any) => (
                  <Dialog key={prediction.id}>
                    <DialogTrigger asChild>
                      <Card
                        className="relative h-full overflow-hidden border border-border/80 hover:border-primary/40 transition-colors bg-card cursor-pointer"
                      >
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-emerald-400 via-primary to-transparent opacity-60" />
                        <CardHeader className="pb-3">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex-1 space-y-1.5">
                              <CardTitle className="text-base md:text-lg leading-snug line-clamp-2">
                                <Link
                                  to={getMarketUrl({ id: prediction.marketId, slug: (prediction as any).marketSlug })}
                                  className="hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {prediction.question}
                                </Link>
                              </CardTitle>
                              <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm">
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
                                    className="px-2 py-0.5 text-[11px] md:text-xs"
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
                          <div className="grid gap-3 grid-cols-2 md:grid-cols-4 mb-3">
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
                                Current Value
                              </div>
                              <div className="text-sm font-semibold">
                                ${(prediction.currentValue ?? 0).toFixed(2)}
                              </div>
                            </div>
                            <div className="space-y-0.5">
                              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                                Shares
                              </div>
                              <div className="text-sm font-semibold">
                                {prediction.shares?.toFixed(3) || "—"}
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
                          </div>
                          <div className="mt-2 flex flex-col gap-2">
                            <Button
                              variant="outline"
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCashOutClick(prediction);
                              }}
                            >
                              <LogOut className="h-4 w-4 mr-2" />
                              Cash Out
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </DialogTrigger>
                    <PositionDetailsDialog title={prediction.question} position={prediction} variant="active" />
                  </Dialog>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="resolved" className="space-y-4 mt-6">
            {resolvedPredictions.length === 0 ? (
              <Card className="border-dashed">
                <CardHeader className="pb-2 text-center">
                  <CardTitle className="text-base">No resolved predictions yet</CardTitle>
                  <CardDescription>
                    Once markets you&apos;ve traded resolve, your results will appear here.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-6 text-center">
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    Track your historical performance and see where you&apos;ve won or lost over time.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {resolvedPredictions.map((prediction: any) => (
                  <Dialog key={prediction.id}>
                    <DialogTrigger asChild>
                      <Card
                        className="relative h-full overflow-hidden border border-border/80 bg-card cursor-pointer"
                      >
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-emerald-400 via-primary to-transparent opacity-60" />
                        <CardHeader className="pb-3">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex-1 space-y-1.5">
                              <CardTitle className="text-base md:text-lg leading-snug line-clamp-2">
                                <Link
                                  to={getMarketUrl({ id: prediction.marketId, slug: (prediction as any).marketSlug })}
                                  className="hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {prediction.question}
                                </Link>
                              </CardTitle>
                              <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm">
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
                                    className="px-2 py-0.5 text-[11px] md:text-xs"
                                  >
                                    {(prediction.pickName || prediction.position)?.toUpperCase?.()}
                                  </Badge>
                                )}
                                <Badge
                                  variant="outline"
                                  className={
                                    prediction.outcome === "won"
                                      ? "bg-success/10 text-success border-success/30"
                                      : "bg-danger/10 text-danger border-danger/30"
                                  }
                                >
                                  {prediction.outcome === "won" ? "Won" : "Lost"}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {prediction.positive ? (
                                <TrendingUp className="h-4 w-4 text-success" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-danger" />
                              )}
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
                                    ? "text-success"
                                    : "text-danger"
                                }`}
                              >
                                {(prediction.profitPercentage ?? 0) >= 0 ? "+" : "-"}
                                {Math.abs(prediction.profitPercentage ?? 0).toFixed(1)}%
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 pt-3 border-t">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">Profit / Loss</span>
                              <span
                                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-semibold ${getProfitColorClasses(
                                  prediction.profit
                                )}`}
                              >
                                {getProfitIcon(prediction.profit)}
                                <span>
                                  {prediction.profit >= 0 ? "+" : "-"}$
                                  {Math.abs(prediction.profit ?? 0).toFixed(2)}
                                </span>
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </DialogTrigger>
                    <PositionDetailsDialog title={prediction.question} position={prediction} variant="resolved" />
                  </Dialog>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <CashOutDialog
          open={cashOutDialogOpen}
          prediction={selectedPrediction}
          onOpenChange={(open) => {
            setCashOutDialogOpen(open);
            if (!open) {
              setSelectedPrediction(null);
            }
          }}
        />
      </main>
    </div>
  );
};

export default MyPredictions;