import { useMemo, useState } from "react";
import {
  Dot,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type RangeKey = "1d" | "7d" | "30d" | "all";

const RANGE_OPTIONS: { key: RangeKey; label: string; days?: number }[] = [
  { key: "1d", label: "1D", days: 1 },
  { key: "7d", label: "7D", days: 7 },
  { key: "30d", label: "30D", days: 30 },
  { key: "all", label: "ALL" },
];

const MS_IN_DAY = 24 * 60 * 60 * 1000;

interface BasePosition {
  invested?: number;
  profit?: number;
  payout?: number;
  currentValue?: number;
  profitPercentage?: number;
  resolvedAt?: string;
  updatedAt?: string;
  createdAt?: string;
}

interface PnLPanelProps {
  resolved: BasePosition[];
  active: BasePosition[];
  title?: string;
  description?: string;
}

const parseDate = (value?: string | null) => {
  if (!value) return null;
  const time = Date.parse(value);
  return Number.isNaN(time) ? null : new Date(time);
};

const coerceProfit = (item: BasePosition) => {
  if (typeof item.profit === "number" && Number.isFinite(item.profit)) {
    return item.profit;
  }
  const invested = typeof item.invested === "number" ? item.invested : 0;
  const payout = typeof item.payout === "number" ? item.payout : undefined;
  if (typeof payout === "number") {
    return payout - invested;
  }
  return 0;
};

const buildSeries = (items: BasePosition[], range: RangeKey) => {
  const cutoff =
    range === "all"
      ? null
      : Date.now() - (RANGE_OPTIONS.find((r) => r.key === range)?.days || 0) * MS_IN_DAY;

  const bucket = new Map<string, number>();

  items.forEach((item) => {
    const date =
      parseDate(item.resolvedAt) ||
      parseDate(item.updatedAt) ||
      parseDate(item.createdAt);
    if (!date) return;
    if (cutoff && date.getTime() < cutoff) return;
    const key = date.toISOString().slice(0, 10);
    const prev = bucket.get(key) || 0;
    bucket.set(key, prev + coerceProfit(item));
  });

  return [...bucket.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, value]) => ({ date, value }));
};

const formatCurrency = (value: number) =>
  `${value >= 0 ? "+" : ""}$${value.toFixed(2)}`;

export const PnLPanel = ({
  resolved,
  active,
  title = "Profit / Loss",
  description = "Performance over time",
}: PnLPanelProps) => {
  const [range, setRange] = useState<RangeKey>("all");

  const { realized, unrealized, total, chartData } = useMemo(() => {
    const resolvedRange =
      range === "all"
        ? resolved
        : resolved.filter((p) => {
            const date =
              parseDate(p.resolvedAt) ||
              parseDate(p.updatedAt) ||
              parseDate(p.createdAt);
            if (!date) return false;
            const days = RANGE_OPTIONS.find((r) => r.key === range)?.days;
            if (!days) return true;
            return Date.now() - date.getTime() <= days * MS_IN_DAY;
          });

    const realizedSum = resolvedRange.reduce(
      (sum, p) => sum + coerceProfit(p),
      0
    );

    const unrealizedSum = active.reduce((sum, p) => {
      // For open positions, unrealized PnL should always be mark-to-market:
      // currentValue - invested. Do NOT use the raw "profit" field here,
      // because backend profit for active positions may already include
      // realized cashout PnL, which we only want in the realized bucket.
      if (
        typeof p.currentValue === "number" &&
        typeof p.invested === "number"
      ) {
        return sum + (p.currentValue - p.invested);
      }
      if (typeof p.profit === "number" && Number.isFinite(p.profit)) {
        return sum + p.profit;
      }
      return sum;
    }, 0);

    return {
      realized: realizedSum,
      unrealized: unrealizedSum,
      total: realizedSum + unrealizedSum,
      chartData: buildSeries(resolvedRange, range),
    };
  }, [resolved, active, range]);

  return (
    <Card>
      <CardHeader className="pb-2 pt-3 md:pt-4">
        <div className="flex items-start justify-between gap-2 md:gap-3 flex-wrap">
          <div>
            <CardTitle className="text-base md:text-lg">{title}</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              {description}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1 text-xs md:text-sm">
            {RANGE_OPTIONS.map((option) => (
              <Button
                key={option.key}
                variant={option.key === range ? "default" : "ghost"}
                size="sm"
                className="h-7 px-2 md:h-8 md:px-3"
                onClick={() => setRange(option.key)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 md:space-y-4">
        <div className="grid grid-cols-3 gap-3 md:gap-4 text-xs md:text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Realized</p>
            <p
              className={`text-sm md:text-xl font-semibold ${
                realized >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatCurrency(realized)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Unrealized</p>
            <p
              className={`text-sm md:text-xl font-semibold ${
                unrealized >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatCurrency(unrealized)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total</p>
            <p
              className={`text-sm md:text-xl font-semibold ${
                total >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatCurrency(total)}
            </p>
          </div>
        </div>
        {chartData.length < 2 ? (
          <div className="h-24 md:h-32 flex items-center justify-center text-xs text-muted-foreground">
            Not enough realized history in this range yet.
          </div>
        ) : (
          <div className="h-28 md:h-36">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  fontSize={11}
                  tickFormatter={(value) => value.slice(5)} // MM-DD
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  fontSize={11}
                  tickFormatter={(value) => `$${Number(value).toFixed(0)}`}
                />
                <ReferenceLine
                  y={0}
                  stroke="rgba(148, 163, 184, 0.35)" // slate-400/35
                  strokeDasharray="3 3"
                />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), "PnL"]}
                  labelFormatter={(label) => new Date(label).toDateString()}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                  activeDot={(props: any) => {
                    const { index } = props;
                    if (index === chartData.length - 1) {
                      return (
                        <Dot
                          r={4}
                          fill="hsl(var(--primary))"
                          strokeWidth={0}
                        />
                      );
                    }
                    return null;
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className="flex flex-wrap gap-1.5 md:gap-2 text-[10px] md:text-[11px] text-muted-foreground">
          <Badge variant="outline" className="px-2 py-0.5 text-[10px]">
            Realized = closed bets
          </Badge>
          <Badge variant="outline" className="px-2 py-0.5 text-[10px]">
            Unrealized = open PnL
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

