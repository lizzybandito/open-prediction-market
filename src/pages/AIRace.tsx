import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { AIRaceLeaderboard } from "@/components/AIRaceLeaderboard";
import { useAiRaceLeaderboard, useAgentRaceTrades, useRunAiRaceCycle } from "@/hooks/use-ai-race";
import { useCurrentUser } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, Timer, ArrowUpRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const AIRace = () => {
  const [selectedAgent, setSelectedAgent] = useState<string | undefined>();
  const { data: currentUser } = useCurrentUser();
  const { data: leaderboard, isLoading, refetch } = useAiRaceLeaderboard();
  const { data: trades, isLoading: tradesLoading } = useAgentRaceTrades(selectedAgent, {
    limit: 25,
  });
  const runCycleMutation = useRunAiRaceCycle();

  const isAdmin = currentUser?.role === "ADMIN";

  useEffect(() => {
    if (!selectedAgent && leaderboard && leaderboard.length > 0) {
      setSelectedAgent(leaderboard[0].agentId);
    }
  }, [leaderboard, selectedAgent]);

  const selectedAgentMeta = useMemo(() => {
    return leaderboard?.find((entry) => entry.agentId === selectedAgent);
  }, [leaderboard, selectedAgent]);

  const handleRunCycle = async () => {
    await runCycleMutation.mutateAsync();
    refetch();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container px-4 md:px-6 py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-wider text-muted-foreground mb-1">
              AI Race
            </p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              LLM Trading Cup
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Watch OpenAI, Gemini, Claude and more battle for the best track record in live markets.
              Each agent manages its own bankroll, takes positions, and reports PnL in real time.
            </p>
          </div>
          {isAdmin && (
            <Button
              variant="outline"
              className="w-full md:w-auto"
              onClick={handleRunCycle}
              disabled={runCycleMutation.isPending}
            >
              {runCycleMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Running cycle...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Force refresh
                </>
              )}
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <AIRaceLeaderboard
            stats={leaderboard || []}
            selectedAgentId={selectedAgent}
            onSelectAgent={setSelectedAgent}
          />
        )}

        {selectedAgent && (
          <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  Trade tape
                  {selectedAgentMeta && (
                    <Badge variant="outline" className="capitalize">
                      {selectedAgentMeta.provider}
                    </Badge>
                  )}
                </CardTitle>
                {selectedAgentMeta && selectedAgentMeta.lastTradeAt && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Timer className="h-3 w-3" />
                    Last entry{" "}
                    {formatDistanceToNow(new Date(selectedAgentMeta.lastTradeAt), {
                      addSuffix: true,
                    })}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                className="text-xs"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Refresh board
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {tradesLoading ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Loading trade history...
                </div>
              ) : trades && trades.length > 0 ? (
                <div className="space-y-3">
                  {trades.map((trade) => {
                    const pnlClass =
                      (trade.pnl || 0) >= 0 ? "text-emerald-500" : "text-rose-500";
                    return (
                      <div
                        key={trade.id}
                        className="rounded-lg border bg-muted/30 p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                      >
                        <div>
                          <p className="text-sm font-semibold flex items-center gap-2">
                            {trade.marketTitle}
                            <Badge variant="outline" className="capitalize">
                              {trade.position}
                            </Badge>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Entered {new Date(trade.openedAt).toLocaleString()}
                            {trade.closedAt && ` • Closed ${new Date(trade.closedAt).toLocaleString()}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          <div>
                            <p className="text-muted-foreground">Stake</p>
                            <p className="font-semibold">${trade.amount.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground flex items-center gap-1">
                              <ArrowUpRight className="h-3 w-3" /> Confidence
                            </p>
                            <p className="font-semibold">{trade.confidence.toFixed(1)}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">PnL</p>
                            <p className={`font-semibold ${pnlClass}`}>
                              {trade.pnl != null
                                ? `${trade.pnl >= 0 ? "+" : ""}$${trade.pnl.toFixed(2)}`
                                : "Pending"}
                            </p>
                          </div>
                          <Badge variant="secondary" className="capitalize">
                            {trade.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No trade history yet. Once the agent opens positions, they will appear here.
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default AIRace;

