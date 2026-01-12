// src/hooks/useWallet.ts
import { useState, useEffect, useCallback } from "react";
import { piSDK } from "pi-sdk-js";
import { usePiAuth } from "./usePiAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface SpinHistory {
  id: string;
  result: "Win" | "Lose";
  spin_type: "free" | "paid";
  cost: number;
  reward_amount: number;
  created_at: string;
}

interface WalletData {
  balance: number;
  totalSpins: number;
  referralCode: string;
  referralCount: number;
  referralEarnings: number;
  recentSpins: SpinHistory[];
  lastFreeSpin: string | null;
}

interface LeaderboardEntry {
  username: string;
  totalWinnings: number;
}

export function useWallet() {
  const { user, canFreeSpin } = usePiAuth();
  const profileId = user?.uid || "";

  const [wallet, setWallet] = useState<WalletData>({
    balance: 0,
    totalSpins: 0,
    referralCode: "",
    referralCount: 0,
    referralEarnings: 0,
    recentSpins: [],
    lastFreeSpin: null,
  });

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);

  // ===== Fetch Wallet & Profile =====
  const fetchWalletData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      let balance = 0;
      if (piSDK.isAvailable()) balance = await piSDK.getBalance();

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", profileId)
        .maybeSingle();

      setWallet((prev) => ({
        ...prev,
        balance,
        totalSpins: profile?.total_spins || prev.totalSpins,
        referralCode: profile?.referral_code || prev.referralCode,
        referralCount: profile?.referral_count || prev.referralCount,
        referralEarnings: profile?.referral_earnings || prev.referralEarnings,
      }));

      fetchLeaderboard();
    } catch (err) {
      console.error(err);
      toast({ type: "error", title: "Failed to fetch wallet" });
    } finally {
      setIsLoading(false);
    }
  }, [profileId, user]);

  // ===== Apply Referral =====
  const applyReferral = async (ref?: string) => {
    if (!user || !ref) return;
    try {
      await supabase.from("profiles").update({ referral_code: ref }).eq("id", profileId);
      toast({ type: "success", title: `Referral ${ref} applied!` });
      fetchWalletData();
    } catch (err) {
      console.error(err);
      toast({ type: "error", title: "Failed to apply referral" });
    }
  };

  // ===== Update Balance =====
  const updateBalance = async (amount: number, saveToDB = false) => {
    setWallet((prev) => ({ ...prev, balance: amount }));
    if (saveToDB) {
      try {
        await supabase.from("profiles").update({ wallet_balance: amount }).eq("id", profileId);
      } catch (err) {
        console.error(err);
        toast({ type: "error", title: "Failed to update balance" });
      }
    }
  };

  // ===== Free Spin =====
  const handleFreeSpin = async () => {
    if (!user || !wallet) return;
    if (!canFreeSpin?.()) {
      toast({ type: "info", title: "Free spin not available yet" });
      return;
    }

    const reward = Math.random() > 0.5 ? 1 : 0;
    setWallet((prev) => ({
      ...prev,
      balance: prev.balance + reward,
      totalSpins: prev.totalSpins + 1,
      recentSpins: [
        {
          id: Date.now().toString(),
          result: reward > 0 ? "Win" : "Lose",
          spin_type: "free",
          cost: 0,
          reward_amount: reward,
          created_at: new Date().toISOString(),
        },
        ...prev.recentSpins,
      ],
      lastFreeSpin: new Date().toISOString(),
    }));

    toast({ type: "success", title: `Free spin completed! Reward: ${reward} π` });
  };

  // ===== Paid Spin =====
  const handlePaidSpin = async (cost: number) => {
    if (!user || !wallet) return;
    if (!piSDK.isAvailable()) {
      toast({ type: "error", title: "Open in Pi Browser to spin" });
      return;
    }

    setIsPaying(true);
    try {
      const result = await piSDK.sendPayment({
        amount: cost,
        note: "Paid Spin",
      });

      if (!result.success) {
        toast({ type: "error", title: "Payment failed" });
        return;
      }

      const reward = Math.random() > 0.5 ? cost * 2 : 0;
      setWallet((prev) => ({
        ...prev,
        balance: prev.balance - cost + reward,
        totalSpins: prev.totalSpins + 1,
        recentSpins: [
          {
            id: Date.now().toString(),
            result: reward > 0 ? "Win" : "Lose",
            spin_type: "paid",
            cost,
            reward_amount: reward,
            created_at: new Date().toISOString(),
          },
          ...prev.recentSpins,
        ],
      }));

      toast({ type: "success", title: `Paid spin completed! Reward: ${reward} π` });
    } catch (err) {
      console.error(err);
      toast({ type: "error", title: "Paid spin failed" });
    } finally {
      setIsPaying(false);
    }
  };

  // ===== Leaderboard =====
  const fetchLeaderboard = async () => {
    // مثال mock, ممكن تعوضها من Supabase لاحقًا
    setLeaderboard([
      { username: "alice", totalWinnings: 120 },
      { username: "bob", totalWinnings: 100 },
      { username: "charlie", totalWinnings: 80 },
    ]);
  };

  useEffect(() => {
    if (user) fetchWalletData();
  }, [user]);

  return {
    wallet,
    profileId,
    fetchWalletData,
    applyReferral,
    updateBalance,
    handleFreeSpin,
    handlePaidSpin,
    leaderboard,
    isLoading,
    isPaying,
    setWallet,
  };
}
