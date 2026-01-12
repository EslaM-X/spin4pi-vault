import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Wallet as WalletIcon, Users, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { usePiAuth } from "@/hooks/usePiAuth";
import { usePiPayment } from "@/hooks/usePiPayment";
import GlobalLoading from "@/components/GlobalLoading";
import { piSDK } from "pi-sdk-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SpinHistory {
  id: string;
  result: string;
  spin_type: string;
  cost: number;
  reward_amount: number;
  created_at: string;
}

interface ProfileStats {
  total_spins: number;
  total_winnings: number;
  best_win: number;
  win_rate: number;
  wallet_balance: number;
  referral_code: string;
  referral_count: number;
  referral_earnings: number;
  recent_spins: SpinHistory[];
  last_free_spin: string | null;
}

interface LeaderboardEntry {
  username: string;
  total_winnings: number;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, canFreeSpin } = usePiAuth();
  const { createPayment, isPaying } = usePiPayment();

  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [freeSpinCountdown, setFreeSpinCountdown] = useState("00:00:00");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // ===== Global Loading عند الانتقال =====
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // ===== Fetch Profile & Wallet Live =====
  const fetchProfile = useCallback(async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      // جلب الرصيد من Pi SDK
      let balance = 0;
      if (piSDK.isAvailable()) balance = await piSDK.getBalance();
      setWalletBalance(balance);

      // جلب البيانات من Supabase
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("pi_username", user.username)
        .maybeSingle();

      if (!profile) {
        toast.error("Profile not found");
        setLoading(false);
        return;
      }

      const { data: spins } = await supabase
        .from("spins")
        .select("*")
        .eq("profile_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(20);

      const spinHistory: SpinHistory[] = spins || [];
      const winningSpins = spinHistory.filter(s => s.reward_amount > 0);
      const bestWin =
        spinHistory.length > 0
          ? Math.max(...spinHistory.map(s => s.reward_amount || 0))
          : 0;

      setStats({
        total_spins: profile.total_spins || 0,
        total_winnings: profile.total_winnings || 0,
        best_win: bestWin,
        win_rate:
          spinHistory.length > 0
            ? (winningSpins.length / spinHistory.length) * 100
            : 0,
        wallet_balance: balance,
        referral_code: profile.referral_code || user.username,
        referral_count: profile.referral_count || 0,
        referral_earnings: Number(profile.referral_earnings) || 0,
        recent_spins: spinHistory,
        last_free_spin: profile.last_free_spin,
      });

      startFreeSpinCountdown(profile.last_free_spin);

      fetchLeaderboard();

    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate("/");
    if (user) fetchProfile();
  }, [isAuthenticated, isLoading, user]);

  // ===== Free Spin Countdown =====
  const startFreeSpinCountdown = (lastFreeSpin: string | null) => {
    if (!lastFreeSpin) {
      setFreeSpinCountdown("Available!");
      return;
    }
    const interval = setInterval(() => {
      const last = new Date(lastFreeSpin);
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
  };

  // ===== Free Spin Handler =====
  const handleFreeSpin = async () => {
    if (!user || !stats) return;
    if (!canFreeSpin()) {
      toast.info(`Next Free Spin in ${freeSpinCountdown}`);
      return;
    }

    const reward = Math.random() > 0.5 ? 1 : 0;
    const newWallet = walletBalance + reward;
    setWalletBalance(newWallet);

    const updatedStats = {
      ...stats,
      total_spins: stats.total_spins + 1,
      total_winnings: stats.total_winnings + reward,
      wallet_balance: newWallet,
      recent_spins: [
        {
          id: Date.now().toString(),
          result: reward > 0 ? "Win" : "Lose",
          spin_type: "free",
          cost: 0,
          reward_amount: reward,
          created_at: new Date().toISOString(),
        },
        ...stats.recent_spins,
      ],
      last_free_spin: new Date().toISOString(),
    };
    setStats(updatedStats);

    // تحديث Supabase
    try {
      await supabase
        .from("profiles")
        .update({
          total_spins: updatedStats.total_spins,
          total_winnings: updatedStats.total_winnings,
          wallet_balance: updatedStats.wallet_balance,
          last_free_spin: updatedStats.last_free_spin,
        })
        .eq("pi_username", user.username);
    } catch (err) {
      console.error(err);
    }

    toast.success(`Free Spin completed! Reward: ${reward} π`);
  };

  // ===== Paid Spin Handler =====
  const handlePaidSpin = async (cost: number) => {
    if (!user || !stats) return;
    if (!piSDK.isAvailable()) {
      toast.error("Open in Pi Browser to spin");
      return;
    }

    const result = await createPayment(cost, "Paid Spin", user.username);
    if (!result.success) return;

    const reward = Math.random() > 0.5 ? cost * 2 : 0;
    const newWallet = walletBalance - cost + reward;
    setWalletBalance(newWallet);

    const updatedStats = {
      ...stats,
      total_spins: stats.total_spins + 1,
      total_winnings: stats.total_winnings + reward,
      wallet_balance: newWallet,
      recent_spins: [
        {
          id: Date.now().toString(),
          result: reward > 0 ? "Win" : "Lose",
          spin_type: "paid",
          cost: cost,
          reward_amount: reward,
          created_at: new Date().toISOString(),
        },
        ...stats.recent_spins,
      ],
    };
    setStats(updatedStats);

    // تحديث Supabase
    try {
      await supabase
        .from("profiles")
        .update({
          total_spins: updatedStats.total_spins,
          total_winnings: updatedStats.total_winnings,
          wallet_balance: updatedStats.wallet_balance,
        })
        .eq("pi_username", user.username);
    } catch (err) {
      console.error(err);
    }

    toast.success(`Paid Spin completed! Reward: ${reward} π`);
  };

  // ===== Leaderboard Live =====
  const fetchLeaderboard = async () => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("pi_username, total_winnings")
        .order("total_winnings", { ascending: false })
        .limit(10);

      if (data) {
        setLeaderboard(
          data.map((entry) => ({
            username: entry.pi_username,
            total_winnings: entry.total_winnings,
          }))
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch leaderboard");
    }
  };

  if (loading || !stats) return <GlobalLoading isVisible={true} />;

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

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="p-4">
            <CardContent className="flex items-center gap-2">
              <WalletIcon />
              <div>
                <p>Wallet Balance</p>
                <p>{walletBalance.toFixed(2)} π</p>
              </div>
            </CardContent>
          </Card>

          <Card className="p-4">
            <CardContent>
              <p>Total Spins</p>
              <p>{stats.total_spins}</p>
            </CardContent>
          </Card>

          <Card className="p-4">
            <CardContent>
              <p>Total Winnings</p>
              <p>{stats.total_winnings.toFixed(2)} π</p>
            </CardContent>
          </Card>
        </div>

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

        <h2 className="text-xl font-bold mb-2">Leaderboard</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          {leaderboard.map((entry, i) => (
            <Card key={i} className="p-4">
              <CardContent>
                <p>{i + 1}. {entry.username}</p>
                <p>{entry.total_winnings.toFixed(2)} π</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
