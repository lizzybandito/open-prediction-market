import type { Prediction, ResolvedPrediction } from "@/types/api";

type BasicPosition =
  | (Prediction & { username?: string; referralCode?: string })
  | (ResolvedPrediction & { username?: string; referralCode?: string })
  | (Record<string, any> & { username?: string; referralCode?: string });

interface ExportPositionsCsvOptions {
  active: BasicPosition[];
  resolved: BasicPosition[];
  filename?: string;
  referralCode?: string;
}

export function exportPositionsToCsv(options: ExportPositionsCsvOptions) {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const { active, resolved, filename, referralCode } = options;

  const rows: string[][] = [];
  const header = [
    "Type",
    "Market",
    "Side",
    "Option",
    "Invested",
    "Shares",
    "Entry Price (¢)",
    "Current / Payout",
    "Profit",
    "Return (%)",
    "Status",
    "Created At",
    "Resolved At",
    "Referral Code",
  ];
  rows.push(header);

  const addRow = (p: BasicPosition, type: "active" | "resolved") => {
    const market =
      (p as any).question ||
      (p as any).marketTitle ||
      (p as any).market ||
      "";
    const side =
      (p as any).pickName ||
      (p as any).position ||
      (p as any).outcomeSide ||
      "";
    const option = (p as any).optionName || (p as any).outcomeLabel || "";
    const invested =
      (p as any).invested ??
      (p as any).amount ??
      0;
    const shares = (p as any).shares ?? "";
    const entryPrice =
      (p as any).entryPrice ??
      (p as any).avgPrice ??
      "";
    const currentOrPayout =
      (p as any).currentValue ??
      (p as any).payout ??
      "";
    const profit = (p as any).profit ?? "";
    const profitPct = (p as any).profitPercentage ?? "";
    const status = (p as any).status || (type === "active" ? "active" : "resolved");
    const createdAt =
      (p as any).createdAt ||
      (p as any).time ||
      "";
    const resolvedAt = (p as any).resolvedAt || "";

    rows.push([
      type,
      String(market),
      String(side),
      String(option),
      invested !== "" ? String(invested) : "",
      shares !== "" ? String(shares) : "",
      entryPrice !== "" ? String(entryPrice) : "",
      currentOrPayout !== "" ? String(currentOrPayout) : "",
      profit !== "" ? String(profit) : "",
      profitPct !== "" ? String(profitPct) : "",
      String(status),
      String(createdAt),
      String(resolvedAt),
      referralCode || (p as any).referralCode || "",
    ]);
  };

  active.forEach((p) => addRow(p, "active"));
  resolved.forEach((p) => addRow(p, "resolved"));

  const csvContent = rows
    .map((row) =>
      row
        .map((cell) => {
          const value = cell ?? "";
          if (value.includes(",") || value.includes('"') || value.includes("\n")) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(","),
    )
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename || "positions.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

interface ExportPositionImageOptions {
  position: BasicPosition;
  filename?: string;
}

export async function exportPositionImage(options: ExportPositionImageOptions) {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const { position, filename } = options;

  const title =
    (position as any).question ||
    (position as any).marketTitle ||
    (position as any).market ||
    "Prediction";
  const side =
    (position as any).pickName ||
    (position as any).position ||
    (position as any).outcomeSide ||
    "";
  const optionName =
    (position as any).optionName ||
    (position as any).outcomeLabel ||
    "";
  const invested =
    (position as any).invested ??
    (position as any).amount ??
    0;
  const shares = (position as any).shares ?? 0;
  const entryPrice =
    (position as any).entryPrice ??
    (position as any).avgPrice ??
    0;
  const currentOrPayout =
    (position as any).currentValue ??
    (position as any).payout ??
    0;
  const profit = (position as any).profit ?? 0;
  const profitPct = (position as any).profitPercentage ?? 0;
  const status =
    (position as any).status ||
    (position as any).outcome ||
    "active";
  const createdAt =
    (position as any).createdAt ||
    (position as any).time ||
    "";
  const username = (position as any).username || "";
  const referralCode =
    (position as any).referralCode ||
    (position as any).user?.referralCode ||
    "";

  const canvas = document.createElement("canvas");
  // 1200x630 social card style
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#050816");
  gradient.addColorStop(0.5, "#0f172a");
  gradient.addColorStop(1, "#020617");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Card container
  const padding = 80;
  const cardWidth = canvas.width - padding * 2;
  const cardHeight = canvas.height - padding * 2;
  ctx.fillStyle = "rgba(15,23,42,0.9)";
  ctx.roundRect(padding, padding, cardWidth, cardHeight, 32);
  ctx.fill();

  // Title
  ctx.fillStyle = "white";
  ctx.font = "bold 40px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.textBaseline = "top";

  const maxTitleWidth = cardWidth - 40;
  const titleLines: string[] = [];
  const words = String(title).split(" ");
  let currentLine = "";
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxTitleWidth && currentLine) {
      titleLines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) titleLines.push(currentLine);

  let y = padding + 40;
  const x = padding + 32;
  for (const line of titleLines.slice(0, 3)) {
    ctx.fillText(line, x, y);
    y += 46;
  }

  // Side / option
  ctx.font = "bold 28px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
  const isYes =
    String(side).toUpperCase() === "YES" ||
    String(side).toUpperCase() === "Y";
  ctx.fillStyle = isYes ? "#22c55e" : "#ef4444";
  ctx.fillText(side ? String(side).toUpperCase() : "", x, y + 8);

  if (optionName) {
    ctx.font = "24px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillStyle = "#e5e7eb";
    ctx.fillText(`• ${optionName}`, x + 150, y + 10);
  }

  // Main metrics
  const metricsYStart = y + 90;
  const columnWidth = cardWidth / 3;

  const drawMetric = (
    label: string,
    value: string,
    col: number,
    row: number,
    color?: string,
  ) => {
    const baseX = x + col * columnWidth;
    const baseY = metricsYStart + row * 80;
    ctx.font = "20px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillStyle = "#9ca3af";
    ctx.fillText(label, baseX, baseY);
    ctx.font = "bold 30px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillStyle = color || "white";
    ctx.fillText(value, baseX, baseY + 30);
  };

  drawMetric("Invested", `$${Number(invested).toFixed(2)}`, 0, 0);
  drawMetric("Shares", shares ? String(Number(shares).toFixed(2)) : "—", 1, 0);
  drawMetric(
    "Entry price",
    entryPrice ? `${Number(entryPrice).toFixed(2)}¢` : "—",
    2,
    0,
  );

  const profitColor = Number(profit) >= 0 ? "#22c55e" : "#ef4444";
  drawMetric(
    status === "active" ? "Current value" : "Payout",
    `$${Number(currentOrPayout).toFixed(2)}`,
    0,
    1,
  );
  drawMetric(
    "P/L",
    `${Number(profit) >= 0 ? "+" : "-"}$${Math.abs(Number(profit)).toFixed(2)}`,
    1,
    1,
    profitColor,
  );
  drawMetric(
    "Return",
    `${Number(profitPct) >= 0 ? "+" : "-"}${Math.abs(Number(profitPct)).toFixed(
      1,
    )}%`,
    2,
    1,
    profitColor,
  );

  // Footer: user + date + referral
  const footerY = padding + cardHeight - 80;
  ctx.font = "18px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillStyle = "#9ca3af";

  const dateLabel = createdAt
    ? new Date(createdAt).toLocaleString()
    : "";

  const footerLeft = [
    username ? `@${username}` : "",
    dateLabel,
  ]
    .filter(Boolean)
    .join(" • ");

  if (footerLeft) {
    ctx.fillText(footerLeft, x, footerY);
  }

  if (referralCode) {
    const refText = `Referral code: ${referralCode}`;
    const metricsRef = ctx.measureText(refText);
    ctx.fillText(
      refText,
      padding + cardWidth - metricsRef.width - 32,
      footerY,
    );
  }

  // Logo / brand hint
  ctx.font = "bold 22px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillStyle = "#e5e7eb";
  ctx.fillText("tutarmi", x, padding + cardHeight - 130);

  return new Promise<void>((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) return resolve();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename || "position.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      resolve();
    }, "image/png");
  });
}


