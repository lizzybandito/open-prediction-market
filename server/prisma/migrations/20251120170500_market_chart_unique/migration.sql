ALTER TABLE "market_chart_data"
ADD CONSTRAINT "market_chart_data_marketId_timestamp_key"
UNIQUE ("marketId", "timestamp");

