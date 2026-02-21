import { Button } from "./ui/button";
import { TrendingUp, Users, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden py-10 md:py-20">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
      
      <div className="container relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-4 text-3xl md:text-5xl font-bold tracking-tight">
            Bet on{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-success bg-clip-text text-transparent">
              Anything
            </span>
          </h1>
          <p className="mb-6 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Trade on the world's largest prediction market. Make informed decisions on politics, crypto, sports, and more.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <Button size="sm" className="px-5 py-2 text-sm bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-[var(--shadow-glow)] transition-all">
              Start Trading
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="px-5 py-2 text-sm border-border hover:bg-secondary"
              asChild
            >
              <Link to="/learn">Learn How</Link>
            </Button>
          </div>

          <div className="hidden sm:grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="flex flex-col items-center gap-1.5 p-4 rounded-lg bg-card/50 border border-border/50">
              <TrendingUp className="h-8 w-8 text-primary mb-2" />
              <div className="text-2xl font-bold">$2.5B+</div>
              <div className="text-sm text-muted-foreground">Total Volume</div>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-4 rounded-lg bg-card/50 border border-border/50">
              <Users className="h-8 w-8 text-accent mb-2" />
              <div className="text-2xl font-bold">500K+</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-4 rounded-lg bg-card/50 border border-border/50">
              <DollarSign className="h-8 w-8 text-success mb-2" />
              <div className="text-2xl font-bold">10K+</div>
              <div className="text-sm text-muted-foreground">Markets</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
