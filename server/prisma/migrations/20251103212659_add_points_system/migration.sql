-- AlterEnum
ALTER TYPE "OrderCurrency" ADD VALUE 'POINTS';

-- AlterTable
ALTER TABLE "user_engagement" ADD COLUMN     "points" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalPointsEarned" DOUBLE PRECISION NOT NULL DEFAULT 0;
