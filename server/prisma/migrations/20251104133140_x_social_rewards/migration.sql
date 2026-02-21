-- CreateTable
CREATE TABLE "x_accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "xUserId" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "verifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountCreatedAt" TIMESTAMP(3),
    "followers" INTEGER DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'VERIFIED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "x_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "x_posts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "xUserId" TEXT NOT NULL,
    "tweetId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "textHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tweetCreatedAt" TIMESTAMP(3),
    "fetchedAt" TIMESTAMP(3),
    "metricsJson" JSONB,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reason" TEXT,
    "campaignCode" TEXT,
    "seasonId" TEXT,

    CONSTRAINT "x_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "engagement_awards" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'x',
    "xPostId" TEXT,
    "points" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PROVISIONAL',
    "provisionalAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finalizedAt" TIMESTAMP(3),
    "detailsJson" JSONB,
    "seasonId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "engagement_awards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "x_accounts_userId_key" ON "x_accounts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "x_accounts_xUserId_key" ON "x_accounts"("xUserId");

-- CreateIndex
CREATE INDEX "x_accounts_walletAddress_idx" ON "x_accounts"("walletAddress");

-- CreateIndex
CREATE INDEX "x_accounts_handle_idx" ON "x_accounts"("handle");

-- CreateIndex
CREATE UNIQUE INDEX "x_posts_tweetId_key" ON "x_posts"("tweetId");

-- CreateIndex
CREATE INDEX "x_posts_userId_idx" ON "x_posts"("userId");

-- CreateIndex
CREATE INDEX "x_posts_xUserId_idx" ON "x_posts"("xUserId");

-- CreateIndex
CREATE INDEX "x_posts_status_idx" ON "x_posts"("status");

-- CreateIndex
CREATE INDEX "x_posts_seasonId_idx" ON "x_posts"("seasonId");

-- CreateIndex
CREATE INDEX "engagement_awards_userId_idx" ON "engagement_awards"("userId");

-- CreateIndex
CREATE INDEX "engagement_awards_source_idx" ON "engagement_awards"("source");

-- CreateIndex
CREATE INDEX "engagement_awards_status_idx" ON "engagement_awards"("status");

-- CreateIndex
CREATE INDEX "engagement_awards_seasonId_idx" ON "engagement_awards"("seasonId");

-- AddForeignKey
ALTER TABLE "x_accounts" ADD CONSTRAINT "x_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "x_posts" ADD CONSTRAINT "x_posts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engagement_awards" ADD CONSTRAINT "engagement_awards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
