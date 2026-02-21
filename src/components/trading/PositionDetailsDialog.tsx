import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface PositionDetailsDialogProps {
  title: string;
  position: any;
  /**
   * active = open position, resolved = settled position
   */
  variant: "active" | "resolved";
  /**
   * Optional callback to generate/share an image for this position.
   */
  onShareImage?: () => void;
}

const formatFullDateTime = (dateString?: string): string => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleString();
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

export function PositionDetailsDialog({ title, position, variant, onShareImage }: PositionDetailsDialogProps) {
  const createdAt = position.createdAt;
  const resolvedAt = position.resolvedAt || position.settledAt;

  const side = position.pickName || position.position;
  const optionName = position.optionName;

  const investedAmount = position.invested ?? position.amount ?? 0;
  const payout = position.payout ?? 0;

  const rawProfit =
    variant === "resolved"
      ? position.profit ?? payout - investedAmount
      : position.profit ?? (position.currentValue ?? 0) - investedAmount;

  const profitPercentage =
    typeof position.profitPercentage === "number"
      ? position.profitPercentage
      : investedAmount > 0
      ? (rawProfit / investedAmount) * 100
      : 0;

  const shares = position.shares;
  const entryPrice = position.entryPrice ?? position.avgPrice;
  const currentValue = position.currentValue ?? investedAmount;
  const cashoutPrice = position.cashoutPrice;
  const transactionId = position.transactionId;
  const outcome = position.outcome;

  return (
    <DialogContent className="max-w-xl border border-border/80 bg-background/95 backdrop-blur px-4 sm:px-6">
      <DialogHeader>
        <DialogTitle className="text-base md:text-lg leading-snug">{title}</DialogTitle>
        <DialogDescription>
          {variant === "active" ? "Live position details with real-time pricing." : "Final results for this position."}
        </DialogDescription>
      </DialogHeader>

      <div className="mt-2 space-y-6 text-sm">
        {/* Top meta row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {optionName && (
              <Badge variant="outline" className="bg-muted/60">
                {optionName}
              </Badge>
            )}
            {side && (
              <Badge
                variant={String(side).toUpperCase() === "YES" ? "default" : "destructive"}
                className="px-2 py-0.5 text-[11px]"
              >
                {String(side).toUpperCase()}
              </Badge>
            )}
            {typeof outcome === "string" && variant === "resolved" && (
              <Badge
                variant="outline"
                className={
                  outcome === "won"
                    ? "bg-green-500/10 text-green-600 border-green-500/30"
                    : "bg-red-500/10 text-red-600 border-red-500/30"
                }
              >
                {outcome === "won" ? "Won" : "Lost"}
              </Badge>
            )}
          </div>
          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-1">
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${getProfitColorClasses(
                rawProfit
              )}`}
            >
              {getProfitIcon(rawProfit)}
              <span>
                {rawProfit >= 0 ? "+" : "-"}${Math.abs(rawProfit).toFixed(2)}
              </span>
            </span>
            <span className="text-xs text-muted-foreground">
              {profitPercentage >= 0 ? "+" : "-"}
              {Math.abs(profitPercentage).toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Timing */}
        <div className="grid gap-3 md:grid-cols-2 rounded-lg border bg-muted/40 p-3 text-xs sm:text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Opened</span>
            <span>{formatFullDateTime(createdAt)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">
              {variant === "resolved" ? "Resolved" : cashoutPrice ? "Last cashout" : "Last update"}
            </span>
            <span>{formatFullDateTime(resolvedAt || createdAt)}</span>
          </div>
        </div>

        {/* Metrics grid */}
        <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
          <div className="space-y-2 rounded-lg border bg-card/60 p-3">
            <div className="flex justify-between">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">Invested</span>
              <span className="text-sm font-semibold">${investedAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">Current value</span>
              <span className="text-sm font-semibold">${currentValue.toFixed(2)}</span>
            </div>
            {variant === "resolved" && (
              <div className="flex justify-between">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">Payout</span>
                <span className="text-sm font-semibold">${payout.toFixed(2)}</span>
              </div>
            )}
          </div>
          <div className="space-y-2 rounded-lg border bg-card/60 p-3">
            <div className="flex justify-between">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">Shares</span>
              <span className="text-sm font-semibold">{shares ? shares.toFixed(4) : "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">Entry price</span>
              <span className="text-sm font-semibold">
                {entryPrice ? `${(entryPrice as number).toFixed(4)}¢` : "—"}
              </span>
            </div>
            {cashoutPrice && (
              <div className="flex justify-between">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">Cashout price</span>
                <span className="text-sm font-semibold">{cashoutPrice.toFixed(4)}¢</span>
              </div>
            )}
          </div>
        </div>

        {/* Transaction */}
        {transactionId && (
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Transaction ID</div>
            <div className="font-mono break-all text-[11px] sm:text-xs">{transactionId}</div>
          </div>
        )}

        {onShareImage && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-between gap-2 pt-2">
            <p className="text-xs text-muted-foreground">
              Generate a high-resolution image of this position for sharing.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={onShareImage}
              className="w-full sm:w-auto"
            >
              Share as image
            </Button>
          </div>
        )}
      </div>
    </DialogContent>
  );
}


