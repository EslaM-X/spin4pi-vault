import { useState, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { piSDK } from "@/lib/pi-sdk";
import { useWallet } from "@/hooks/useWallet";
import { usePiAuth } from "@/hooks/usePiAuth";

interface SpinResult {
  success: boolean;
  result: string;
  reward_amount: number;
  profile_id: string;
  next_free_spin_in?: number;
}

export function useSpinUnified() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastResult, setLastResult] = useState<SpinResult | null>(null);
  const [targetResult, setTargetResult] = useState<string | null>(null);

  const { user } = usePiAuth(); 
  const { wallet, updateBalance, profileId, fetchWalletData } = useWallet();

  const spin = useCallback(
    async (spinType: string, cost: number = 0) => {
      if (isSpinning) return null;
      
      if (!user?.username) {
        toast.error("الرجاء تسجيل الدخول أولاً عبر متصفح Pi");
        return null;
      }

      setIsSpinning(true);

      try {
        // 1. معالجة الدفع إذا كانت اللفة مدفوعة
        if (cost > 0) {
          const paymentSuccess = await new Promise<boolean>((resolve) => {
            const callbacks = {
              onReadyForServerApproval: (paymentId: string) => {
                console.log("Payment Approval:", paymentId);
              },
              onReadyForServerCompletion: async (paymentId: string, txid: string) => {
                // الربط مع وظيفة قاعدة البيانات مباشرة
                const { error } = await supabase.rpc('complete_pi_payment', {
                  u_name: user.username,
                  p_amount: cost,
                  p_id: paymentId
                });
                
                if (error) {
                  console.error("Database Sync Error:", error);
                  resolve(false);
                } else {
                  resolve(true);
                }
              },
              onCancel: () => resolve(false),
              onError: () => resolve(false),
            };

            piSDK.createPayment(cost, `Spin ${spinType}`).catch(() => resolve(false));
          });

          if (!paymentSuccess) {
            toast.error("فشلت عملية الدفع أو تم إلغاؤها");
            setIsSpinning(false);
            return null;
          }
        }

        // 2. منطق النتيجة (عشوائي مؤقتاً)
        const possibleResults = ["WIN_0.1", "WIN_0.5", "LOSE", "WIN_1", "JACKPOT_ENTRY"];
        const randomResult = possibleResults[Math.floor(Math.random() * possibleResults.length)];
        let reward = 0;
        if (randomResult.includes("0.1")) reward = 0.1;
        if (randomResult.includes("0.5")) reward = 0.5;
        if (randomResult.includes("1")) reward = 1;

        const mockData: SpinResult = {
          success: true,
          result: randomResult,
          reward_amount: reward,
          profile_id: user.username
        };

        setTargetResult(mockData.result);
        setLastResult(mockData);

        // 3. تحديث الرصيد
        const newBalance = (Number(wallet.balance) || 0) + reward;
        await updateBalance(newBalance, true);

        return mockData;

      } catch (err: any) {
        toast.error("عذراً، حدث خطأ فني");
        setIsSpinning(false);
        return null;
      }
    },
    [isSpinning, user, wallet.balance, updateBalance]
  );

  return {
    spin,
    isSpinning,
    setIsSpinning,
    lastResult,
    targetResult,
    setTargetResult, // أضفنا هذا السطر لضمان توافق الواجهة
    completeAnimation: () => setIsSpinning(false),
  };
}

// السطر السحري لحل مشكلة Vercel:
export const useSpin = useSpinUnified;
export default useSpinUnified;
