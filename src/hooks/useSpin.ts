// src/hooks/useSpin.ts
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { piSDK } from "pi-sdk-js";
import { useWallet } from "@/hooks/useWallet";

interface SpinResult {
  success: boolean;
  result: string;
  reward_amount: number;
  profile_id: string;
  next_free_spin_in?: number; // milliseconds
}

interface UseSpinOptions {
  onSpinComplete?: (result: string, rewardAmount: number) => void;
  onError?: (error: string) => void;
}

export function useSpin({ onSpinComplete, onError }: UseSpinOptions = {}) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastResult, setLastResult] = useState<SpinResult | null>(null);

  // 🔑 ربط بالـ Wallet الحالي
  const { wallet, updateBalance, profileId, fetchWalletData } = useWallet();

  const spin = useCallback(
    async (spinType: string, cost: number = 0) => {
      if (isSpinning) return null;
      if (!profileId) {
        toast.error("User not authenticated!");
        return null;
      }

      setIsSpinning(true);

      try {
        // ===== الدفع باستخدام Pi SDK لو spin مدفوع =====
        if (cost > 0) {
          if (!piSDK.isAvailable()) {
            toast.error("Open in Pi Browser to perform paid spin");
            setIsSpinning(false);
            return null;
          }

          const paymentResult = await piSDK.requestPayment({
            amount: cost,
            reason: `Spin ${spinType}`,
          });

          if (!paymentResult.success) {
            toast.error("Payment failed, spin canceled");
            setIsSpinning(false);
            return null;
          }
        }

        // ===== استدعاء Supabase Function للحصول على نتيجة الSpin =====
        const { data, error } = await supabase.functions.invoke<SpinResult>(
          "spin-result",
          { body: { profile_id: profileId, spin_type: spinType } }
        );

        if (error || !data) {
          const msg = error?.message || "Spin failed";
          toast.error(msg);
          onError?.(msg);
          setIsSpinning(false);
          return null;
        }

        // ===== معالجة الـ Free Spin cooldown =====
        if (data.next_free_spin_in) {
          const hours = Math.floor(data.next_free_spin_in / 3600000);
          const mins = Math.floor((data.next_free_spin_in % 3600000) / 60000);
          toast.info(`Next free spin available in ${hours}h ${mins}m`);
        }

        // ===== تحديث wallet بالـ reward =====
        const newBalance = (wallet.balance || 0) + data.reward_amount;
        updateBalance(newBalance, true);

        setLastResult(data);

        // callback بعد الSpin
        onSpinComplete?.(data.result, data.reward_amount);

        // تحديث بيانات المحفظة من Supabase بعد Spin
        fetchWalletData();

        return data;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Spin failed";
        console.error("Spin error:", err);
        toast.error(msg);
        onError?.(msg);
        return null;
      } finally {
        setIsSpinning(false);
      }
    },
    [isSpinning, wallet, profileId, updateBalance, fetchWalletData, onSpinComplete, onError]
  );

  const completeAnimation = useCallback(() => {
    if (lastResult) {
      onSpinComplete?.(lastResult.result, lastResult.reward_amount);
    }
    setIsSpinning(false);
  }, [lastResult, onSpinComplete]);

  return {
    spin,
    isSpinning,
    setIsSpinning,
    lastResult,
    completeAnimation,
  };
}
