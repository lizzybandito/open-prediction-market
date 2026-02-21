-- DropForeignKey
ALTER TABLE "presale_participants" DROP CONSTRAINT "presale_participants_userId_fkey";

-- DropIndex
DROP INDEX "presale_participants_presaleId_userId_key";

-- CreateTable
CREATE TABLE "transaction_details" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "username" TEXT,
    "marketId" TEXT,
    "marketTitle" TEXT,
    "pickName" TEXT,
    "optionName" TEXT,
    "optionSide" "PositionType",
    "position" "PositionType",
    "entryPrice" DOUBLE PRECISION,
    "fillPrice" DOUBLE PRECISION,
    "cashoutPrice" DOUBLE PRECISION,
    "closePrice" DOUBLE PRECISION,
    "shares" DOUBLE PRECISION,
    "amount" DOUBLE PRECISION,
    "profit" DOUBLE PRECISION,
    "pnlType" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transaction_details_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "transaction_details_transactionId_key" ON "transaction_details"("transactionId");

-- CreateIndex
CREATE INDEX "transaction_details_userId_idx" ON "transaction_details"("userId");

-- CreateIndex
CREATE INDEX "transaction_details_marketId_idx" ON "transaction_details"("marketId");

-- AddForeignKey
ALTER TABLE "transaction_details" ADD CONSTRAINT "transaction_details_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presale_participants" ADD CONSTRAINT "presale_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
