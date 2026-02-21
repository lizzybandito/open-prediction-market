-- CreateTable
CREATE TABLE "saved_markets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_markets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agents" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "provider" "AgentProvider" NOT NULL DEFAULT 'GEMINI',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "dailyBudget" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxPerTrade" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "confidenceThreshold" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "scheduleCron" TEXT,
    "marketsFilter" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "saved_markets_userId_idx" ON "saved_markets"("userId");

-- CreateIndex
CREATE INDEX "saved_markets_marketId_idx" ON "saved_markets"("marketId");

-- CreateIndex
CREATE UNIQUE INDEX "saved_markets_userId_marketId_key" ON "saved_markets"("userId", "marketId");

-- CreateIndex
CREATE INDEX "agents_userId_idx" ON "agents"("userId");

-- CreateIndex
CREATE INDEX "agents_active_idx" ON "agents"("active");

-- AddForeignKey
ALTER TABLE "saved_markets" ADD CONSTRAINT "saved_markets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_markets" ADD CONSTRAINT "saved_markets_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agents" ADD CONSTRAINT "agents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
