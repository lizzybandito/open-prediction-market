import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Clock } from "lucide-react";
import { useActivity, useActivityBetDetail } from "@/hooks/use-activity";
import type { Activity as ActivityType } from "@/types/api";
import { Link } from "react-router-dom";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { getMarketUrl } from "@/utils/marketUrl";
import { PositionDetailsDialog } from "@/components/trading/PositionDetailsDialog";

const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? "minute" : "minutes"} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} ${diffInWeeks === 1 ? "week" : "weeks"} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} ${diffInMonths === 1 ? "month" : "months"} ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} ${diffInYears === 1 ? "year" : "years"} ago`;
};

const formatFullDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleString();
};

const Activity = () => {
  const { data: activities = [], isLoading, error } = useActivity({ type: "bet", limit: 50 });
  
  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('[Activity Page] Activities:', activities);
    console.log('[Activity Page] Loading:', isLoading);
    console.log('[Activity Page] Error:', error);
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Activity</h1>
          <p className="text-muted-foreground">Recent bets and activity across all markets</p>
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading activity...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-destructive">Failed to load activity. Please try again later.</p>
          </div>
        )}

        {!isLoading && !error && activities && activities.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No activity yet. Be the first to place a bet!</p>
          </div>
        )}

        {!isLoading && !error && activities && activities.length > 0 && (
          <div className="space-y-4">
            {activities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity as ActivityType & Record<string, any>} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

const ActivityItem = ({ activity }: { activity: ActivityType & Record<string, any> }) => {
  const isBetActivity = activity.type === "bet";
  const { data: betDetail } = useActivityBetDetail(isBetActivity ? activity.id : undefined);

  const effectivePickName =
    betDetail?.pickName || activity.pickName || activity.position?.toUpperCase();
  const effectiveOptionName = betDetail?.optionName || activity.optionName;
  const entryPrice = betDetail?.entryPrice ?? activity.entryPrice;
  const currentPrice = betDetail?.odds;
  const shares = betDetail?.shares ?? activity.shares;
  const profit = betDetail?.profit;

  const mergedPosition = {
    ...activity,
    ...(betDetail || {}),
    question: activity.market || "Unknown Market",
    pickName: effectivePickName,
    optionName: effectiveOptionName,
    entryPrice,
    currentValue: typeof betDetail?.currentValue === "number" ? betDetail.currentValue : undefined,
    shares,
    profit,
    invested: betDetail?.amount ?? activity.amount,
    createdAt: betDetail?.createdAt ?? activity.time,
  };

  const variant: "active" | "resolved" =
    (betDetail?.status || activity.status) === "resolved" || activity.type === "win"
      ? "resolved"
      : "active";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:border-primary/40 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg mb-1">
                  {activity.marketId ? (
                    <Link
                      to={getMarketUrl(activity.marketId)}
                      className="hover:text-primary underline-offset-2 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {activity.market || "Unknown Market"}
                    </Link>
                  ) : (
                    activity.market || "Unknown Market"
                  )}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 flex-wrap">
                  <Clock className="h-3 w-3" />
                  {formatRelativeTime(activity.time)}
                  {activity.username && (
                    <>
                      <span className="mx-1">•</span>
                      <Link
                        to={`/user/${encodeURIComponent(activity.username)}`}
                        className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {activity.username}
                      </Link>
                    </>
                  )}
                </CardDescription>
              </div>
              {activity.positive ? (
                <TrendingUp className="h-5 w-5 text-green-500" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-500" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 flex-wrap">
              {effectiveOptionName && (
                <Badge variant="default">
                  {effectiveOptionName}
                </Badge>
              )}
              {effectivePickName && (
                <Badge variant={effectivePickName.toUpperCase() === "YES" ? "default" : "destructive"}>
                  {effectivePickName}
                </Badge>
              )}
              {!effectivePickName && !effectiveOptionName && activity.position && (
                <Badge variant={activity.position === "yes" ? "default" : "destructive"}>
                  {activity.position === "yes" ? "Yes" : "No"}
                </Badge>
              )}
              <span className="font-semibold">
                ${typeof activity.amount === "number" ? Math.abs(activity.amount).toFixed(2) : activity.amount}
              </span>

              {entryPrice !== undefined && entryPrice !== null && (
                <span className="text-sm text-muted-foreground">
                  Entry: {entryPrice.toFixed(2)}¢
                </span>
              )}
              {currentPrice !== undefined && currentPrice !== null && (
                <span className="text-sm text-muted-foreground">
                  Current: {currentPrice.toFixed(2)}¢
                </span>
              )}
              {shares !== undefined && shares !== null && (
                <span className="text-sm text-muted-foreground">
                  {shares.toFixed(2)} shares
                </span>
              )}
              {profit !== undefined && profit !== null && (
                <span
                  className={`text-sm font-medium ${
                    profit >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  P/L: ${profit.toFixed(2)}
                </span>
              )}

              <Badge variant="outline" className="ml-auto">
                {activity.type === "bet" ? "Placed Bet" : activity.type === "win" ? "Won" : activity.type}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      <PositionDetailsDialog
        title={activity.market || "Unknown Market"}
        position={mergedPosition}
        variant={variant}
      />
    </Dialog>
  );
};

const ActivityDetailContent = ({
  activity,
  betDetail,
}: {
  activity: ActivityType & Record<string, any>;
  betDetail?: any;
}) => {
  const effectivePickName =
    betDetail?.pickName || activity.pickName || activity.position?.toUpperCase();
  const effectiveOptionName = betDetail?.optionName || activity.optionName;

  return (
    <div className="space-y-3 text-sm">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Date</span>
        <span>{formatFullDateTime(activity.time)}</span>
      </div>

      {activity.username && (
        <div className="flex justify-between">
          <span className="text-muted-foreground">User</span>
          <Link
            to={`/user/${encodeURIComponent(activity.username)}`}
            className="text-primary hover:underline"
          >
            {activity.username}
          </Link>
        </div>
      )}

      {effectivePickName && (
        <div className="flex justify-between">
          <span className="text-muted-foreground">Side</span>
          <span>{effectivePickName}</span>
        </div>
      )}

      {effectiveOptionName && (
        <div className="flex justify-between">
          <span className="text-muted-foreground">Option</span>
          <span>{effectiveOptionName}</span>
        </div>
      )}

      <div className="flex justify-between">
        <span className="text-muted-foreground">Amount</span>
        <span>
          $
          {typeof activity.amount === "number"
            ? Math.abs(activity.amount).toFixed(2)
            : activity.amount}
        </span>
      </div>

      {betDetail && (
        <>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Entry price</span>
            <span>{betDetail.entryPrice.toFixed(2)}¢</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Current price</span>
            <span>{betDetail.odds?.toFixed(2)}¢</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shares</span>
            <span>{betDetail.shares?.toFixed(4)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Profit / Loss</span>
            <span className={betDetail.profit >= 0 ? "text-green-500" : "text-red-500"}>
              ${betDetail.profit.toFixed(2)}
            </span>
          </div>
        </>
      )}

      {activity.transactionId && (
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Transaction ID</span>
          <span className="font-mono break-all text-xs">{activity.transactionId}</span>
        </div>
      )}
      {activity.orderId && (
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Order ID</span>
          <span className="font-mono break-all text-xs">{activity.orderId}</span>
        </div>
      )}
      <div className="flex justify-between">
        <span className="text-muted-foreground">Status</span>
        <span className="capitalize">
          {betDetail?.status || activity.status || "completed"}
        </span>
      </div>
    </div>
  );
};

export default Activity;
