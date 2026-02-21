-- CreateEnum
CREATE TYPE "PresaleStatus" AS ENUM ('UPCOMING', 'ACTIVE', 'CLOSED', 'DISTRIBUTED');

-- AlterEnum (add PRESALE to TransactionType)
ALTER TYPE "TransactionType" ADD VALUE 'PRESALE';

-- CreateTable
CREATE TABLE IF NOT EXISTS "presales" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "tokenAllocation" DOUBLE PRECISION NOT NULL,
    "fdvTarget" DOUBLE PRECISION NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "PresaleStatus" NOT NULL DEFAULT 'UPCOMING',
    "totalContributions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "participantCount" INTEGER NOT NULL DEFAULT 0,
    "baseTokensPerUser" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "presales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "presale_participants" (
    "id" TEXT NOT NULL,
    "presaleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "solContributed" DOUBLE PRECISION NOT NULL,
    "baseTokens" DOUBLE PRECISION,
    "referralBonus" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bettingBonus" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalTokens" DOUBLE PRECISION,
    "referralCodeUsed" TEXT,
    "txHash" TEXT,
    "blockNumber" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "presale_participants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "presales_status_idx" ON "presales"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "presales_startDate_idx" ON "presales"("startDate");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "presales_endDate_idx" ON "presales"("endDate");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "presale_participants_presaleId_userId_key" ON "presale_participants"("presaleId", "userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "presale_participants_userId_idx" ON "presale_participants"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "presale_participants_presaleId_idx" ON "presale_participants"("presaleId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "presale_participants_txHash_idx" ON "presale_participants"("txHash");

-- AddForeignKey
ALTER TABLE "presale_participants" ADD CONSTRAINT "presale_participants_presaleId_fkey" FOREIGN KEY ("presaleId") REFERENCES "presales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presale_participants" ADD CONSTRAINT "presale_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

