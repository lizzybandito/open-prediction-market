import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useCashOut, useCalculateCashOut } from "@/hooks/use-trading";

type CashOutPrediction = {
  id: string;
  marketId: string;
  question?: string;
  shares?: number;
  invested?: number;
  profit?: number;
  currentValue?: number;
  entryPrice?: number;
  avgPrice?: number;
  currentOdds?: string;
  currentOddsNumber?: number;
  isOutcomePosition?: boolean;
  optionName?: string;
  pickName?: string;
  position?: "yes" | "no";
  outcomeLabel?: string;
};

interface CashOutDialogProps {
  open: boolean;
  prediction: CashOutPrediction | null;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const CashOutDialog = ({ open, prediction, onOpenChange, onSuccess }: CashOutDialogProps) => {
  const [sharesToCashOut, setSharesToCashOut] = useState("");
  const cashOutMutation = useCashOut();

  useEffect(() => {
    if (!prediction || typeof prediction.shares !== "number") {
      setSharesToCashOut("");
      return;
    }

    const defaultShares = prediction.shares;
    const shouldSuggestPartial = Boolean(
      prediction.profit !== undefined &&
        prediction.profit !== null &&
        prediction.profit > 0 &&
        defaultShares > 2
    );
    setSharesToCashOut((shouldSuggestPartial ? defaultShares / 2 : defaultShares).toString());
  }, [prediction, open]);

  const parsedShares = sharesToCashOut ? parseFloat(sharesToCashOut) : undefined;
  const selectedOutcomeLabel =
    prediction?.isOutcomePosition
      ? prediction.optionName || prediction.outcomeLabel || prediction.pickName
      : undefined;
  const selectedOutcomeSide =
    prediction?.isOutcomePosition
      ? (((prediction.pickName || prediction.position || "YES").toUpperCase() === "NO" ? "NO" : "YES") as "YES" | "NO")
      : undefined;

  const cashOutParams =
    prediction?.marketId && parsedShares && parsedShares > 0
      ? {
          marketId: prediction.marketId,
          shares: parsedShares,
          ...(selectedOutcomeLabel
            ? {
                outcomeLabel: selectedOutcomeLabel,
                outcomeSide: selectedOutcomeSide,
              }
            : {}),
        }
      : undefined;

  const { data: cashOutCalc, isLoading: calculatingCashOut } = useCalculateCashOut(cashOutParams);

  const maxShares = prediction?.shares || 0;
  const sharesValue = useMemo(() => parseFloat(sharesToCashOut) || 0, [sharesToCashOut]);
  const selectedPercent = useMemo(() => {
    if (!maxShares || !sharesValue) return 0;
    return Math.min(100, Math.max(0, (sharesValue / maxShares) * 100));
  }, [maxShares, sharesValue]);
  const remainingPercent = useMemo(() => {
    if (!cashOutCalc?.data) return 0;
    const totalBefore = cashOutCalc.data.remainingShares + (cashOutParams?.shares || 0);
    if (!totalBefore) return 0;
    return (cashOutCalc.data.remainingShares / totalBefore) * 100;
  }, [cashOutCalc?.data, cashOutParams?.shares]);

  const fallbackPrice =
    prediction?.currentValue && prediction?.shares
      ? (prediction.currentValue / prediction.shares) * 100
      : undefined;
  const cashOutAmountFallback =
    sharesValue > 0 && fallbackPrice ? (sharesValue / 100) * fallbackPrice : sharesValue;
  const investedFallback =
    prediction?.invested && prediction?.shares
      ? prediction.invested * (sharesValue / prediction.shares)
      : undefined;
  const profitFallback =
    investedFallback !== undefined ? cashOutAmountFallback - investedFallback : undefined;
  const entryPrice = prediction?.entryPrice ?? prediction?.avgPrice;
  const livePrice =
    cashOutCalc?.data?.currentPrice ??
    prediction?.currentOddsNumber ??
    (prediction?.currentOdds ? parseFloat(prediction.currentOdds) : undefined) ??
    fallbackPrice;
  const positionLabel =
    prediction?.optionName ||
    prediction?.outcomeLabel ||
    prediction?.pickName ||
    prediction?.position?.toUpperCase();
  const entryPriceDisplay = entryPrice !== undefined ? `${entryPrice.toFixed(2)}¢` : "—";
  const livePriceDisplay = livePrice !== undefined ? `${livePrice.toFixed(2)}¢` : "—";
  const totalPositionValue =
    prediction?.currentValue ??
    (prediction?.shares && livePrice ? ((prediction.shares / 100) * livePrice) : undefined);
  const totalInvested =
    prediction?.invested ??
    (prediction?.shares && entryPrice !== undefined ? ((prediction.shares / 100) * entryPrice) : undefined);

  const handleQuickSelect = (percent: number) => {
    if (!maxShares) return;
    const value = (percent / 100) * maxShares;
    setSharesToCashOut(value.toFixed(2));
  };

  const handleSliderChange = (value: number[]) => {
    if (!maxShares || !value?.length) return;
    const percent = value[0];
    const computedShares = (percent / 100) * maxShares;
    setSharesToCashOut(computedShares.toFixed(2));
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleCashOut = () => {
    if (!prediction || !sharesToCashOut) return;
    const shares = parseFloat(sharesToCashOut);
    if (!shares || shares <= 0 || shares > maxShares) return;

    const payload: {
      marketId: string;
      shares: number;
      outcomeLabel?: string;
      outcomeSide?: "YES" | "NO";
    } = {
      marketId: prediction.marketId,
      shares,
    };

    if (prediction.isOutcomePosition && selectedOutcomeLabel) {
      payload.outcomeLabel = selectedOutcomeLabel;
      payload.outcomeSide = selectedOutcomeSide;
    }

    cashOutMutation.mutate(payload, {
      onSuccess: () => {
        handleClose();
        onSuccess?.();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cash Out Position</DialogTitle>
          <DialogDescription>
            Sell your shares at the current market price. You can cash out partially or fully.
          </DialogDescription>
        </DialogHeader>

        {prediction ? (
          <div className="space-y-4 py-2">
            <div className="space-y-3 rounded-lg border bg-muted/40 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Market</p>
                  <p className="font-semibold leading-snug">
                    {prediction.question || "Selected position"}
                  </p>
                </div>
                {positionLabel && (
                  <Badge variant={prediction.isOutcomePosition ? "outline" : "secondary"}>{positionLabel}</Badge>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Entry Price</p>
                  <p className="font-semibold">{entryPriceDisplay}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Market Price</p>
                  <p className="font-semibold">
                    {livePriceDisplay}
                    {!cashOutCalc?.data?.currentPrice && cashOutParams && (
                      <span className="ml-2 text-[10px] text-muted-foreground">est.</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Total Shares</p>
                  <p className="font-semibold">{prediction.shares?.toFixed(2) ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Invested</p>
                  <p className="font-semibold">
                    ${totalInvested !== undefined ? totalInvested.toFixed(2) : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Current Value</p>
                  <p className="font-semibold">
                    ${totalPositionValue !== undefined ? totalPositionValue.toFixed(2) : "—"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shares">Shares to Cash Out</Label>
              <Input
                id="shares"
                type="number"
                min="0"
                max={maxShares}
                step="0.01"
                value={sharesToCashOut}
                onChange={(e) => setSharesToCashOut(e.target.value)}
                placeholder="Enter shares"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Available: {maxShares.toFixed(2)} shares</span>
                <button
                  type="button"
                  onClick={() => setSharesToCashOut(maxShares.toString())}
                  className="text-primary hover:underline"
                >
                  Max
                </button>
              </div>
            </div>

            {maxShares > 0 && (
              <div className="space-y-3">
                <Label className="text-xs text-muted-foreground">Quick Amount</Label>
                <div className="flex items-center gap-2">
                  {[25, 50, 75, 100].map((percent) => (
                    <Button
                      key={percent}
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleQuickSelect(percent)}
                    >
                      {percent}%
                    </Button>
                  ))}
                </div>
                <div className="space-y-1">
                  <Slider value={[selectedPercent]} onValueChange={handleSliderChange} max={100} step={1} />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span>{selectedPercent.toFixed(0)}%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4 rounded-lg border p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Cashing Out</p>
                  <p className="text-lg font-semibold">{sharesValue.toFixed(2)} shares</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Percent</p>
                  <p className="text-lg font-semibold">{selectedPercent.toFixed(0)}%</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Cash Out Amount</p>
                  {calculatingCashOut && !cashOutCalc?.data ? (
                    <p className="text-muted-foreground text-sm flex items-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Updating...
                    </p>
                  ) : (
                    <p className="text-lg font-semibold">
                      $
                      {cashOutCalc?.data
                        ? cashOutCalc.data.cashOutAmount.toFixed(2)
                        : cashOutAmountFallback.toFixed(2)}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Invested</p>
                  <p className="text-lg font-semibold">
                    $
                    {cashOutCalc?.data
                      ? cashOutCalc.data.investedAmount.toFixed(2)
                      : investedFallback?.toFixed(2) ?? "0.00"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Profit/Loss</p>
                  {calculatingCashOut && !cashOutCalc?.data ? (
                    <p className="text-muted-foreground text-sm flex items-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Updating...
                    </p>
                  ) : (
                    <p
                      className={`text-lg font-semibold ${
                        (cashOutCalc?.data?.profit ?? profitFallback ?? 0) >= 0 ? "text-success" : "text-danger"
                      }`}
                    >
                      {(cashOutCalc?.data?.profit ?? profitFallback ?? 0) >= 0 ? "+" : ""}
                      $
                      {(cashOutCalc?.data
                        ? cashOutCalc.data.profit
                        : profitFallback ?? 0
                      ).toFixed(2)}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Return</p>
                  <p
                    className={`text-lg font-semibold ${
                      (cashOutCalc?.data?.profitPercentage ??
                        (profitFallback !== undefined && investedFallback
                          ? (profitFallback / investedFallback) * 100
                          : 0)) >= 0
                        ? "text-success"
                        : "text-danger"
                    }`}
                  >
                    {(cashOutCalc?.data?.profitPercentage ??
                      (profitFallback !== undefined && investedFallback
                        ? (profitFallback / investedFallback) * 100
                        : 0)) >= 0
                      ? "+"
                      : ""}
                    {(
                      cashOutCalc?.data?.profitPercentage ??
                      (profitFallback !== undefined && investedFallback
                        ? (profitFallback / investedFallback) * 100
                        : 0)
                    ).toFixed(2)}
                    %
                  </p>
                </div>
              </div>
              {((cashOutCalc?.data?.remainingShares ?? 0) > 0 || remainingPercent > 0) && (
                <div className="grid grid-cols-2 gap-4 border-t pt-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Remaining Shares</p>
                    <p className="text-lg font-semibold">
                      {(cashOutCalc?.data?.remainingShares ?? Math.max(maxShares - sharesValue, 0)).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Remaining %</p>
                    <p className="text-lg font-semibold">
                      {(cashOutCalc?.data ? remainingPercent : Math.max(100 - selectedPercent, 0)).toFixed(0)}%
                    </p>
                  </div>
                </div>
              )}
            </div>

            {sharesValue > maxShares && (
              <p className="text-sm text-danger">Cannot cash out more shares than you own</p>
            )}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">Select a position to cash out.</div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              handleClose();
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCashOut}
            disabled={
              !prediction ||
              !sharesToCashOut ||
              sharesValue <= 0 ||
              sharesValue > maxShares ||
              cashOutMutation.isPending
            }
          >
            {cashOutMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Cash Out"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

