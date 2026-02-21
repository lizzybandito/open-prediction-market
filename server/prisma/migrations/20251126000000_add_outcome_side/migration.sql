-- Add side column to outcome orders
ALTER TABLE "outcome_orders"
ADD COLUMN "side" "PositionType" NOT NULL DEFAULT 'YES';

-- Add side column to outcome positions
ALTER TABLE "outcome_positions"
ADD COLUMN "side" "PositionType" NOT NULL DEFAULT 'YES';

-- Drop old unique constraint and recreate with side included
DROP INDEX IF EXISTS "outcome_positions_userId_marketId_outcomeLabel_key";
CREATE UNIQUE INDEX "outcome_positions_userId_marketId_outcomeLabel_side_key"
ON "outcome_positions"("userId", "marketId", "outcomeLabel", "side");
