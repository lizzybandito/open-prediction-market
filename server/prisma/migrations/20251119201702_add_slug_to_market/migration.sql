-- AlterTable
ALTER TABLE "markets" ADD COLUMN "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "markets_slug_key" ON "markets"("slug");

-- CreateIndex
CREATE INDEX "markets_slug_idx" ON "markets"("slug");

