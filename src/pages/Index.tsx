import { useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { MarketCard } from "@/components/MarketCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Input } from "@/components/ui/input";
import { Search, X, Loader2, Github, ExternalLink } from "lucide-react";
import { useMarkets } from "@/hooks/use-markets";
import { useDebounce } from "@/hooks/useDebounce";
import { CABelt } from "@/components/CABelt";

const GITHUB_URL = "https://github.com/lizzybandito/open-prediction-market";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Build API filters
  const filters = {
    category: selectedCategory !== "All" ? selectedCategory : undefined,
    search: debouncedSearchQuery.trim() || undefined,
    status: "active" as const,
    limit: 100, // Get more results for search (can be paginated later)
    sortBy: "volume" as const,
    sortOrder: "desc" as const,
  };

  const { data, isLoading, error } = useMarkets(filters);
  const markets = data?.data || [];
  const sortedMarkets = useMemo(() => {
    if (!markets.length) return markets;

    const getVolumeValue = (market: (typeof markets)[number]): number => {
      if (typeof market.volumeNumber === "number" && !Number.isNaN(market.volumeNumber)) {
        return market.volumeNumber;
      }

      const parsed = parseFloat(String(market.volume ?? "").replace(/[^0-9.]/g, ""));
      return Number.isNaN(parsed) ? 0 : parsed;
    };

    return [...markets].sort((a, b) => getVolumeValue(b) - getVolumeValue(a));
  }, [markets]);
  const totalResults = data?.pagination?.total || 0;

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />

      {/* Open Source Banner */}
      {!bannerDismissed && (
        <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-y border-primary/20">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 animate-pulse" />
          <div className="container relative px-4 md:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">Open Source</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-border" />
              <p className="text-sm font-medium text-foreground/90">
                🌍 <span className="font-bold">World's first 100% open-source prediction market.</span>
                {" "}No black boxes. Full transparency. Community owned.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-foreground text-background hover:opacity-90 transition-all duration-200 shadow-sm"
              >
                <Github className="h-3.5 w-3.5" />
                Star on GitHub
                <ExternalLink className="h-3 w-3 opacity-70" />
              </a>
              <button
                onClick={() => setBannerDismissed(true)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Dismiss banner"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="container py-4 md:py-10 px-4 md:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
          <h2 className="text-xl md:text-3xl font-bold">Trending Markets</h2>
          <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
        </div>

        {/* Advanced Search Bar */}
        <div className="relative mb-4 md:mb-6 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search markets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 md:pl-10 pr-9 md:pr-10 h-10 md:h-12 text-sm md:text-base"
            />
            {isLoading && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-muted-foreground animate-spin" />
            )}
            {searchQuery && !isLoading && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="h-4 w-4 md:h-5 md:w-5" />
              </button>
            )}
          </div>
          {(debouncedSearchQuery || selectedCategory !== "All") && (
            <div className="mt-2 text-xs md:text-sm text-muted-foreground">
              {isLoading ? (
                "Searching..."
              ) : (
                <>
                  {totalResults} {totalResults === 1 ? "market" : "markets"} found
                  {debouncedSearchQuery && ` for "${debouncedSearchQuery}"`}
                  {selectedCategory !== "All" && ` in ${selectedCategory}`}
                </>
              )}
            </div>
          )}
        </div>

        <CABelt />

        {error && (
          <div className="mb-4 md:mb-6 p-3 md:p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            <p>Failed to load markets. Please try again.</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {isLoading && markets.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
              <p className="text-muted-foreground">Loading markets...</p>
            </div>
          ) : sortedMarkets.length > 0 ? (
            sortedMarkets.map((market) => (
              <MarketCard key={market.id} {...market} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-lg text-muted-foreground">
                No markets found matching your search criteria.
              </p>
              {(searchQuery || selectedCategory !== "All") && (
                <button
                  onClick={() => {
                    clearSearch();
                    setSelectedCategory("All");
                  }}
                  className="mt-4 text-primary hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;
