// src/hooks/useWallet.ts
import { useState, useEffect, useCallback } from "react";
import { usePiAuth } from "./usePiAuth";
import { piSDK } from "pi-sdk-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WalletData {
  balance: number;
  totalSpins: number;
  referralCode: string;
  referralCount: number;
  referralEarnings: number;
}

export function useWallet() {
  const { user } = usePiAuth();
  const profileId = user?.uid || ""; // استخدم UID بدل username لتجنب التعارض
  const [wallet, setWallet] = useState<WalletData>({
    balance: 0,
    totalSpins: 0,
    referralCode: "",
    referralCount: 0,
    referralEarnings: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  // ======= Fetch wallet data =======
  const fetchWalletData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // 1. جلب بيانات من Supabase
      const { data, error } = await supabase
        .from("wallets")
        .select("*")
        .eq("pi_uid", profileId)
        .maybeSingle();

      if (error) throw error;

      // 2. لو موجود بيانات، نحدث state
      if (data) {
        setWallet({
          balance: data.balance,
          totalSpins: data.total_spins,
          referralCode: data.referral_code,
          referralCount: data.referral_count,
          referralEarnings: data.referral_earnings,
        });
      } else {
        // إنشاء سجل جديد في Supabase لو مش موجود
        const { data: newWallet, error: insertError } = await supabase
          .from("wallets")
          .insert({
            pi_uid: profileId,
            balance: 0,
            total_spins: 0,
            referral_code: `REF-${Math.floor(Math.random() * 100000)}`,
            referral_count: 0,
            referral_earnings: 0,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        setWallet({
          balance: newWallet.balance,
          totalSpins: newWallet.total_spins,
          referralCode: newWallet.referral_code,
          referralCount: newWallet.referral_count,
          referralEarnings: newWallet.referral_earnings,
        });
      }

      // 3. جلب الرصيد الفعلي من Pi Wallet API إذا متاح
      if (piSDK.isAvailable()) {
        try {
          const balance = await piSDK.getBalance(); // افترض أن SDK يوفر دالة getBalance
          setWallet((prev) => ({ ...prev, balance }));
        } catch (err) {
          console.warn("Failed to fetch Pi Wallet balance:", err);
        }
      }
    } catch (err) {
      console.error("Failed to fetch wallet data:", err);
      toast.error("Failed to fetch wallet data");
    } finally {
      setIsLoading(false);
    }
  }, [profileId, user]);

  // ======= Apply referral =======
  const applyReferral = useCallback(
    async (referralCode: string) => {
      if (!user || !referralCode) return;
      try {
        // تحديث Supabase
        const { data, error } = await supabase
          .from("wallets")
          .update({
            referral_code: referralCode,
            referral_count: wallet.referralCount + 1,
          })
          .eq("pi_uid", profileId)
          .select()
          .single();

        if (error) throw error;

        setWallet((prev) => ({
          ...prev,
          referralCode: data.referral_code,
          referralCount: data.referral_count,
        }));

        toast.success(`Referral ${referralCode} applied!`);
      } catch (err) {
        console.error("Failed to apply referral:", err);
        toast.error("Failed to apply referral");
      }
    },
    [profileId, user, wallet.referralCount]
  );

  // ======= Update balance =======
  const updateBalance = useCallback(
    async (amount: number) => {
      if (!user) return;

      // تحديث Supabase
      try {
        const { data, error } = await supabase
          .from("wallets")
          .update({ balance: amount })
          .eq("pi_uid", profileId)
          .select()
          .single();

        if (error) throw error;

        setWallet((prev) => ({ ...prev, balance: data.balance }));
      } catch (err) {
        console.error("Failed to update balance:", err);
        toast.error("Failed to update balance");
      }
    },
    [profileId, user]
  );

  return {
    wallet,
    profileId,
    fetchWalletData,
    applyReferral,
    updateBalance,
    isLoading,
    setWallet,
  };
}
