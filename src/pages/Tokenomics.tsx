import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Coins, 
  Gift, 
  TrendingUp, 
  Trophy, 
  Zap, 
  Shield, 
  Users, 
  ShoppingCart,
  PiggyBank,
  Rocket,
  Flame,
  UsersRound,
  Sparkles
} from "lucide-react";

const Tokenomics = () => {
  const tokenDistribution = [
    {
      category: "Community Rewards",
      percentage: 40,
      amount: "400M",
      icon: Users,
      color: "text-blue-500",
      description: "Rewards for active participation and engagement",
      breakdown: [
        { label: "Points System & Season Conversion", amount: "100M (10%)" },
        { label: "Betting Rewards", amount: "150M (15%)" },
        { label: "Leaderboard Rewards", amount: "100M (10%)" },
        { label: "Special Events", amount: "50M (5%)" },
      ]
    },
    {
      category: "Presale",
      percentage: 15,
      amount: "150M",
      icon: UsersRound,
      color: "text-cyan-500",
      description: "Pre-launch presale with equal distribution and bonuses",
      breakdown: [
        { label: "Equal Base Distribution", amount: "130M" },
        { label: "Referral Bonuses", amount: "10M" },
        { label: "Betting History Bonuses", amount: "10M" },
      ]
    },
    {
      category: "Token Sale",
      percentage: 20,
      amount: "200M",
      icon: ShoppingCart,
      color: "text-green-500",
      description: "Public sale on DEX after Season 1",
      breakdown: [
        { label: "Public Distribution", amount: "200M" },
      ]
    },
    {
      category: "Team & Advisors",
      percentage: 5,
      amount: "50M",
      icon: Rocket,
      color: "text-purple-500",
      description: "Platform development fund with 4-year vesting",
      breakdown: [
        { label: "4-year vesting", amount: "12-month cliff" },
        { label: "Milestone unlocks", amount: "Tied to platform" },
      ]
    },
    {
      category: "Treasury",
      percentage: 15,
      amount: "150M",
      icon: PiggyBank,
      color: "text-orange-500",
      description: "Long-term sustainability and operations",
      breakdown: [
        { label: "Infrastructure", amount: "45M" },
        { label: "Maintenance", amount: "45M" },
        { label: "Liquidity", amount: "35M" },
        { label: "Reserves", amount: "25M" },
      ]
    },
    {
      category: "Marketing & Growth",
      percentage: 10,
      amount: "100M",
      icon: TrendingUp,
      color: "text-pink-500",
      description: "User acquisition and community building",
      breakdown: [
        { label: "User Acquisition", amount: "60M" },
        { label: "Community Building", amount: "25M" },
        { label: "Influencer Partnerships", amount: "15M" },
      ]
    },
    {
      category: "Token Burns",
      percentage: 10,
      amount: "100M",
      icon: Flame,
      color: "text-red-500",
      description: "Maximum deflationary mechanism",
      breakdown: [
        { label: "Initial Burn Reserve", amount: "50M" },
        { label: "Ongoing Burns", amount: "50M" },
      ]
    },
  ];

  const rewardMechanisms = [
    {
      title: "Imaginary Points System",
      icon: Gift,
      description: "Start with 1,000 non-transferable points",
      details: [
        "Points are imaginary and database-only (non-transferable)",
        "Prevents cheating, token transfers, and multiple claims",
        "Bet with points during the season",
        "Convert points to tokens at season end with multipliers",
      ]
    },
    {
      title: "Betting Rewards",
      icon: Coins,
      description: "Earn tokens based on your betting activity with multipliers",
      details: [
        "Minimum bet: $5.00 to qualify",
        "Multiplier: 1.0x to 2.0x based on bet count",
        "Diversity bonus for betting on multiple markets",
        "Daily cap: 1,000 PRED tokens",
        "Base reward: 0.1% of bet amount",
      ]
    },
    {
      title: "Accuracy Leaderboard",
      icon: Trophy,
      description: "Ranked by accuracy, not volume - rewarding skill over spending",
      details: [
        "Minimum 10 resolved bets required",
        "Minimum $100 total volume",
        "Pure accuracy-based ranking",
        "Top performers receive season rewards",
      ]
    },
    {
      title: "Season System & Points Conversion",
      icon: Zap,
      description: "Bet with points, convert to tokens at season end with performance multipliers",
      details: [
        "Start each season with 1,000 points",
        "Presale opens during the season → Buy tokens with SOL",
        "Points convert to tokens at season end: Base 0.1 token per point",
        "Multipliers: Accuracy (up to 2x), Volume (up to 1.5x), Rank (top 10: 1.5x, top 20%: 1.2x)",
        "After season ends: Trade with tokens & SOL",
        "Tokens earned are permanently yours",
      ]
    },
    {
      title: "Presale Participation",
      icon: Sparkles,
      description: "Presale opens during the season - contribute SOL and earn equal tokens plus bonuses",
      details: [
        "Presale opens during the active season",
        "Equal distribution: Everyone gets same base tokens",
        "Referral bonus: 20% bonus if you use a referral code",
        "Referrer bonus: Referrers get 50% of referee's presale bonus",
        "Betting bonus: 10-50% bonus based on your betting history",
        "Excess SOL automatically refunded",
        "$10M FDV target ($0.01 per token reference)",
        "After season ends: Trade with tokens & SOL",
      ]
    },
    {
      title: "Referral System",
      icon: Users,
      description: "Earn bonuses by referring friends - bonuses from both season and presale",
      details: [
        "Get your unique referral code on signup",
        "Season bonus: Earn 10% of referee's total season rewards",
        "Presale bonus: Earn 50% of referee's presale bonus",
        "Track referrals and bonuses in your dashboard",
        "Referral leaderboard for top referrers",
        "Both you and your referrals benefit",
      ]
    },
  ];

  const securityFeatures = [
    {
      title: "Supply Cap",
      description: "Hard cap of 1 billion PRED tokens enforced on-chain",
      icon: Shield,
    },
    {
      title: "Points System (Anti-Cheat)",
      description: "Non-transferable points prevent token transfers, multiple claims, and cheating",
      icon: Shield,
    },
    {
      title: "Quality Checks",
      description: "Minimum bet sizes and volume requirements ensure fairness",
      icon: Shield,
    },
    {
      title: "Vesting",
      description: "Team tokens vested over 4 years with milestone unlocks",
      icon: Shield,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Coins className="h-10 w-10 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold">PRED Tokenomics</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A comprehensive token distribution and reward system designed for fairness, 
            sustainability, and community growth.
          </p>
          <Badge variant="outline" className="mt-4 text-lg px-4 py-2">
            Total Supply: 1,000,000,000 PRED
          </Badge>
        </div>

        {/* Token Distribution */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="h-7 w-7 text-primary" />
            Token Distribution
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tokenDistribution.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.category} className="relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-32 h-32 ${item.color} opacity-10`}>
                    <Icon className="h-32 w-32" />
                  </div>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={`h-6 w-6 ${item.color}`} />
                      <Badge variant="secondary" className="text-sm">
                        {item.percentage}%
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{item.category}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-primary mb-3">{item.amount}</div>
                      <div className="space-y-1">
                        {item.breakdown.map((breakdown, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{breakdown.label}</span>
                            <span className="font-medium">{breakdown.amount}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Reward Mechanisms */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <Zap className="h-7 w-7 text-primary" />
            How to Earn PRED Tokens
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {rewardMechanisms.map((mechanism) => {
              const Icon = mechanism.icon;
              return (
                <Card key={mechanism.title}>
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className="h-6 w-6 text-primary" />
                      <CardTitle className="text-xl">{mechanism.title}</CardTitle>
                    </div>
                    <CardDescription>{mechanism.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {mechanism.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <span className="text-primary mt-1">•</span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Security & Fairness */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <Shield className="h-7 w-7 text-primary" />
            Security & Fairness
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {securityFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Icon className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Key Features */}
        <section>
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl mb-2">Key Features</CardTitle>
              <CardDescription>
                Our tokenomics are designed with maximum fairness and sustainability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400">
                      Fair
                    </Badge>
                    <div>
                      <p className="font-semibold">Community-First Distribution</p>
                      <p className="text-sm text-muted-foreground">
                        40% allocated to community rewards
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-400">
                      Deflationary
                    </Badge>
                    <div>
                      <p className="font-semibold">Maximum Deflationary</p>
                      <p className="text-sm text-muted-foreground">
                        10% allocated to burns with ongoing mechanisms
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-700 dark:text-purple-400">
                      Sustainable
                    </Badge>
                    <div>
                      <p className="font-semibold">Long-term Treasury</p>
                      <p className="text-sm text-muted-foreground">
                        15% allocated for platform sustainability
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="bg-orange-500/10 text-orange-700 dark:text-orange-400">
                      Protected
                    </Badge>
                    <div>
                      <p className="font-semibold">Sybil Attack Prevention</p>
                      <p className="text-sm text-muted-foreground">
                        IP limits and account age requirements
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="bg-pink-500/10 text-pink-700 dark:text-pink-400">
                      Rewarding
                    </Badge>
                    <div>
                      <p className="font-semibold">Accuracy-Based Leaderboard</p>
                      <p className="text-sm text-muted-foreground">
                        Rewards skill, not just volume
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="bg-red-500/10 text-red-700 dark:text-red-400">
                      Capped
                    </Badge>
                    <div>
                      <p className="font-semibold">Hard Supply Cap</p>
                      <p className="text-sm text-muted-foreground">
                        1 billion tokens maximum, enforced on-chain
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default Tokenomics;

