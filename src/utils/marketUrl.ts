/**
 * Generate a market URL using slug if available, otherwise fallback to ID
 */
export function getMarketUrl(market: { id: string; slug?: string } | string): string {
  if (typeof market === "string") {
    // If it's just a string (ID), use it directly
    return `/market/${market}`;
  }
  
  // Prefer slug if available, otherwise use ID
  return `/market/${market.slug || market.id}`;
}

