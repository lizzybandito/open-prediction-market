-- CreateEnum
CREATE TYPE "SuggestionSource" AS ENUM ('NEWS_API', 'SOCIAL_MEDIA', 'EVENTS', 'AI_ANALYSIS', 'USER_SUBMIT', 'TRENDS');

-- CreateEnum
CREATE TYPE "SuggestionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CREATED', 'DUPLICATE');

-- CreateEnum
CREATE TYPE "AgentProvider" AS ENUM ('OPENAI', 'GEMINI', 'CLAUDE', 'DEEPSEEK', 'GROK');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "bio" TEXT;

-- CreateTable
CREATE TABLE "market_suggestions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "proposedEndDate" TIMESTAMP(3),
    "resolutionCriteria" TEXT,
    "sourceType" "SuggestionSource" NOT NULL,
    "sourceUrl" TEXT,
    "sourceData" JSONB,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "status" "SuggestionStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "marketId" TEXT,

    CONSTRAINT "market_suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_picks" (
    "id" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "agentProvider" "AgentProvider" NOT NULL,
    "agentName" TEXT NOT NULL,
    "position" "PositionType" NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "reasoning" TEXT,
    "priceTarget" DOUBLE PRECISION,
    "marketYesPrice" DOUBLE PRECISION NOT NULL,
    "marketNoPrice" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_picks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "market_suggestions_marketId_key" ON "market_suggestions"("marketId");

-- CreateIndex
CREATE INDEX "market_suggestions_status_idx" ON "market_suggestions"("status");

-- CreateIndex
CREATE INDEX "market_suggestions_category_idx" ON "market_suggestions"("category");

-- CreateIndex
CREATE INDEX "market_suggestions_confidence_idx" ON "market_suggestions"("confidence");

-- CreateIndex
CREATE INDEX "market_suggestions_createdAt_idx" ON "market_suggestions"("createdAt");

-- CreateIndex
CREATE INDEX "agent_picks_marketId_idx" ON "agent_picks"("marketId");

-- CreateIndex
CREATE INDEX "agent_picks_agentProvider_idx" ON "agent_picks"("agentProvider");

-- CreateIndex
CREATE INDEX "agent_picks_position_idx" ON "agent_picks"("position");

-- CreateIndex
CREATE INDEX "agent_picks_createdAt_idx" ON "agent_picks"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "agent_picks_marketId_agentProvider_key" ON "agent_picks"("marketId", "agentProvider");

-- AddForeignKey
ALTER TABLE "market_suggestions" ADD CONSTRAINT "market_suggestions_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_suggestions" ADD CONSTRAINT "market_suggestions_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_picks" ADD CONSTRAINT "agent_picks_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
