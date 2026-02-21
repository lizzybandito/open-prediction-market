import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { WalletContextProvider } from "@/contexts/WalletContext";
import Index from "./pages/Index";
import Market from "./pages/Market";
import Activity from "./pages/Activity";
import Leaderboard from "./pages/Leaderboard";
import MyPredictions from "./pages/MyPredictions";
import Wallet from "./pages/Wallet";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import Tokenomics from "./pages/Tokenomics";
import AIRace from "./pages/AIRace";
import Learn from "./pages/Learn";
import HowItWorks from "./pages/HowItWorks";
import NotFound from "./pages/NotFound";

import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Listen for auth cache clear events
if (typeof window !== "undefined") {
  window.addEventListener("auth:clearcache", () => {
    queryClient.clear();
  });
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <WalletContextProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/market/:id" element={<Market />} />
                <Route path="/activity" element={<Activity />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/my-predictions" element={<MyPredictions />} />
                <Route path="/wallet" element={<Wallet />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/user/:username" element={<UserProfile />} />
                <Route path="/tokenomics" element={<Tokenomics />} />
                <Route path="/ai-race" element={<AIRace />} />
                <Route path="/learn" element={<Learn />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <Admin />
                    </AdminRoute>
                  }
                />
                <Route path="/auth" element={<Auth />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </WalletContextProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
