// src/hooks/useWallet.ts
import { useState } from "react";
import { usePiAuth } from "./usePiAuth"; // لو عندك hook auth
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
  const profileId = user?.username || '';

  const [wallet, setWallet] = useState<WalletData>({
    balance: 0,
    totalSpins: 0,
    referralCode: '',
    referralCount: 0,
    referralEarnings: 0,
  });

  // ======= Fetch wallet data =======
  const fetchWalletData = async (username: string) => {
    try {
      // لو عندك API رسمي من Pi Wallet أو Pi Network استخدمه هنا
      // دلوقتي مجرد mock للـ build
      setWallet({
        balance: 100,           // رصيد افتراضي
        totalSpins: 5,          // إجمالي عدد اللفات
        referralCode: "REF123", // رمز إحالة افتراضي
        referralCount: 2,
        referralEarnings: 10,
      });
    } catch (err) {
      console.error("Error fetching wallet data:", err);
      toast.error("Failed to fetch wallet data");
    }
  };

  // ======= Apply referral =======
  const applyReferral = async (username: string, ref?: string) => {
    if (!ref) return;
    // لو عندك API رسمي استخدمه هنا
    console.log(`Applying referral ${ref} for ${username}`);
    toast.success(`Referral ${ref} applied for ${username}`);
  };

  // ======= Update balance =======
  const updateBalance = (amount: number) => {
    setWallet(prev => ({ ...prev, balance: amount }));
  };

  return {
    wallet,
    profileId,
    fetchWalletData,
    applyReferral,
    updateBalance,
    setWallet,
  };
}
