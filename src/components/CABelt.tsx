import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

export const CABelt = () => {
    const [copied, setCopied] = useState(false);
    const placeholderCA = "0x8920...248b"; // Placeholder CA address

    const handleCopy = () => {
        navigator.clipboard.writeText(placeholderCA);
        setCopied(true);
        toast.success("Contract Address copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative w-full bg-secondary/50 border-y border-border py-2 overflow-hidden select-none">
            <div className="flex whitespace-nowrap animate-market-card-marquee hover:market-card-marquee-paused items-center">
                {/* Repeating CA blocks to create the seamless loop */}
                {[...Array(12)].map((_, i) => (
                    <div key={i} className="flex items-center mx-8">
                        <span className="text-xs font-mono font-medium text-muted-foreground mr-2">CA:</span>
                        <span className="text-xs font-mono font-bold text-foreground bg-background/50 px-2 py-0.5 rounded border border-border/50">
                            {placeholderCA}
                        </span>
                    </div>
                ))}
            </div>

            {/* Floating Copy Button (Fixed position relative to the belt container) */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full shadow-lg hover:scale-105 transition-all active:scale-95"
                >
                    {copied ? (
                        <Check className="h-3 w-3" />
                    ) : (
                        <Copy className="h-3 w-3" />
                    )}
                    CA
                </button>
            </div>
        </div>
    );
};
