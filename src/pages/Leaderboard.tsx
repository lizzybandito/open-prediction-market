import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp } from "lucide-react";
import { useLeaderboard } from "@/hooks/use-leaderboard";
import { Link } from "react-router-dom";

const Leaderboard = () => {
  const { data: leaderboardData, isLoading, error } = useLeaderboard({ timeframe: "all", limit: 50 });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Trophy className="h-8 w-8 text-primary" />
            Leaderboard
          </h1>
          <p className="text-muted-foreground">Top performers in prediction markets</p>
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading leaderboard...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-destructive">Failed to load leaderboard. Please try again later.</p>
            {error instanceof Error && (
              <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
            )}
          </div>
        )}

        {!isLoading && !error && leaderboardData && (!leaderboardData.data || leaderboardData.data.length === 0) && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No leaderboard entries yet. Be the first to make a prediction!</p>
          </div>
        )}

        {!isLoading && !error && leaderboardData && leaderboardData.data && leaderboardData.data.length > 0 && (
          <div className="space-y-3">
            {leaderboardData.data.map((leader) => (
              <Card key={leader.rank} className={leader.rank <= 3 ? "border-primary/50" : ""}>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 font-bold text-xl">
                    {leader.rank}
                  </div>
                  <Link to={`/user/${encodeURIComponent(leader.username)}`} className="flex-shrink-0">
                    <Avatar className="h-12 w-12 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                      <AvatarImage src={leader.avatar} />
                      <AvatarFallback>{leader.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1">
                    <Link to={`/user/${encodeURIComponent(leader.username)}`}>
                      <h3 className="font-semibold text-lg hover:text-primary transition-colors cursor-pointer">
                        {leader.username}
                      </h3>
                    </Link>
                    <p className="text-sm text-muted-foreground">{leader.predictions} predictions</p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="font-semibold text-success text-lg">
                      ${leader.totalWinnings.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Winnings</div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {leader.accuracy.toFixed(1)}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Leaderboard;
