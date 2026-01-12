// src/pages/Profile.tsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Wallet as WalletIcon, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import GlobalLoading from "@/components/GlobalLoading";

import { usePiAuth } from "@/hooks/usePiAuth";
import { useWallet } from "@/hooks/useWallet";

interface SpinHistory {
  id: string;
  result: "Win" | "Lose";
  spinType: "free" | "paid";
  cost: number;
  rewardAmount: number;
  createdAt: string;
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
    handleFreeSpin,
    handlePaidSpin,
    leaderboard,
    isLoading: walletLoading,
    isPaying,
  } = useWallet();

  const [freeSpinCountdown, setFreeSpinCountdown] = useState("00:00:00");
  const [loading, setLoading] = useState(true);

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
  }, [isAuthenticated, isLoading, user]);

  if (loading || walletLoading) return <GlobalLoading isVisible={true} />;

  return (
    <motion.div className="min-h-screen bg-background">
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

        {/* ===== Wallet & Stats ===== */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="p-4">
            <CardContent className="flex items-center gap-2">
              <WalletIcon />
              <div>
                <p>Wallet Balance</p>
                <p>{wallet.balance.toFixed(2)} π</p>
              </div>
            </CardContent>
          </Card>

          <Card className="p-4">
            <CardContent>
              <p>Total Spins</p>
              <p>{wallet.totalSpins}</p>
            </CardContent>
          </Card>

          <Card className="p-4">
            <CardContent>
              <p>Total Winnings</p>
              <p>{wallet.referralEarnings.toFixed(2)} π</p>
            </CardContent>
          </Card>

          <Card className="p-4">
            <CardContent>
              <p>Referral Code</p>
              <p>{wallet.referralCode}</p>
            </CardContent>
          </Card>

          <Card className="p-4">
            <CardContent>
              <p>Referral Count</p>
              <p>{wallet.referralCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* ===== Spin Buttons ===== */}
        <div className="flex gap-4 mb-8">
          <Button onClick={handleFreeSpin} disabled={freeSpinCountdown !== "Available!"}>
            {freeSpinCountdown === "Available!"
              ? "Free Spin"
              : `Next Free Spin in ${freeSpinCountdown}`}
          </Button>
          <Button onClick={() => handlePaidSpin(1)} disabled={isPaying}>
            {isPaying ? "Processing..." : "Spin 1 π"}
          </Button>
        </div>

        {/* ===== Leaderboard ===== */}
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
          <Trophy /> Leaderboard
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          {leaderboard.map((entry, i) => (
            <Card key={i} className="p-4">
              <CardContent>
                <p>
                  {i + 1}. {entry.username}
                </p>
                <p>{entry.totalWinnings.toFixed(2)} π</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ===== Recent Spins ===== */}
        <h2 className="text-xl font-bold mb-2">Recent Spins</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {wallet.recentSpins?.map((spin: SpinHistory) => (
            <Card
              key={spin.id}
              className={`p-4 border ${
                spin.result === "Win" ? "border-green-500" : "border-red-500"
              }`}
            >
              <CardContent>
                <p>
                  {spin.spinType === "free" ? "Free Spin" : "Paid Spin"} -{" "}
                  {spin.result}
                </p>
                <p>Cost: {spin.cost} π</p>
                <p>Reward: {spin.rewardAmount} π</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(spin.createdAt).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
