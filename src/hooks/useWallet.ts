// src/hooks/useWallet.ts - Unified Wallet Hook
import { useState, useEffect, useCallback } from "react";
import { piSDK } from "@/lib/pi-sdk";
import { usePiAuth } from "./usePiAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WalletData {
  balance: number;
  totalSpins: number;
  referralCode: string;
  referralCount: number;
  referralEarnings: number;
  recentSpins?: any[];
  lastFreeSpin?: string | null;
}

interface LeaderboardEntry {
  username: string;
  totalWinnings: number;
}

function useWalletUnified() {
  const { user, profile, canFreeSpin } = usePiAuth();
  const profileId = profile?.id || "";

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

  // ===== Fetch Wallet & Profile (التعديل هنا لإزالة الإزعاج) =====
  const fetchWalletData = useCallback(async (username?: string) => {
    const piUsername = username || user?.username;
    if (!piUsername) return;

    setIsLoading(true);
    try {
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("pi_username", piUsername)
        .maybeSingle();

      if (error) {
        console.warn("Silent notification: Wallet data not ready yet", error.message);
        return;
      }

      if (profileData) {
        setWallet({
          balance: profileData.wallet_balance || 0,
          totalSpins: profileData.total_spins || 0,
          referralCode: profileData.referral_code || "",
          referralCount: profileData.referral_count || 0,
          referralEarnings: profileData.referral_earnings || 0,
          recentSpins: [],
          lastFreeSpin: profileData.last_free_spin || null,
        });
      }

      await fetchLeaderboard();
    } catch (err) {
      // تم إلغاء toast.error هنا لمنع الإزعاج
      console.error("Wallet fetch error (handled):", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // ===== Apply Referral =====
  const applyReferral = useCallback(async (username?: string, ref?: string | null) => {
    if (!ref || !username) return;
    try {
      await supabase.functions.invoke("apply-referral", {
        body: { pi_username: username, referral_code: ref }
      });
      toast.success(`Referral applied successfully!`);
      await fetchWalletData(username);
    } catch (err) {
      console.error("Referral error:", err);
    }
  }, [fetchWalletData]);

  // ===== Update Balance =====
  const updateBalance = useCallback(async (amount: number, saveToDB = false) => {
    setWallet(prev => ({ ...prev, balance: amount }));
    if (saveToDB && profileId) {
      try {
        await supabase.from("profiles").update({ wallet_balance: amount }).eq("id", profileId);
      } catch (err) {
        console.error("Balance update error:", err);
      }
    }
  }, [profileId]);

  // ===== Leaderboard from Supabase =====
  const fetchLeaderboard = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("pi_username, wallet_balance")
        .order("wallet_balance", { ascending: false })
        .limit(10);

      if (error) throw error;

      setLeaderboard(data?.map((p) => ({
        username: p.pi_username,
        totalWinnings: p.wallet_balance || 0,
      })) || []);
    } catch (err) {
      console.error("Leaderboard error:", err);
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
    leaderboard,
    isLoading,
    isPaying,
    setWallet,
    canFreeSpin,
  };
}

export { useWalletUnified };
export const useWallet = useWalletUnified;
export default useWalletUnified;
