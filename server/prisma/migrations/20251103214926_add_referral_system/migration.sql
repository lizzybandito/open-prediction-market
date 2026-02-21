/*
  Warnings:

  - A unique constraint covering the columns `[referralCode]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ReferralBonusType" AS ENUM ('SEASON', 'PRESALE');

-- CreateEnum
CREATE TYPE "BonusStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "referralCode" TEXT,
ADD COLUMN     "referredBy" TEXT;

-- CreateTable
CREATE TABLE "referral_stats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "referralCode" TEXT NOT NULL,
    "totalReferrals" INTEGER NOT NULL DEFAULT 0,
    "activeReferrals" INTEGER NOT NULL DEFAULT 0,
    "presaleReferrals" INTEGER NOT NULL DEFAULT 0,
    "seasonBonusesEarned" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "presaleBonusesEarned" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalReferralVolume" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalReferralTrades" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "referral_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_bonuses" (
    "id" TEXT NOT NULL,
    "referrerId" TEXT NOT NULL,
    "refereeId" TEXT NOT NULL,
    "seasonId" TEXT,
    "presaleId" TEXT,
    "type" "ReferralBonusType" NOT NULL,
    "baseAmount" DOUBLE PRECISION NOT NULL,
    "bonusPercentage" DOUBLE PRECISION NOT NULL,
    "bonusAmount" DOUBLE PRECISION NOT NULL,
    "status" "BonusStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "referral_bonuses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "referral_stats_userId_key" ON "referral_stats"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "referral_stats_referralCode_key" ON "referral_stats"("referralCode");

-- CreateIndex
CREATE INDEX "referral_stats_referralCode_idx" ON "referral_stats"("referralCode");

-- CreateIndex
CREATE INDEX "referral_bonuses_referrerId_idx" ON "referral_bonuses"("referrerId");

-- CreateIndex
CREATE INDEX "referral_bonuses_refereeId_idx" ON "referral_bonuses"("refereeId");

-- CreateIndex
CREATE INDEX "referral_bonuses_seasonId_idx" ON "referral_bonuses"("seasonId");

-- CreateIndex
CREATE INDEX "referral_bonuses_status_idx" ON "referral_bonuses"("status");

-- CreateIndex
CREATE UNIQUE INDEX "users_referralCode_key" ON "users"("referralCode");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_referredBy_fkey" FOREIGN KEY ("referredBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_stats" ADD CONSTRAINT "referral_stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_bonuses" ADD CONSTRAINT "referral_bonuses_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_bonuses" ADD CONSTRAINT "referral_bonuses_refereeId_fkey" FOREIGN KEY ("refereeId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
