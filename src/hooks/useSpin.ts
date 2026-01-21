import { useState, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { piSDK, PaymentCallbacks } from "@/lib/pi-sdk";
import { useWallet } from "@/hooks/useWallet";
import { usePiAuth } from "@/hooks/usePiAuth"; // أضفنا هذا لجلب اسم المستخدم الحقيقي

interface SpinResult {
  success: boolean;
  result: string;
  reward_amount: number;
  profile_id: string;
  next_free_spin_in?: number;
}

interface UseSpinOptions {
  onSpinComplete?: ((result: string, rewardAmount: number) => void) | null;
  onError?: (error: string) => void;
}

export function useSpinUnified({ onSpinComplete, onError }: UseSpinOptions = {}) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastResult, setLastResult] = useState<SpinResult | null>(null);
  const [targetResult, setTargetResult] = useState<string | null>(null);

  const { user } = usePiAuth(); // لجلب اليوزر نيم
  const { wallet, updateBalance, profileId, fetchWalletData } = useWallet();

  const spin = useCallback(
    async (spinType: string, cost: number = 0) => {
      if (isSpinning) return null;
      
      // التأكد من وجود المستخدم
      if (!user?.username || !profileId) {
        toast.error("Imperial Shield: Authentication Required");
        return null;
      }

      setIsSpinning(true);

      try {
        // 1. معالجة الدفع عبر Pi SDK إذا كانت اللفة مدفوعة
        if (cost > 0) {
          if (!piSDK.isAvailable()) {
            toast.error("Please open in Pi Browser for paid spins");
            setIsSpinning(false);
            return null;
          }

          const paymentSuccess = await new Promise<boolean>((resolve) => {
            const callbacks: PaymentCallbacks = {
              onReadyForServerApproval: async (paymentId) => {
                try {
                  await supabase.functions.invoke("approve-payment", {
                    body: { payment_id: paymentId, pi_username: user.username, amount: cost, memo: `Spin ${spinType}` },
                  });
                } catch (err) {
                  console.error("Approval error:", err);
                  resolve(false);
                }
              },
              onReadyForServerCompletion: async (paymentId, txid) => {
                try {
                  const { error } = await supabase.functions.invoke("complete-payment", {
                    body: { payment_id: paymentId, txid },
                  });
                  if (error) resolve(false);
                  else resolve(true);
                } catch (err) {
                  resolve(false);
                }
              },
              onCancel: () => {
                toast.info("Payment cancelled by user");
                resolve(false);
              },
              onError: (error) => {
                toast.error("Pi Network Error: " + error.message);
                resolve(false);
              },
            };

            // إنشاء عملية الدفع
            piSDK.createPayment(cost, `Imperial Spin ${spinType}`, { pi_username: user.username }, callbacks);
          });

          if (!paymentSuccess) {
            setIsSpinning(false);
            return null;
          }
        }

        // 2. طلب نتيجة اللفة من السيرفر (Edge Function)
        const { data, error } = await supabase.functions.invoke<SpinResult>("spin-result", {
          body: { pi_username: user.username, spin_type: spinType },
        });

        if (error || !data) {
          throw new Error(error?.message || "Empire connection lost");
        }

        // 3. تحديث الحالة لبدء أنيميشن العجلة
        setTargetResult(data.result);
        setLastResult(data);

        // 4. تحديث الرصيد في الواجهة وقاعدة البيانات
        const currentBalance = Number(wallet.balance) || 0;
        const newBalance = currentBalance + Number(data.reward_amount);
        
        // تحديث الرصيد وحفظه
        await updateBalance(newBalance, true);

        return data;

      } catch (err: any) {
        toast.error(err.message || "An unexpected error occurred");
        onError?.(err.message);
        setIsSpinning(false);
        return null;
      }
    },
    [isSpinning, user, profileId, wallet.balance, updateBalance, onError]
  );

  // دالة تُستدعى عند انتهاء أنيميشن العجلة (توضع في OnComplete الخاص بـ SpinWheel)
  const completeAnimation = useCallback(() => {
    if (lastResult) {
      if (onSpinComplete) {
        onSpinComplete(lastResult.result, lastResult.reward_amount);
      }
      // إشعار بالتبريد (Cooldown) للفة المجانية
      if (lastResult.next_free_spin_in) {
        fetchWalletData(); // تحديث أوقات اللفات المجانية
      }
    }
    setIsSpinning(false);
  }, [lastResult, onSpinComplete, fetchWalletData]);

  return {
    spin,
    isSpinning,
    setIsSpinning,
    lastResult,
    targetResult,
    setTargetResult,
    completeAnimation,
  };
}

export const useSpin = useSpinUnified;
export default useSpinUnified;
