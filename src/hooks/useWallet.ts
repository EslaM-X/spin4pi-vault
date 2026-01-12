// src/hooks/useWalletUnified.ts
import { useState, useEffect, useCallback } from "react";
import { piSDK, PaymentDTO } from "@/lib/pi-sdk"; // Pi SDK مدمج
import { usePiAuth } from "./usePiAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

export function useWalletUnified() {
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
      if (piSDK.isAvailable()) {
        balance = await piSDK.getBalance();
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", profileId)
        .maybeSingle();

      if (error) throw error;

      setWallet({
        balance,
        totalSpins: profile?.total_spins || 0,
        referralCode: profile?.referral_code || "",
        referralCount: profile?.referral_count || 0,
        referralEarnings: profile?.referral_earnings || 0,
        recentSpins: profile?.recent_spins || [],
        lastFreeSpin: profile?.last_free_spin || null,
      });

      await fetchLeaderboard();
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch wallet");
    } finally {
      setIsLoading(false);
    }
  }, [profileId, user]);

  // ===== Apply Referral =====
  const applyReferral = useCallback(async (ref?: string) => {
    if (!user || !ref) return;
    try {
      await supabase.from("profiles").update({ referral_code: ref }).eq("id", profileId);
      toast.success(`Referral ${ref} applied!`);
      await fetchWalletData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to apply referral");
    }
  }, [profileId, user, fetchWalletData]);

  // ===== Update Balance =====
  const updateBalance = useCallback(async (amount: number, saveToDB = false) => {
    setWallet(prev => ({ ...prev, balance: amount }));
    if (saveToDB) {
      try {
        await supabase.from("profiles").update({ wallet_balance: amount }).eq("id", profileId);
      } catch (err) {
        console.error(err);
        toast.error("Failed to update balance");
      }
    }
  }, [profileId]);

  // ===== Free Spin =====
  const handleFreeSpin = useCallback(async () => {
    if (!user || !wallet) return;
    if (!canFreeSpin?.()) {
      toast.info("Free spin not available yet");
      return;
    }

    try {
      const reward = Math.floor(Math.random() * 2); // 0 أو 1 Pi
      const newSpin: SpinHistory = {
        id: Date.now().toString(),
        result: reward > 0 ? "Win" : "Lose",
        spin_type: "free",
        cost: 0,
        reward_amount: reward,
        created_at: new Date().toISOString(),
      };

      // إرسال reward عن طريق Pi SDK بشكل رسمي
      if (reward > 0 && piSDK.isAvailable()) {
        await piSDK.createPayment(reward, "Free Spin Reward", user.username);
      }

      // تحديث البيانات في Supabase
      await supabase.from("profiles").update({
        wallet_balance: wallet.balance + reward,
        total_spins: wallet.totalSpins + 1,
        last_free_spin: new Date().toISOString(),
        recent_spins: [newSpin, ...(wallet.recentSpins || [])],
      }).eq("id", profileId);

      setWallet(prev => ({
        ...prev,
        balance: prev.balance + reward,
        totalSpins: prev.totalSpins + 1,
        lastFreeSpin: new Date().toISOString(),
        recentSpins: [newSpin, ...prev.recentSpins],
      }));

      toast.success(`Free spin completed! Reward: ${reward} π`);
    } catch (err) {
      console.error(err);
      toast.error("Free spin failed");
    }
  }, [user, wallet, profileId, canFreeSpin]);

  // ===== Paid Spin =====
  const handlePaidSpin = useCallback(async (cost: number) => {
    if (!user || !wallet) return;
    if (!piSDK.isAvailable()) {
      toast.error("Open in Pi Browser to spin");
      return;
    }

    setIsPaying(true);
    try {
      const paymentResult = await piSDK.createPayment(cost, "Paid Spin", user.username);

      if (!paymentResult.success) {
        toast.error("Payment failed");
        return;
      }

      const reward = Math.random() > 0.5 ? cost * 2 : 0;
      const newSpin: SpinHistory = {
        id: Date.now().toString(),
        result: reward > 0 ? "Win" : "Lose",
        spin_type: "paid",
        cost,
        reward_amount: reward,
        created_at: new Date().toISOString(),
      };

      await supabase.from("profiles").update({
        wallet_balance: wallet.balance - cost + reward,
        total_spins: wallet.totalSpins + 1,
        recent_spins: [newSpin, ...(wallet.recentSpins || [])],
      }).eq("id", profileId);

      setWallet(prev => ({
        ...prev,
        balance: prev.balance - cost + reward,
        totalSpins: prev.totalSpins + 1,
        recentSpins: [newSpin, ...prev.recentSpins],
      }));

      toast.success(`Paid spin completed! Reward: ${reward} π`);
    } catch (err) {
      console.error(err);
      toast.error("Paid spin failed");
    } finally {
      setIsPaying(false);
    }
  }, [user, wallet, profileId]);

  // ===== Leaderboard من Supabase =====
  const fetchLeaderboard = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("username, wallet_balance")
        .order("wallet_balance", { ascending: false })
        .limit(10);

      if (error) throw error;

      setLeaderboard(data?.map((p: any) => ({
        username: p.username,
        totalWinnings: p.wallet_balance,
      })) || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch leaderboard");
    }
  }, []);

  useEffect(() => {
    if (user) fetchWalletData();
  }, [user, fetchWalletData]);

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
