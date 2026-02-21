/*
  Warnings:

  - You are about to drop the column `arbitrator` on the `markets` table. All the data in the column will be lost.
  - You are about to drop the column `questionId` on the `markets` table. All the data in the column will be lost.
  - You are about to drop the column `resolutionSource` on the `markets` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "OrderCurrency" AS ENUM ('SOL', 'PRED');

-- AlterEnum
ALTER TYPE "TransactionType" ADD VALUE 'CASHOUT';

-- AlterTable
ALTER TABLE "markets" DROP COLUMN "arbitrator",
DROP COLUMN "questionId",
DROP COLUMN "resolutionSource";

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "currency" "OrderCurrency" NOT NULL DEFAULT 'SOL';
