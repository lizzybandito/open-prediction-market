-- Add presaleWalletAddress to presales table
ALTER TABLE "presales" ADD COLUMN IF NOT EXISTS "presaleWalletAddress" TEXT;

-- Add index for presaleWalletAddress
CREATE INDEX IF NOT EXISTS "presales_presaleWalletAddress_idx" ON "presales"("presaleWalletAddress");

-- Add walletAddress column to presale_participants (required)
ALTER TABLE "presale_participants" ADD COLUMN IF NOT EXISTS "walletAddress" TEXT;

-- Make userId nullable (for wallet-first contributions)
ALTER TABLE "presale_participants" ALTER COLUMN "userId" DROP NOT NULL;

-- Add linkedAt column
ALTER TABLE "presale_participants" ADD COLUMN IF NOT EXISTS "linkedAt" TIMESTAMP(3);

-- Drop old unique constraint (presaleId_userId)
ALTER TABLE "presale_participants" DROP CONSTRAINT IF EXISTS "presale_participants_presaleId_userId_key";

-- Add new unique constraint (presaleId_walletAddress)
ALTER TABLE "presale_participants" ADD CONSTRAINT "presale_participants_presaleId_walletAddress_key" UNIQUE ("presaleId", "walletAddress");

-- Add index for walletAddress
CREATE INDEX IF NOT EXISTS "presale_participants_walletAddress_idx" ON "presale_participants"("walletAddress");

-- Update existing participants: set walletAddress from user's wallet if null
UPDATE "presale_participants" pp
SET "walletAddress" = COALESCE(
  (SELECT u."solWalletAddress" FROM "users" u WHERE u."id" = pp."userId"),
  (SELECT u."walletAddress" FROM "users" u WHERE u."id" = pp."userId")
)
WHERE "walletAddress" IS NULL AND "userId" IS NOT NULL;

-- For participants without userId, we can't set walletAddress automatically
-- They will need to be updated manually or via the scan function

-- Make walletAddress NOT NULL after setting values
-- Note: This might fail if there are participants without walletAddress
-- In that case, you'll need to handle them manually
ALTER TABLE "presale_participants" ALTER COLUMN "walletAddress" SET NOT NULL;

