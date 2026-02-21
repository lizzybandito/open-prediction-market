
import { Link } from "react-router-dom";
import { Badge } from "./ui/badge";
import { TrendingUp, Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { useSavedMarkets, useToggleSaveMarket } from "@/hooks/use-profile";
import { useMemo, useRef, useState, useEffect } from "react";
import { getMarketUrl } from "@/utils/marketUrl";

interface MarketCardProps {
  id: string;
  slug?: string;
  title: string;
  category: string;
  image: string;
  yesPrice: number;
  noPrice: number;
  volume: string;
  endDate: string;
  isMultiOutcome?: boolean;
  topOptions?: Array<{
    label: string;
    volume: number;
    yesPriceCents?: number;
    noPriceCents?: number;
  }>;
}

export const MarketCard = ({
  id,
  slug,
  title,
  category,
  image,
  yesPrice,
  noPrice,
  volume,
  endDate,
  isMultiOutcome = false,
  topOptions = [],
}: MarketCardProps) => {
  const { data: saved, isLoading: savedLoading } = useSavedMarkets();
  const toggleSave = useToggleSaveMarket();
  const isSaved = useMemo(() => !!saved?.find((s) => s.marketId === id), [saved, id]);

  const onToggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSave.mutate({ marketId: id, isSaved });
  };

  // For multi-outcome markets, show the top options; otherwise we still render
  // a belt-style layout for simple YES/NO markets.
  const multiOutcomeOptions =
    isMultiOutcome && Array.isArray(topOptions) && topOptions.length > 0
      ? topOptions.map((opt) => ({
        label: opt.label,
        yesPrice: typeof opt.yesPriceCents === "number" ? opt.yesPriceCents : undefined,
        noPrice: typeof opt.noPriceCents === "number" ? opt.noPriceCents : undefined,
      }))
      : [];

  const formatOptionPrice = (price?: number) => {
    if (typeof price === "number" && !Number.isNaN(price)) {
      return `${price.toFixed(2)}¢`;
    }
    return "—";
  };

  const formatVolume = (value?: number) => {
    if (value === undefined) return null;
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return value.toFixed(0);
  };

  // For binary YES/NO markets, create options array
  const binaryOptions = !isMultiOutcome
    ? [
      { label: "Yes", yesPrice, noPrice: undefined },
      { label: "No", yesPrice: undefined, noPrice },
    ]
    : [];

  const isBinaryMarket = !isMultiOutcome;
  // Only scroll for multi-outcome markets with more than 2 options.
  // Binary markets only have Yes/No — no point scrolling 2 items.
  const shouldAutoScroll = isMultiOutcome && multiOutcomeOptions.length > 2;

  // Duplicate options for seamless looping scroll (multi-outcome only)
  const marqueeOptions = shouldAutoScroll
    ? [...multiOutcomeOptions, ...multiOutcomeOptions]
    : isMultiOutcome
      ? multiOutcomeOptions
      : binaryOptions;

  const marqueeContainerRef = useRef<HTMLDivElement | null>(null);
  const [isHoveringMarquee, setIsHoveringMarquee] = useState(false);
  const isDraggingRef = useRef(false);
  const dragStart = useRef({ x: 0, scrollLeft: 0 });

  useEffect(() => {
    if (!shouldAutoScroll || !marqueeContainerRef.current) return;

    const container = marqueeContainerRef.current;
    let animationId: number | null = null;
    let lastTimestamp: number | null = null;
    const pixelsPerSecond = 45;

    const step = (timestamp: number) => {
      if (!container) return;
      if (lastTimestamp === null) {
        lastTimestamp = timestamp;
      }
      const delta = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      if (!isHoveringMarquee && !isDraggingRef.current) {
        const distance = (pixelsPerSecond * delta) / 1000;
        container.scrollLeft += distance;
        const resetThreshold = container.scrollWidth / 2;
        if (container.scrollLeft >= resetThreshold) {
          container.scrollLeft -= resetThreshold;
        }
      }

      animationId = requestAnimationFrame(step);
    };

    animationId = requestAnimationFrame(step);

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [shouldAutoScroll, isHoveringMarquee, marqueeOptions.length]);

  useEffect(() => {
    if (!shouldAutoScroll || !marqueeContainerRef.current) return;
    marqueeContainerRef.current.scrollLeft = 0;
  }, [shouldAutoScroll, marqueeOptions.length]);

  return (
    <Link to={getMarketUrl({ id, slug })} className="group">
      <div className="relative overflow-hidden rounded-lg md:rounded-xl border border-border bg-card p-4 md:p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
        <div className="mb-3 md:mb-4 flex items-start justify-between gap-2 md:gap-3">
          <img
            src={image}
            alt={title}
            className="h-10 w-10 md:h-12 md:w-12 rounded-lg object-cover border border-border bg-secondary flex-shrink-0"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg";
            }}
          />
          <div className="flex items-center gap-1.5 md:gap-2">
            <Badge variant="secondary" className="text-[10px] md:text-xs">
              {category}
            </Badge>
            <TrendingUp className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </div>

        <h3 className="mb-4 md:mb-6 text-base md:text-lg font-semibold leading-tight group-hover:text-primary transition-colors line-clamp-2 h-[48px] md:h-[56px] min-h-[48px] md:min-h-[56px] max-h-[48px] md:max-h-[56px] overflow-hidden">
          {title}
        </h3>

        <div className="mb-3 md:mb-4">
          {/* Binary YES/NO market: animated 2-column layout */}
          {isBinaryMarket && binaryOptions.length > 0 ? (
            <div className="flex gap-2 md:gap-3 w-full">
              {binaryOptions.map((option, index) => (
                <div
                  key={`${option.label}-${index}`}
                  className="flex-1 flex flex-col gap-2"
                >
                  {/* Label bar: title scrolls for Yes, static for No */}
                  <div className="rounded-lg border border-border bg-secondary/40 p-2 h-[40px] md:h-[44px] flex items-center justify-start overflow-hidden">
                    {option.label === "Yes" ? (
                      <span className="binary-label-scroll text-[10px] md:text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        {title}
                      </span>
                    ) : (
                      <div className="text-center text-[10px] md:text-xs font-semibold tracking-wide text-muted-foreground uppercase w-full">
                        No
                      </div>
                    )}
                  </div>
                  {/* Price box: pulsing glow for live feel */}
                  <div className={`rounded-lg border px-2 py-1.5 text-center h-[60px] md:h-[68px] flex flex-col justify-center overflow-hidden ${option.label === "Yes"
                      ? "border-success/40 bg-success/10 price-pulse-yes"
                      : "border-danger/40 bg-danger/10 price-pulse-no"
                    }`}>
                    <div className={`text-[9px] uppercase tracking-wide font-semibold mb-1 ${option.label === "Yes" ? "text-success/80" : "text-danger/80"}`}>
                      {option.label}
                    </div>
                    <div className={`text-sm md:text-base font-bold truncate ${option.label === "Yes" ? "text-success" : "text-danger"}`}>
                      {formatOptionPrice(option.yesPrice ?? option.noPrice)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (isMultiOutcome && multiOutcomeOptions.length > 0) ? (
            <div
              ref={marqueeContainerRef}
              className={`relative w-full ${shouldAutoScroll
                ? "overflow-x-auto md:overflow-hidden cursor-grab active:cursor-grabbing hide-scrollbar"
                : "overflow-x-auto hide-scrollbar"
                }`}
              onMouseEnter={() => shouldAutoScroll && setIsHoveringMarquee(true)}
              onMouseLeave={() => {
                if (!isDraggingRef.current) {
                  setIsHoveringMarquee(false);
                }
              }}
              onMouseDown={(e) => {
                if (!shouldAutoScroll || !marqueeContainerRef.current) return;
                isDraggingRef.current = true;
                dragStart.current = {
                  x: e.clientX,
                  scrollLeft: marqueeContainerRef.current.scrollLeft,
                };
              }}
              onMouseMove={(e) => {
                if (!isDraggingRef.current || !marqueeContainerRef.current) return;
                const delta = e.clientX - dragStart.current.x;
                marqueeContainerRef.current.scrollLeft = dragStart.current.scrollLeft - delta;
              }}
              onMouseUp={() => {
                isDraggingRef.current = false;
                setIsHoveringMarquee(false);
              }}
              onTouchStart={(e) => {
                if (!marqueeContainerRef.current) return;
                const touch = e.touches[0];
                isDraggingRef.current = true;
                setIsHoveringMarquee(true);
                dragStart.current = {
                  x: touch.clientX,
                  scrollLeft: marqueeContainerRef.current.scrollLeft,
                };
              }}
              onTouchMove={(e) => {
                if (!isDraggingRef.current || !marqueeContainerRef.current) return;
                const touch = e.touches[0];
                const delta = touch.clientX - dragStart.current.x;
                marqueeContainerRef.current.scrollLeft = dragStart.current.scrollLeft - delta;
              }}
              onTouchEnd={() => {
                isDraggingRef.current = false;
                setIsHoveringMarquee(false);
              }}
              onTouchCancel={() => {
                isDraggingRef.current = false;
                setIsHoveringMarquee(false);
              }}
            >
              <div
                className={`flex flex-nowrap gap-2 md:gap-3 ${shouldAutoScroll ? "w-max" : "w-full"}`}
              >
                {marqueeOptions.map((option, index) => (
                  <button
                    key={`${option.label}-${index}`}
                    type="button"
                    className="flex flex-col gap-2 text-left flex-shrink-0 min-w-[170px] md:min-w-[210px] h-[120px] md:h-[136px] min-h-[120px] md:min-h-[136px] max-h-[120px] md:max-h-[136px] overflow-hidden"
                  >
                    <div className="rounded-lg border border-border bg-secondary/40 p-2 h-[40px] md:h-[44px] min-h-[40px] md:min-h-[44px] max-h-[40px] md:max-h-[44px] flex items-center justify-center overflow-hidden">
                      <div className="line-clamp-1 text-center text-[10px] md:text-xs font-semibold tracking-wide text-muted-foreground uppercase w-full overflow-hidden text-ellipsis">
                        {option.label}
                      </div>
                    </div>
                    {isMultiOutcome ? (
                      <div className="grid grid-cols-2 gap-1.5 h-[60px] md:h-[68px] min-h-[60px] md:min-h-[68px] max-h-[60px] md:max-h-[68px] overflow-hidden">
                        <div className="rounded-lg border border-success/40 bg-success/10 px-2 py-1.5 text-center flex flex-col justify-center h-full overflow-hidden">
                          <div className="text-[9px] text-success/80 uppercase tracking-wide">Yes</div>
                          <div className="text-sm md:text-base font-semibold text-success truncate">
                            {formatOptionPrice(option.yesPrice)}
                          </div>
                        </div>
                        <div className="rounded-lg border border-danger/40 bg-danger/10 px-2 py-1.5 text-center flex flex-col justify-center h-full overflow-hidden">
                          <div className="text-[9px] text-danger/80 uppercase tracking-wide">No</div>
                          <div className="text-sm md:text-base font-semibold text-danger truncate">
                            {formatOptionPrice(option.noPrice)}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className={`rounded-lg border px-2 py-1.5 text-center h-[60px] md:h-[68px] min-h-[60px] md:min-h-[68px] max-h-[60px] md:max-h-[68px] flex flex-col justify-center overflow-hidden ${option.label === "Yes"
                        ? "border-success/40 bg-success/10"
                        : "border-danger/40 bg-danger/10"
                        }`}>
                        <div className={`text-[9px] uppercase tracking-wide ${option.label === "Yes"
                          ? "text-success/80"
                          : "text-danger/80"
                          }`}>
                          Price
                        </div>
                        <div className={`text-sm md:text-base font-semibold truncate ${option.label === "Yes" ? "text-success" : "text-danger"
                          }`}>
                          {formatOptionPrice(option.yesPrice ?? option.noPrice)}
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between text-xs md:text-sm text-muted-foreground">
          <span className="truncate mr-2">{volume} volume</span>
          <button
            onClick={onToggleSave}
            aria-label={isSaved ? "Unsave market" : "Save market"}
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
          >
            {toggleSave.isPending || savedLoading ? (
              <Loader2 className="h-3.5 w-3.5 md:h-4 md:w-4 animate-spin" />
            ) : isSaved ? (
              <BookmarkCheck className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
            ) : (
              <Bookmark className="h-3.5 w-3.5 md:h-4 md:w-4" />
            )}
          </button>
        </div>
      </div>
    </Link>
  );
};
