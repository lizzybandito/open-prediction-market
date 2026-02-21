import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, TrendingUp, Wallet, Trophy, Coins, HelpCircle, ArrowRight, Target, Users, DollarSign, CheckCircle2, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const Learn = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-24 border-b">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="container relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <h1 className="mb-4 text-4xl md:text-5xl font-bold tracking-tight">
              OpenPredictionMarket{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-success bg-clip-text text-transparent">
                Academy
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Master prediction markets. Learn, trade, and win.
            </p>
          </div>
        </div>
      </section>

      <div className="container py-12">
        {/* Quick Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          <Link to="#getting-started" className="block">
            <Card className="hover:border-primary transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Getting Started</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  New to prediction markets? Start here to learn the basics
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link to="#how-it-works" className="block">
            <Card className="hover:border-primary transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <TrendingUp className="h-5 w-5 text-accent" />
                  </div>
                  <CardTitle className="text-lg">How It Works</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Understand prediction markets, trading, and market mechanics
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link to="#trading-guide" className="block">
            <Card className="hover:border-primary transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success/10">
                    <DollarSign className="h-5 w-5 text-success" />
                  </div>
                  <CardTitle className="text-lg">Trading Guide</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Learn how to place bets, manage positions, and cash out
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link to="#wallet-auth" className="block">
            <Card className="hover:border-primary transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Wallet className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Wallet & Auth</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Connect your wallet or use email authentication
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link to="#rewards" className="block">
            <Card className="hover:border-primary transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Trophy className="h-5 w-5 text-accent" />
                  </div>
                  <CardTitle className="text-lg">Rewards & Tokenomics</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Earn PRED tokens through trading, accuracy, and engagement
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link to="#faq" className="block">
            <Card className="hover:border-primary transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success/10">
                    <HelpCircle className="h-5 w-5 text-success" />
                  </div>
                  <CardTitle className="text-lg">FAQ</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Common questions and troubleshooting tips
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Getting Started Section */}
        <section id="getting-started" className="mb-16 scroll-mt-24">
          <div className="flex items-center gap-3 mb-8">
            <Target className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold">Getting Started</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>What is OpenPredictionMarket?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  OpenPredictionMarket is a prediction market platform where you can trade on the outcome of real-world events.
                  Bet on politics, crypto, sports, entertainment, and more by buying YES or NO shares.
                </p>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-primary mb-1">Key Features</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Real-time trading on binary markets</li>
                      <li>• Multiple authentication methods</li>
                      <li>• Wallet integration (Solana)</li>
                      <li>• AI agent predictions</li>
                      <li>• Token rewards and leaderboards</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Start Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-semibold mt-0.5">
                      1
                    </div>
                    <div>
                      <p className="font-medium">Sign Up or Connect Wallet</p>
                      <p className="text-sm text-muted-foreground">
                        Create an account with email/password or connect your Solana wallet
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-semibold mt-0.5">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Get Your Starting Points</p>
                      <p className="text-sm text-muted-foreground">
                        Receive 1,000 imaginary points to start betting (non-transferable, prevents cheating)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-semibold mt-0.5">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Browse Markets</p>
                      <p className="text-sm text-muted-foreground">
                        Explore active markets by category or search for specific events
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-semibold mt-0.5">
                      4
                    </div>
                    <div>
                      <p className="font-medium">Start Trading</p>
                      <p className="text-sm text-muted-foreground">
                        Place bets on outcomes and build your prediction portfolio
                      </p>
                    </div>
                  </div>
                </div>
                <Button asChild className="w-full mt-4">
                  <Link to="/auth">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="mb-16 scroll-mt-24">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="h-6 w-6 text-accent" />
            <h2 className="text-3xl font-bold">How Prediction Markets Work</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Understanding Markets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Every market has a question with two possible outcomes: <strong>YES</strong> or <strong>NO</strong>.
                  When a market is created, both sides start at 50¢ (50% probability).
                </p>
                <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                  <p className="text-sm font-medium mb-2">Example Market:</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    "Will Bitcoin reach $100K by Dec 2025?"
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded bg-green-500/10 border border-green-500/20">
                      <p className="text-xs font-medium text-green-600 dark:text-green-400">YES: 50¢</p>
                    </div>
                    <div className="p-2 rounded bg-red-500/10 border border-red-500/20">
                      <p className="text-xs font-medium text-red-600 dark:text-red-400">NO: 50¢</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Price Dynamics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Prices change based on supply and demand. As more people bet on YES, the YES price increases
                  and NO decreases (they always add up to $1.00).
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span>YES + NO = $1.00 (always)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span>Higher price = Higher probability</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span>Prices update in real-time</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Market Lifecycle</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-lg bg-card border">
                    <div className="text-2xl font-bold text-primary mb-2">1</div>
                    <p className="font-medium mb-1">Creation</p>
                    <p className="text-xs text-muted-foreground">
                      Admin creates market with question and end date
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-card border">
                    <div className="text-2xl font-bold text-accent mb-2">2</div>
                    <p className="font-medium mb-1">Trading</p>
                    <p className="text-xs text-muted-foreground">
                      Users buy/sell YES or NO shares
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-card border">
                    <div className="text-2xl font-bold text-success mb-2">3</div>
                    <p className="font-medium mb-1">Resolution</p>
                    <p className="text-xs text-muted-foreground">
                      Admin resolves market when event occurs
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-card border">
                    <div className="text-2xl font-bold text-primary mb-2">4</div>
                    <p className="font-medium mb-1">Settlement</p>
                    <p className="text-xs text-muted-foreground">
                      Winners receive automatic payouts
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Trading Guide Section */}
        <section id="trading-guide" className="mb-16 scroll-mt-24">
          <div className="flex items-center gap-3 mb-8">
            <DollarSign className="h-6 w-6 text-success" />
            <h2 className="text-3xl font-bold">Trading Guide</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Placing Bets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Choose Your Position</p>
                      <p className="text-sm text-muted-foreground">
                        Select YES or NO based on your prediction
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Enter Amount</p>
                      <p className="text-sm text-muted-foreground">
                        Minimum bet is $5.00. Enter how much you want to bet
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Review & Confirm</p>
                      <p className="text-sm text-muted-foreground">
                        Check shares you'll receive and confirm the order
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Managing Positions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Track your positions in the "My Predictions" page. You can:
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span className="text-sm">View active positions and P&L</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span className="text-sm">Cash out early (realize profit or limit losses)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span className="text-sm">Monitor market price changes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span className="text-sm">Hold positions on both YES and NO sides</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cash Out Early</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  You don't have to wait for market resolution! Sell your shares early at current market prices
                  to lock in profits or limit losses.
                </p>
                <div className="p-4 rounded-lg bg-success/5 border border-success/20">
                  <p className="text-sm font-medium text-success mb-2">Example:</p>
                  <p className="text-xs text-muted-foreground">
                    You bought YES shares at 30¢. Market price is now 70¢.
                    You can cash out and realize your profit without waiting for resolution.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Understanding Returns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-card border">
                    <p className="text-sm font-medium mb-1">If your side wins:</p>
                    <p className="text-xs text-muted-foreground">
                      You receive $1.00 per share. Your profit = ($1.00 - purchase price) × shares
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-card border">
                    <p className="text-sm font-medium mb-1">If your side loses:</p>
                    <p className="text-xs text-muted-foreground">
                      Your shares are worth $0.00. Your loss = purchase price × shares
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-card border">
                    <p className="text-sm font-medium mb-1">Early cash out:</p>
                    <p className="text-xs text-muted-foreground">
                      Receive current market price × shares. Profit/loss = (current price - purchase price) × shares
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Wallet & Auth Section */}
        <section id="wallet-auth" className="mb-16 scroll-mt-24">
          <div className="flex items-center gap-3 mb-8">
            <Wallet className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold">Wallet & Authentication</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Wallet Authentication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Connect your Solana wallet (Phantom, Solflare, Coinbase, Trust, Nightly, and more)
                  to sign up instantly. No email or password required!
                </p>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Supported Wallets:</p>
                  <div className="flex flex-wrap gap-2">
                    {["Phantom", "Solflare", "Coinbase", "Trust", "Nightly"].map((wallet) => (
                      <span key={wallet} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        {wallet}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm font-medium mb-1">Mobile Wallets</p>
                  <p className="text-xs text-muted-foreground">
                    Use WalletConnect to connect mobile wallets via QR code scanning
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Email Authentication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Traditional signup with email and password. Perfect if you prefer not to use a wallet initially.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span>Real-time email validation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span>Username availability checking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span>You can connect a wallet later</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Wallet Operations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-card border">
                    <p className="font-medium mb-2">Deposits</p>
                    <p className="text-sm text-muted-foreground">
                      Add SOL to your account balance to start trading. Deposits are verified on-chain
                      for security.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-card border">
                    <p className="font-medium mb-2">Withdrawals</p>
                    <p className="text-sm text-muted-foreground">
                      Withdraw your winnings or unused balance back to your connected wallet.
                      Withdrawals are executed on-chain.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Rewards & Tokenomics Section */}
        <section id="rewards" className="mb-16 scroll-mt-24">
          <div className="flex items-center gap-3 mb-8">
            <Trophy className="h-6 w-6 text-accent" />
            <h2 className="text-3xl font-bold">Rewards & Tokenomics</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-accent" />
                  Points System & Token Rewards
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Start with imaginary points (non-transferable) to prevent cheating. At season end,
                  convert your points to PRED tokens with performance multipliers.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span className="text-sm">1,000 starting points</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span className="text-sm">Bet with points (points are non-transferable)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span className="text-sm">Presale opens during season → Buy tokens with SOL</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span className="text-sm">Season end: Convert points → tokens with multipliers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span className="text-sm">After season: Bet with real tokens & SOL</span>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-accent/5 border border-accent/20 mt-4">
                  <p className="text-sm font-medium mb-2">Why Points?</p>
                  <p className="text-xs text-muted-foreground">
                    Points are imaginary and non-transferable, preventing cheating, token transfers,
                    and multiple claims. Fair distribution for everyone!
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Season System & Points Conversion
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Compete in seasons using points. At season end, convert your points to PRED tokens
                  with multipliers based on your performance.
                </p>
                <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                  <p className="text-sm font-medium mb-2">Points → Tokens Conversion:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Base: 1 point = 0.1 token</li>
                    <li>• Accuracy multiplier: Up to 2.0x (70%+ accuracy)</li>
                    <li>• Volume multiplier: Up to 1.5x (high volume traders)</li>
                    <li>• Rank multiplier: Top 10 get 1.5x, top 20% get 1.2x</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 mt-2">
                  <p className="text-sm font-medium mb-2">Season Flow:</p>
                  <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Start season with 1,000 points</li>
                    <li>Bet with points (non-transferable)</li>
                    <li>Presale opens during season → Buy tokens with SOL</li>
                    <li>Season ends → Convert points to tokens with multipliers</li>
                    <li>After season → Bet with tokens & SOL</li>
                  </ol>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daily Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Earn tokens every day you trade, with multipliers based on your activity:
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span>Base reward:</span>
                    <span className="font-medium">0.1% of bet amount</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Betting multiplier:</span>
                    <span className="font-medium">1.0x to 2.0x</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Diversity bonus:</span>
                    <span className="font-medium">Up to 50 tokens</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="font-medium">Daily cap:</span>
                    <span className="font-medium text-accent">1,000 tokens max</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Leaderboard Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Fair distribution - everyone benefits, top performers get more:
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span>1st Place:</span>
                    <span className="font-medium text-accent">5% of prize pool</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>2nd-10th:</span>
                    <span className="font-medium">2-4% each (30% total)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Top 20%:</span>
                    <span className="font-medium">40% shared proportionally</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Top 50%:</span>
                    <span className="font-medium">25% shared proportionally</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span>Everyone:</span>
                    <span className="font-medium">5% equal distribution</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Referral System
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Refer friends and earn bonuses from their activity. Both you and your referrals benefit!
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span className="text-sm">Get unique referral code on signup</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span className="text-sm">Season bonus: Earn 10% of referee's season rewards</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span className="text-sm">Presale bonus: Earn 50% of referee's presale bonus</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span className="text-sm">Track referrals and bonuses in dashboard</span>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 mt-4">
                  <p className="text-sm font-medium mb-2">Example:</p>
                  <p className="text-xs text-muted-foreground">
                    Your referral earns 1,000 tokens from season → You get 100 tokens.
                    Your referral gets 20K presale bonus → You get 10K tokens.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="mb-16 scroll-mt-24">
          <div className="flex items-center gap-3 mb-8">
            <HelpCircle className="h-6 w-6 text-success" />
            <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="what-are-markets">
                  <AccordionTrigger>What are prediction markets?</AccordionTrigger>
                  <AccordionContent>
                    Prediction markets let you bet on the outcome of real-world events. Each market has a question
                    (like "Will X happen?") with YES and NO options. You buy shares based on your prediction, and
                    if you're right, you win money.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="how-do-prices-work">
                  <AccordionTrigger>How do prices work?</AccordionTrigger>
                  <AccordionContent>
                    Prices represent the market's collective prediction probability. YES shares at 70¢ means the market
                    thinks there's a 70% chance the event happens. YES + NO always equals $1.00. Prices change in
                    real-time as people trade.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="when-do-i-get-paid">
                  <AccordionTrigger>When do I get paid?</AccordionTrigger>
                  <AccordionContent>
                    You can cash out anytime at current market prices, or wait for market resolution. When a market
                    resolves, winning shares pay $1.00 each automatically. You can also cash out early to lock in
                    profits or limit losses before resolution.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="minimum-bet">
                  <AccordionTrigger>What's the minimum bet?</AccordionTrigger>
                  <AccordionContent>
                    The minimum bet size is $5.00. This ensures quality predictions and qualifies your bets for
                    reward calculations. Smaller bets don't count toward daily rewards or leaderboard rankings.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="who-creates-markets">
                  <AccordionTrigger>Who creates markets?</AccordionTrigger>
                  <AccordionContent>
                    Markets are created by platform administrators. Users can browse and trade on available markets.
                    This ensures market quality and prevents spam.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="what-are-pred-tokens">
                  <AccordionTrigger>What are PRED tokens and points?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2"><strong>Points:</strong> Imaginary, non-transferable points you start with (1,000 points).
                      You bet with points to prevent cheating and token transfers. Points are converted to tokens at season end.</p>
                    <p className="mb-2"><strong>PRED Tokens:</strong> The platform's native token. You earn PRED by converting
                      your season points with multipliers based on accuracy, volume, and rank. After presale, you can also buy
                      tokens and bet with both tokens and SOL.</p>
                    <p><strong>Why points first?</strong> Points are non-transferable (database-only), preventing people from
                      transferring tokens or cheating the system.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="how-to-cash-out">
                  <AccordionTrigger>How do I cash out early?</AccordionTrigger>
                  <AccordionContent>
                    Go to "My Predictions" page, select a position, and click "Cash Out". Enter the number of shares
                    you want to sell (partial or full). You'll receive current market price × shares. This lets you
                    lock in profits or cut losses without waiting for resolution.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="blockchain-mode">
                  <AccordionTrigger>Is my money on the blockchain?</AccordionTrigger>
                  <AccordionContent>
                    In blockchain mode, funds are held in secure smart contracts on Solana. Transactions are
                    on-chain and verifiable. The platform can also operate in database mode for faster transactions,
                    with blockchain integration available when enabled.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="ai-predictions">
                  <AccordionTrigger>What are AI Agent Picks?</AccordionTrigger>
                  <AccordionContent>
                    AI Agent Picks are predictions from multiple AI providers (OpenAI, Gemini, Claude, DeepSeek, Grok)
                    that analyze markets and provide predictions with confidence levels. These are for reference only
                    and don't guarantee outcomes.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="how-to-win">
                  <AccordionTrigger>How do I improve my accuracy?</AccordionTrigger>
                  <AccordionContent>
                    Research markets thoroughly, understand the context, and make informed predictions. Track your
                    performance in your profile. Leaderboard rankings are based purely on accuracy (not volume),
                    so focus on making quality predictions rather than betting large amounts.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="referral-system">
                  <AccordionTrigger>How does the referral system work?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">Every user gets a unique referral code on signup. Share it with friends!</p>
                    <p className="mb-2"><strong>Season Bonuses:</strong> When your referral earns tokens from season rewards (points conversion + leaderboard), you get 10% of their total reward.</p>
                    <p className="mb-2"><strong>Presale Bonuses:</strong> When your referral participates in presale, they get 20% bonus. You get 50% of their bonus (10% of base tokens).</p>
                    <p>Track your referrals and bonuses in the referral dashboard. Both you and your referrals benefit!</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="mb-16">
          <Card className="bg-gradient-to-r from-primary/10 via-accent/10 to-success/10 border-2">
            <CardContent className="pt-12 pb-12 text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Start Trading?</h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of traders making predictions on real-world events. Start earning rewards today!
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" asChild>
                  <Link to="/auth">
                    Sign Up Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/">
                    Browse Markets
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Learn;
