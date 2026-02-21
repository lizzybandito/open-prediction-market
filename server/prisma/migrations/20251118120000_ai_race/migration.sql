-- CreateEnum
CREATE TYPE "AgentTradeStatus" AS ENUM ('OPEN', 'CLOSED');

-- AlterTable
ALTER TABLE "agents"
    ADD COLUMN     "raceEnabled" BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN     "startingCapital" DOUBLE PRECISION NOT NULL DEFAULT 1000,
    ADD COLUMN     "availableCapital" DOUBLE PRECISION NOT NULL DEFAULT 1000,
    ADD COLUMN     "maxConcurrentMarkets" INTEGER NOT NULL DEFAULT 3,
    ADD COLUMN     "cooldownMinutes" INTEGER NOT NULL DEFAULT 60,
    ADD COLUMN     "lastTradeAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "agent_race_trades" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "pickId" TEXT,
    "provider" "AgentProvider" NOT NULL,
    "position" "PositionType" NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "priceTarget" DOUBLE PRECISION,
    "amount" DOUBLE PRECISION NOT NULL,
    "shares" DOUBLE PRECISION NOT NULL,
    "entryPrice" DOUBLE PRECISION NOT NULL,
    "exitPrice" DOUBLE PRECISION,
    "pnl" DOUBLE PRECISION,
    "status" "AgentTradeStatus" NOT NULL DEFAULT 'OPEN',
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "agent_race_trades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_race_stats" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "totalTrades" INTEGER NOT NULL DEFAULT 0,
    "openTrades" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "realizedPnl" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unrealizedPnl" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgConfidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bestTradePnl" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "worstTradePnl" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_race_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "agent_race_trades_agentId_status_idx" ON "agent_race_trades"("agentId", "status");

-- CreateIndex
CREATE INDEX "agent_race_trades_marketId_idx" ON "agent_race_trades"("marketId");

-- CreateIndex
CREATE INDEX "agent_race_trades_openedAt_idx" ON "agent_race_trades"("openedAt");

-- CreateIndex
CREATE UNIQUE INDEX "agent_race_stats_agentId_key" ON "agent_race_stats"("agentId");

-- AddForeignKey
ALTER TABLE "agent_race_trades" ADD CONSTRAINT "agent_race_trades_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_race_trades" ADD CONSTRAINT "agent_race_trades_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_race_trades" ADD CONSTRAINT "agent_race_trades_pickId_fkey" FOREIGN KEY ("pickId") REFERENCES "agent_picks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_race_stats" ADD CONSTRAINT "agent_race_stats_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

