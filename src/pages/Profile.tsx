// src/pages/Profile.tsx
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Wallet as WalletIcon, Trophy, Loader2, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import GlobalLoading from "@/components/GlobalLoading";

import { usePiAuth } from "@/hooks/usePiAuth";
import { useWallet } from "@/hooks/useWallet";
import { useSpin } from "@/hooks/useSpin";

interface SpinHistory {
  id: string;
  result: string;
  spin_type: string;
  cost: number | null;
  reward_amount: number | null;
  created_at: string;
}

interface LeaderboardEntry {
  username: string;
  totalWinnings: number;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, canFreeSpin } = usePiAuth();
  const {
    wallet,
    fetchWalletData,
    leaderboard,
    isLoading: walletLoading,
  } = useWallet();

  const [freeSpinCountdown, setFreeSpinCountdown] = useState("00:00:00");
  const [loading, setLoading] = useState(true);
  const [spinError, setSpinError] = useState<string | null>(null);
  const [spinSuccess, setSpinSuccess] = useState<{ result: string; reward: number } | null>(null);

  // ===== Spin Hook with callbacks =====
  const { spin, isSpinning, lastResult } = useSpin({
    onSpinComplete: (result, rewardAmount) => {
      setSpinSuccess({ result, reward: rewardAmount });
      setSpinError(null);
      // Clear success message after 5 seconds
      setTimeout(() => setSpinSuccess(null), 5000);
    },
    onError: (error) => {
      setSpinError(error);
      setSpinSuccess(null);
      // Clear error after 5 seconds
      setTimeout(() => setSpinError(null), 5000);
    },
  });

  // ===== Handle Spin Actions =====
  const handleFreeSpin = useCallback(async () => {
    if (!canFreeSpin()) {
      toast.error("Free spin not available yet");
      return;
    }
    setSpinError(null);
    setSpinSuccess(null);
    await spin("free", 0);
    fetchWalletData();
  }, [canFreeSpin, spin, fetchWalletData]);

  const handlePaidSpin = useCallback(async () => {
    if (wallet.balance < 0.1) {
      toast.error("Insufficient balance for paid spin");
      return;
    }
    setSpinError(null);
    setSpinSuccess(null);
    await spin("paid", 0.1);
    fetchWalletData();
  }, [wallet.balance, spin, fetchWalletData]);

  // ===== Global Loading عند الانتقال =====
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // ===== Free Spin Countdown =====
  useEffect(() => {
    if (!wallet.lastFreeSpin) {
      setFreeSpinCountdown("Available!");
      return;
    }
    const interval = setInterval(() => {
      const last = new Date(wallet.lastFreeSpin!);
      const next = new Date(last.getTime() + 24 * 60 * 60 * 1000);
      const now = new Date();
      if (now >= next) {
        setFreeSpinCountdown("Available!");
        clearInterval(interval);
      } else {
        const diff = next.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setFreeSpinCountdown(
          `${String(hours).padStart(2, "0")}:${String(mins).padStart(
            2,
            "0"
          )}:${String(secs).padStart(2, "0")}`
        );
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [wallet.lastFreeSpin]);

  // ===== Redirect if not authenticated & fetch wallet =====
  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate("/");
    if (user) fetchWalletData();
  }, [isAuthenticated, isLoading, user, navigate, fetchWalletData]);

  if (loading || walletLoading) return <GlobalLoading isVisible={true} />;

  const canDoFreeSpin = canFreeSpin() && freeSpinCountdown === "Available!";
  const canDoPaidSpin = wallet.balance >= 0.1;

  return (
    <motion.div 
      className="min-h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-foreground flex-1">
            {user?.username}'s Profile
          </h1>
        </div>

        {/* ===== Spin Status Alerts ===== */}
        {spinError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4"
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                {spinError}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {spinSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4"
          >
            <Alert className="border-green-500 bg-green-500/10">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-600">
                🎉 {spinSuccess.result}! You won {spinSuccess.reward.toFixed(4)} π
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* ===== Wallet & Stats ===== */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="p-4">
            <CardContent className="flex items-center gap-2 p-0">
              <WalletIcon className="text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Wallet Balance</p>
                <p className="text-lg font-bold">{wallet.balance.toFixed(4)} π</p>
              </div>
            </CardContent>
          </Card>

          <Card className="p-4">
            <CardContent className="p-0">
              <p className="text-sm text-muted-foreground">Total Spins</p>
              <p className="text-lg font-bold">{wallet.totalSpins}</p>
            </CardContent>
          </Card>

          <Card className="p-4">
            <CardContent className="p-0">
              <p className="text-sm text-muted-foreground">Total Winnings</p>
              <p className="text-lg font-bold">{wallet.referralEarnings.toFixed(2)} π</p>
            </CardContent>
          </Card>

          <Card className="p-4">
            <CardContent className="p-0">
              <p className="text-sm text-muted-foreground">Referral Code</p>
              <p className="text-lg font-bold font-mono">{wallet.referralCode || "—"}</p>
            </CardContent>
          </Card>

          <Card className="p-4">
            <CardContent className="p-0">
              <p className="text-sm text-muted-foreground">Referral Count</p>
              <p className="text-lg font-bold">{wallet.referralCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* ===== Spin Buttons with Loading States ===== */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Quick Spin</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={handleFreeSpin} 
              disabled={!canDoFreeSpin || isSpinning}
              className="flex-1 relative"
              size="lg"
            >
              {isSpinning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Spinning...
                </>
              ) : canDoFreeSpin ? (
                "🎡 Free Spin"
              ) : (
                `⏰ Next in ${freeSpinCountdown}`
              )}
            </Button>
            
            <Button 
              onClick={handlePaidSpin} 
              disabled={!canDoPaidSpin || isSpinning}
              variant="secondary"
              className="flex-1"
              size="lg"
            >
              {isSpinning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : canDoPaidSpin ? (
                "💰 Spin for 0.1 π"
              ) : (
                "Insufficient Balance"
              )}
            </Button>
          </div>
          
          {!canDoPaidSpin && wallet.balance < 0.1 && (
            <p className="text-sm text-muted-foreground mt-2 text-center">
              You need at least 0.1 π for a paid spin. Current balance: {wallet.balance.toFixed(4)} π
            </p>
          )}
        </Card>

        {/* ===== Leaderboard ===== */}
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Trophy className="text-amber-500" /> Leaderboard
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {leaderboard.length === 0 ? (
            <Card className="p-4 col-span-full">
              <CardContent className="p-0 text-center text-muted-foreground">
                No leaderboard data yet
              </CardContent>
            </Card>
          ) : (
            leaderboard.map((entry, i) => (
              <Card key={i} className="p-4">
                <CardContent className="p-0 flex items-center justify-between">
                  <span className="font-medium">
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`} {entry.username}
                  </span>
                  <span className="text-primary font-bold">{entry.totalWinnings.toFixed(2)} π</span>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* ===== Recent Spins ===== */}
        <h2 className="text-xl font-bold mb-4">Recent Spins</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {!wallet.recentSpins || wallet.recentSpins.length === 0 ? (
            <Card className="p-4 col-span-full">
              <CardContent className="p-0 text-center text-muted-foreground">
                No spin history yet. Try your first spin!
              </CardContent>
            </Card>
          ) : (
            wallet.recentSpins.map((spinItem: SpinHistory) => (
              <Card
                key={spinItem.id}
                className={`p-4 border-2 ${
                  (spinItem.reward_amount || 0) > 0 
                    ? "border-green-500/50 bg-green-500/5" 
                    : "border-red-500/50 bg-red-500/5"
                }`}
              >
                <CardContent className="p-0">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium capitalize">
                      {spinItem.spin_type === "free" ? "🎁 Free" : "💰 Paid"} Spin
                    </span>
                    <span className={`font-bold ${
                      (spinItem.reward_amount || 0) > 0 ? "text-green-500" : "text-red-500"
                    }`}>
                      {(spinItem.reward_amount || 0) > 0 ? "+" : ""}{(spinItem.reward_amount || 0).toFixed(4)} π
                    </span>
                  </div>
                  <p className="text-sm">{spinItem.result}</p>
                  {spinItem.cost && spinItem.cost > 0 && (
                    <p className="text-xs text-muted-foreground">Cost: {spinItem.cost} π</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(spinItem.created_at).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
