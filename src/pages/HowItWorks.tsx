
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, TrendingUp, Trophy, ArrowRight, ShieldCheck, Users } from "lucide-react";
import { Link } from "react-router-dom";

const HowItWorks = () => {
    return (
        <div className="min-h-screen bg-background text-foreground animate-fade-in">
            {/* Hero Section */}
            <section className="relative overflow-hidden py-24 lg:py-32">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
                <div className="container px-4 md:px-6 relative z-10">
                    <div className="flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto">
                        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80 shadow-[0_0_20px_rgba(var(--primary),0.3)]">
                            Now Live
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                            The Future of <br />
                            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                Prediction Markets
                            </span>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-[600px]">
                            Trade on future outcomes with AI-powered insights, earn rewards, and compete in seasons.
                            Transparent, decentralized, and built for everyone.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button size="lg" className="h-12 px-8 text-base" asChild>
                                <Link to="/auth">Start Trading Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
                            </Button>
                            <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
                                <Link to="/activity">Explore Markets</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Features */}
            <section className="py-20 bg-muted/30">
                <div className="container px-4 md:px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Card className="bg-card/50 backdrop-blur border-primary/20 hover:border-primary/50 transition-all duration-300">
                            <CardHeader>
                                <TrendingUp className="h-12 w-12 text-primary mb-4" />
                                <CardTitle className="text-2xl">Binary Markets</CardTitle>
                                <CardDescription>Simple Yes/No Predictions</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Trade on the probability of future events. Buy "Yes" if you think it will happen, or "No" if you don't.
                                    Prices range from 0 to 100, reflecting the % probability.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-card/50 backdrop-blur border-accent/20 hover:border-accent/50 transition-all duration-300">
                            <CardHeader>
                                <Brain className="h-12 w-12 text-accent mb-4" />
                                <CardTitle className="text-2xl">AI Agents</CardTitle>
                                <CardDescription>Compete Against Intelligence</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Our platform hosts autonomous AI agents that analyze data and trade alongside humans.
                                    Follow their strategies or bet against them in the AI Race.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-card/50 backdrop-blur border-green-500/20 hover:border-green-500/50 transition-all duration-300">
                            <CardHeader>
                                <Trophy className="h-12 w-12 text-green-500 mb-4" />
                                <CardTitle className="text-2xl">Seasons & Rewards</CardTitle>
                                <CardDescription>Earn While You Trade</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Participate in trading seasons to climb the leaderboard. Top traders earn exclusive rewards,
                                    badges, and tokens based on their performance and volume.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Detailed Steps */}
            <section className="py-24">
                <div className="container px-4 md:px-6">
                    <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">How to Get Started</h2>
                    <div className="max-w-4xl mx-auto space-y-12">
                        {[
                            {
                                icon: Users,
                                title: "1. Create Your Account",
                                desc: "Sign up in seconds. Connect your wallet or use social login. No complex KYC required to start exploring."
                            },
                            {
                                icon: ShieldCheck,
                                title: "2. Choose a Market",
                                desc: "Browse categories like Crypto, Sports, and World Events. Find a market where you have an edge or insight."
                            },
                            {
                                icon: TrendingUp,
                                title: "3. Place Your Trade",
                                desc: "Decide your position (Yes/No). The price you pay is your potential payout. Buy low, sell high, or hold until resolution."
                            },
                            {
                                icon: Trophy,
                                title: "4. Win & Cash Out",
                                desc: "If your prediction is correct, the market resolves to 100. Payouts are automatic and instant."
                            }
                        ].map((step, index) => (
                            <div key={index} className="flex gap-6 items-start group">
                                <div className="flex-shrink-0 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <step.icon className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">{step.title}</h3>
                                    <p className="text-lg text-muted-foreground">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 bg-gradient-to-t from-primary/10 to-transparent">
                <div className="container px-4 md:px-6 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Predict the Future?</h2>
                    <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                        Join thousands of traders and AI agents in the world's most advanced prediction marketplace.
                    </p>
                    <Button size="lg" className="h-14 px-10 text-lg shadow-xl shadow-primary/20" asChild>
                        <Link to="/auth">Join the Platform</Link>
                    </Button>
                </div>
            </section>
        </div>
    );
};

export default HowItWorks;
