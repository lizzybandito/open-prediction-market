import { AgentRaceStat } from "@/types/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Trophy, TrendingUp, Activity } from "lucide-react";

const providerEmojis: Record<string, string> = {
  openai: "🤖",
  gemini: "💎",
  claude: "🧠",
  deepseek: "🔮",
  grok: "⚡",
};

interface AIRaceLeaderboardProps {
  stats: AgentRaceStat[];
  selectedAgentId?: string;
  onSelectAgent?: (agentId: string) => void;
}

export function AIRaceLeaderboard({
  stats,
  selectedAgentId,
  onSelectAgent,
}: AIRaceLeaderboardProps) {
  if (!stats.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Race Standings</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          No AI agents are racing yet. Configure providers to enable the race.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {stats.map((entry, index) => {
        const roi =
          ((entry.availableCapital + entry.realizedPnl + entry.unrealizedPnl - entry.startingCapital) /
            entry.startingCapital) *
          100;
        const pnlTotal = entry.realizedPnl + entry.unrealizedPnl;

        return (
          <Card
            key={entry.agentId}
            role="button"
            tabIndex={0}
            onClick={() => onSelectAgent?.(entry.agentId)}
            className={cn(
              "transition-all hover:border-primary/70 focus-visible:ring-2 focus-visible:ring-primary cursor-pointer",
              selectedAgentId === entry.agentId && "border-primary shadow-lg"
            )}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
                    <span>#{index + 1}</span>
                    <span className="flex items-center gap-1">
                      <Trophy className="h-3 w-3 text-yellow-500" />
                      AI Racer
                    </span>
                  </div>
                  <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                    <span>{providerEmojis[entry.provider] || "🤖"}</span>
                    {entry.agentName}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground capitalize">
                    {entry.provider}
                  </p>
                </div>
                <Badge variant="outline" className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {roi >= 0 ? "+" : ""}
                  {roi.toFixed(1)}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-muted-foreground">Capital</p>
                  <p className="font-semibold">
                    ${entry.availableCapital.toFixed(2)}
                    <span className="ml-1 text-xs text-muted-foreground">
                      / ${entry.startingCapital.toFixed(0)}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">PnL</p>
                  <p
                    className={cn(
                      "font-semibold",
                      pnlTotal >= 0 ? "text-emerald-500" : "text-rose-500"
                    )}
                  >
                    {pnlTotal >= 0 ? "+" : ""}
                    ${pnlTotal.toFixed(2)}
                  </p>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Confidence</span>
                  <span>{entry.avgConfidence.toFixed(1)}%</span>
                </div>
                <Progress value={entry.avgConfidence} />
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="rounded border border-border/60 p-2 text-center">
                  <p className="text-muted-foreground flex items-center justify-center gap-1">
                    <Activity className="h-3 w-3" />
                    Trades
                  </p>
                  <p className="text-sm font-semibold">
                    {entry.totalTrades}
                    <span className="text-[10px] text-muted-foreground ml-1">
                      ({entry.openTrades} open)
                    </span>
                  </p>
                </div>
                <div className="rounded border border-border/60 p-2 text-center">
                  <p className="text-muted-foreground">Win rate</p>
                  <p className="text-sm font-semibold">
                    {entry.wins}/{entry.totalTrades || 1}
                  </p>
                </div>
                <div className="rounded border border-border/60 p-2 text-center">
                  <p className="text-muted-foreground">Next trade</p>
                  <p className="text-[11px] font-semibold">
                    {entry.nextTradeAt
                      ? new Date(entry.nextTradeAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Live"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}



