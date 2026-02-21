import { AgentPick, ApiError } from "@/types/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, Sparkles, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { useGenerateAIPicks } from "@/hooks/use-ai-picks";
import { useState } from "react";

interface AIAgentPicksProps {
  marketId: string;
  picks?: AgentPick[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

const agentProviderColors: Record<string, string> = {
  openai: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  gemini: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  claude: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  deepseek: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  grok: "bg-pink-500/10 text-pink-600 border-pink-500/20",
};

const agentProviderIcons: Record<string, string> = {
  openai: "🤖",
  gemini: "💎",
  claude: "🧠",
  deepseek: "🔮",
  grok: "⚡",
};

export function AIAgentPicks({ marketId, picks = [], isLoading, onRefresh }: AIAgentPicksProps) {
  const [generating, setGenerating] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [nextRefreshAt, setNextRefreshAt] = useState<string | null>(null);
  const generateMutation = useGenerateAIPicks();

  const handleGenerate = async () => {
    setGenerating(true);
    setStatus(null);
    setNextRefreshAt(null);
    try {
      const response = await generateMutation.mutateAsync(marketId);
      setStatus({
        type: "success",
        message: response.message || "AI predictions refreshed.",
      });
      setNextRefreshAt(response.nextRefreshAt || null);
      onRefresh?.();
    } catch (error) {
      const apiError = error as ApiError;
      setStatus({
        type: "error",
        message: apiError?.message || "Failed to generate AI picks.",
      });
      setNextRefreshAt(apiError?.retryAt || apiError?.nextRefreshAt || null);
      console.error("Failed to generate AI picks:", error);
    } finally {
      setGenerating(false);
    }
  };

  const renderStatusBanner = () => {
    if (!status) return null;
    const isError = status.type === "error";
    const Icon = isError ? AlertCircle : CheckCircle2;
    const nextRefreshLabel = nextRefreshAt ? new Date(nextRefreshAt).toLocaleString() : null;

    return (
      <div
        className={`mt-4 rounded-md border px-3 py-2 text-sm ${
          isError
            ? "border-destructive/40 bg-destructive/5 text-destructive"
            : "border-emerald-200 bg-emerald-50 text-emerald-700"
        }`}
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          <span>{status.message}</span>
        </div>
        {nextRefreshLabel && (
          <p className="mt-1 text-xs text-muted-foreground">
            Next refresh window: {nextRefreshLabel}
          </p>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Agent Predictions
          </CardTitle>
          <CardDescription>View predictions from AI agents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (picks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Agent Predictions
          </CardTitle>
          <CardDescription>Get predictions from AI agents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 space-y-4">
            <p className="text-muted-foreground">
              No AI predictions available yet. Generate predictions from multiple AI providers.
            </p>
            <Button
              onClick={handleGenerate}
              disabled={generating || generateMutation.isPending}
              className="w-full"
            >
              {generating || generateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate AI Predictions
                </>
              )}
            </Button>
            {renderStatusBanner()}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Agent Predictions
            </CardTitle>
            <CardDescription>
              Predictions from {picks.length} AI agent{picks.length !== 1 ? "s" : ""}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerate}
            disabled={generating || generateMutation.isPending}
          >
            {generating || generateMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {renderStatusBanner()}
        {picks.map((pick) => (
          <div
            key={pick.id}
            className="p-4 rounded-lg border bg-card space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {agentProviderIcons[pick.agentProvider] || "🤖"}
                </span>
                <div>
                  <div className="font-semibold">{pick.agentName}</div>
                  <Badge
                    variant="outline"
                    className={`mt-1 ${agentProviderColors[pick.agentProvider] || ""}`}
                  >
                    {pick.agentProvider.toUpperCase()}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <Badge
                  variant={pick.position === "yes" ? "default" : "destructive"}
                  className="text-lg px-3 py-1"
                >
                  {pick.position.toUpperCase()}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Confidence</span>
                <span className="font-semibold">{pick.confidence.toFixed(1)}%</span>
              </div>
              <Progress value={pick.confidence} className="h-2" />
            </div>

            {pick.priceTarget && (
              <div className="text-sm">
                <span className="text-muted-foreground">Price Target: </span>
                <span className="font-semibold">{pick.priceTarget.toFixed(2)}¢</span>
              </div>
            )}

            {pick.reasoning && (
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {pick.reasoning}
                </p>
              </div>
            )}

            <div className="text-xs text-muted-foreground pt-2 border-t">
              Market prices at prediction: YES {pick.marketYesPrice.toFixed(2)}¢ / NO {pick.marketNoPrice.toFixed(2)}¢
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

