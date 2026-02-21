
import { useState, useEffect } from "react";
import { Copy, Check, Info } from "lucide-react";
import { toast } from "sonner";

export const CABelt = () => {
    const [copied, setCopied] = useState(false);
    const ca = "0x0000000000000000000000000000000000000000"; // Placeholder CA

    const handleCopy = () => {
        navigator.clipboard.writeText(ca);
        setCopied(true);
        toast.success("Contract Address copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="w-full bg-secondary/30 border-y border-border py-2 overflow-hidden relative group">
            <div className="flex items-center">
                {/* Marquee effect wrapper */}
                <div className="flex animate-market-card-marquee whitespace-nowrap min-w-full">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 px-8">
                            <span className="text-xs font-mono font-bold text-muted-foreground/60 uppercase tracking-widest">
                                Contract Address:
                            </span>
                            <span className="text-sm font-mono font-bold text-primary tracking-wider">
                                {ca}
                            </span>
                            <span className="text-xs text-muted-foreground/30">•</span>
                        </div>
                    ))}
                </div>

                {/* Static Copy Button overlay (optional, but let's make it look nice) */}
                <div className="absolute right-0 top-0 bottom-0 flex items-center px-4 bg-gradient-to-l from-background via-background/80 to-transparent pointer-events-none md:pointer-events-auto">
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all pointer-events-auto"
                    >
                        {copied ? (
                            <Check className="h-3 w-3" />
                        ) : (
                            <Copy className="h-3 w-3" />
                        )}
                        {copied ? "COPIED" : "COPY CA"}
                    </button>
                </div>

                {/* Info tag at start */}
                <div className="absolute left-0 top-0 bottom-0 flex items-center px-4 bg-gradient-to-r from-background via-background/80 to-transparent pointer-events-none">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-muted/50 border border-border/50 text-[10px] font-bold text-muted-foreground uppercase tracking-tighter shadow-sm pointer-events-auto">
                        <Info className="h-2.5 w-2.5" />
                        Official
                    </div>
                </div>
            </div>
        </div>
    );
};
