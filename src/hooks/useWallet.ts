import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePiAuth } from "./usePiAuth";
import { toast } from "sonner";

interface WalletData {
  balance: number;
  totalSpins: number;
  referralCode: string;
  referralCount: number;
  referralEarnings: number;
  lastFreeSpin?: string | null;
}

interface LeaderboardEntry {
  username: string;
  totalWinnings: number;
}

export const useWallet = () => {
  const { user, profile, canFreeSpin } = usePiAuth();
  const profileId = profile?.id || "";

  const [wallet, setWallet] = useState<WalletData>({
    balance: 0,
    totalSpins: 0,
    referralCode: "",
    referralCount: 0,
    referralEarnings: 0,
    lastFreeSpin: null,
  });

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // جلب البيانات من Supabase
  const fetchWalletData = useCallback(async (username?: string) => {
    const piUsername = username || user?.username;
    if (!piUsername) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("pi_username", piUsername)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setWallet({
          balance: Number(data.wallet_balance || 0),
          totalSpins: data.total_spins || 0,
          referralCode: data.referral_code || "",
          referralCount: data.referral_count || 0,
          referralEarnings: Number(data.referral_earnings || 0),
          lastFreeSpin: data.last_free_spin || null,
        });
      }
      await fetchLeaderboard();
    } catch (err) {
      console.warn("Wallet sync silent:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // تطبيق نظام الإحالة
  const applyReferral = useCallback(async (username?: string, ref?: string | null) => {
    if (!ref || !username) return;
    try {
      await supabase.functions.invoke("apply-referral", {
        body: { pi_username: username, referral_code: ref }
      });
      toast.success(`Imperial Legion: Referral applied!`);
      await fetchWalletData(username);
    } catch (err) {
      console.error("Referral error:", err);
    }
  }, [fetchWalletData]);

  // تحديث الرصيد بشكل آمن
  const updateBalance = useCallback(async (newBalance: number, saveToDB = true) => {
    // تحديث الواجهة فوراً
    setWallet(prev => ({ ...prev, balance: newBalance }));
    
    // حفظ في قاعدة البيانات إذا طلب ذلك
    if (saveToDB && profileId) {
      try {
        const { error } = await supabase
          .from("profiles")
          .update({ wallet_balance: newBalance })
          .eq("id", profileId);
        
        if (error) throw error;
      } catch (err) {
        console.error("Balance sync error:", err);
        toast.error("Treasury Sync Failed");
      }
    }
  }, [profileId]);

  // جلب المتصدرين
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
      console.error("Leaderboard fetch error:", err);
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
    setWallet,
    canFreeSpin,
  };
};

export default useWallet;
