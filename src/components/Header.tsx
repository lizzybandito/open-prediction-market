import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "./ui/button";
import { TrendingUp, Settings, Menu, Github } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentUser } from "@/hooks/use-auth";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";

const GITHUB_URL = "https://github.com/open-prediction-market/predictd";



export const Header = () => {
  const { isSignedIn, signOut } = useAuth();
  const { data: currentUser } = useCurrentUser();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userIsAdmin = isSignedIn && currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'admin');

  const handleSignOut = () => {
    signOut();
    navigate("/");
    setMobileMenuOpen(false);
  };

  const NavLinks = () => (
    <>
      <Link
        to="/"
        className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
        onClick={() => setMobileMenuOpen(false)}
      >
        Markets
      </Link>
      <Link
        to="/activity"
        className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
        onClick={() => setMobileMenuOpen(false)}
      >
        Activity
      </Link>
      <Link
        to="/leaderboard"
        className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
        onClick={() => setMobileMenuOpen(false)}
      >
        Leaderboard
      </Link>
      <Link
        to="/ai-race"
        className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
        onClick={() => setMobileMenuOpen(false)}
      >
        AI Race
      </Link>
      <Link
        to="/tokenomics"
        className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
        onClick={() => setMobileMenuOpen(false)}
      >
        Tokenomics
      </Link>
      <Link
        to="/how-it-works"
        className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
        onClick={() => setMobileMenuOpen(false)}
      >
        How it Works
      </Link>
      {isSignedIn && (
        <Link
          to="/my-predictions"
          className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
          onClick={() => setMobileMenuOpen(false)}
        >
          My Predictions
        </Link>
      )}
      {userIsAdmin && (
        <Link
          to="/admin"
          className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors flex items-center gap-1"
          onClick={() => setMobileMenuOpen(false)}
        >
          <Settings className="h-4 w-4" />
          Admin
        </Link>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 md:h-16 items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex items-center gap-2 font-bold text-lg md:text-xl">
            <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              OpenPredictionMarket
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <NavLinks />
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          {/* GitHub link */}
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-md border border-border/60 bg-background hover:bg-muted hover:border-primary/40 transition-all duration-200 text-foreground/80 hover:text-foreground"
            title="View source on GitHub"
          >
            <Github className="h-4 w-4" />
            <span>GitHub</span>
          </a>
          <ThemeToggle />
          <div className="hidden md:flex items-center gap-2">
            {isSignedIn && (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/wallet">Wallet</Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/profile">Profile</Link>
                </Button>
              </>
            )}
            {isSignedIn ? (
              <Button size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            ) : (
              <Button size="sm" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[300px]">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-4">
                <NavLinks />
                <div className="pt-4 border-t border-border space-y-3">
                  <a
                    href={GITHUB_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-md border border-border/60 bg-background hover:bg-muted transition-all duration-200 text-sm font-medium text-foreground/80 hover:text-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Github className="h-4 w-4" />
                    View on GitHub (Open Source)
                  </a>
                  {isSignedIn && (
                    <>
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link to="/wallet" onClick={() => setMobileMenuOpen(false)}>Wallet</Link>
                      </Button>
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>Profile</Link>
                      </Button>
                    </>
                  )}
                  {isSignedIn ? (
                    <Button className="w-full" onClick={handleSignOut}>
                      Sign Out
                    </Button>
                  ) : (
                    <Button className="w-full" asChild>
                      <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
