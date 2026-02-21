-- CreateEnum
CREATE TYPE "OutcomeSource" AS ENUM ('ORDERBOOK', 'GAMMA', 'TOKEN', 'CACHE');

-- CreateTable
CREATE TABLE "market_outcome_snapshots" (
    "id" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "outcomeIndex" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "tokenId" TEXT,
    "probability" DOUBLE PRECISION,
    "priceCents" DOUBLE PRECISION,
    "bestBidCents" DOUBLE PRECISION,
    "bestAskCents" DOUBLE PRECISION,
    "midpointCents" DOUBLE PRECISION,
    "liquidity" DOUBLE PRECISION,
    "volume24h" DOUBLE PRECISION,
    "sourcePrice" "OutcomeSource",
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "market_outcome_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outcome_orders" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "outcomeSnapshotId" TEXT,
    "outcomeLabel" TEXT NOT NULL,
    "tokenId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "shares" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" "OrderCurrency" NOT NULL DEFAULT 'SOL',
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "orderType" "OrderType" NOT NULL DEFAULT 'MARKET',
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "outcome_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outcome_positions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "outcomeSnapshotId" TEXT,
    "outcomeLabel" TEXT NOT NULL,
    "tokenId" TEXT,
    "shares" DOUBLE PRECISION NOT NULL,
    "avgPrice" DOUBLE PRECISION NOT NULL,
    "totalInvested" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "outcome_positions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "market_outcome_snapshots_marketId_outcomeIndex_key" ON "market_outcome_snapshots"("marketId", "outcomeIndex");

-- CreateIndex
CREATE INDEX "market_outcome_snapshots_marketId_tokenId_idx" ON "market_outcome_snapshots"("marketId", "tokenId");

-- CreateIndex
CREATE INDEX "outcome_orders_userId_idx" ON "outcome_orders"("userId");

-- CreateIndex
CREATE INDEX "outcome_orders_marketId_idx" ON "outcome_orders"("marketId");

-- CreateIndex
CREATE INDEX "outcome_orders_marketId_outcomeLabel_idx" ON "outcome_orders"("marketId", "outcomeLabel");

-- CreateIndex
CREATE UNIQUE INDEX "outcome_positions_userId_marketId_outcomeLabel_key" ON "outcome_positions"("userId", "marketId", "outcomeLabel");

-- CreateIndex
CREATE INDEX "outcome_positions_marketId_idx" ON "outcome_positions"("marketId");

-- CreateIndex
CREATE INDEX "outcome_positions_userId_idx" ON "outcome_positions"("userId");

-- AddForeignKey
ALTER TABLE "market_outcome_snapshots" ADD CONSTRAINT "market_outcome_snapshots_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outcome_orders" ADD CONSTRAINT "outcome_orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outcome_orders" ADD CONSTRAINT "outcome_orders_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outcome_orders" ADD CONSTRAINT "outcome_orders_outcomeSnapshotId_fkey" FOREIGN KEY ("outcomeSnapshotId") REFERENCES "market_outcome_snapshots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outcome_positions" ADD CONSTRAINT "outcome_positions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outcome_positions" ADD CONSTRAINT "outcome_positions_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outcome_positions" ADD CONSTRAINT "outcome_positions_outcomeSnapshotId_fkey" FOREIGN KEY ("outcomeSnapshotId") REFERENCES "market_outcome_snapshots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

