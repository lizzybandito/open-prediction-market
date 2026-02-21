/*
  Warnings:

  - A unique constraint covering the columns `[evmWalletAddress]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[solWalletAddress]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'STAFF');

-- CreateEnum
CREATE TYPE "AirdropType" AS ENUM ('ONBOARDING', 'ENGAGEMENT', 'LEADERBOARD', 'EARLY_ADOPTER', 'REFERRAL', 'SPECIAL');

-- CreateEnum
CREATE TYPE "AirdropStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SeasonStatus" AS ENUM ('UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "markets" ADD COLUMN     "arbitrator" TEXT,
ADD COLUMN     "questionId" TEXT,
ADD COLUMN     "resolutionSource" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "evmWalletAddress" TEXT,
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'USER',
ADD COLUMN     "solWalletAddress" TEXT;

-- CreateTable
CREATE TABLE "token_balances" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lockedAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "evmAddress" TEXT,
    "solAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "token_balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "airdrops" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenBalanceId" TEXT NOT NULL,
    "type" "AirdropType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "AirdropStatus" NOT NULL DEFAULT 'PENDING',
    "unlockedAt" TIMESTAMP(3),
    "vestingPeriod" INTEGER,
    "txHash" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "airdrops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_engagement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalVolume" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalTrades" INTEGER NOT NULL DEFAULT 0,
    "winCount" INTEGER NOT NULL DEFAULT 0,
    "lossCount" INTEGER NOT NULL DEFAULT 0,
    "winStreak" INTEGER NOT NULL DEFAULT 0,
    "bestWinStreak" INTEGER NOT NULL DEFAULT 0,
    "daysActive" INTEGER NOT NULL DEFAULT 0,
    "lastActiveDate" TIMESTAMP(3),
    "firstActiveDate" TIMESTAMP(3),
    "currentRank" INTEGER,
    "bestRank" INTEGER,
    "seasonsPlayed" INTEGER NOT NULL DEFAULT 0,
    "accuracy" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "engagementScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_engagement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reward_seasons" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "SeasonStatus" NOT NULL DEFAULT 'UPCOMING',
    "totalRewardPool" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "topRewardPercent" DOUBLE PRECISION NOT NULL DEFAULT 0.3,
    "top10Percent" DOUBLE PRECISION NOT NULL DEFAULT 0.8,
    "remainingPercent" DOUBLE PRECISION NOT NULL DEFAULT 0.2,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "reward_seasons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "token_balances_userId_key" ON "token_balances"("userId");

-- CreateIndex
CREATE INDEX "airdrops_userId_idx" ON "airdrops"("userId");

-- CreateIndex
CREATE INDEX "airdrops_status_idx" ON "airdrops"("status");

-- CreateIndex
CREATE INDEX "airdrops_type_idx" ON "airdrops"("type");

-- CreateIndex
CREATE UNIQUE INDEX "user_engagement_userId_key" ON "user_engagement"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "users_evmWalletAddress_key" ON "users"("evmWalletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "users_solWalletAddress_key" ON "users"("solWalletAddress");

-- CreateIndex
CREATE INDEX "users_evmWalletAddress_idx" ON "users"("evmWalletAddress");

-- CreateIndex
CREATE INDEX "users_solWalletAddress_idx" ON "users"("solWalletAddress");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- AddForeignKey
ALTER TABLE "token_balances" ADD CONSTRAINT "token_balances_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "airdrops" ADD CONSTRAINT "airdrops_tokenBalanceId_fkey" FOREIGN KEY ("tokenBalanceId") REFERENCES "token_balances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_engagement" ADD CONSTRAINT "user_engagement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
