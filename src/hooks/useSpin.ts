// src/hooks/useSpinUnified.ts
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { piSDK, PaymentDTO } from "pi-sdk-js";
import { useWallet } from "@/hooks/useWallet";
import { useSoundEffects } from "@/hooks/useSoundEffects";

interface SpinResult {
  success: boolean;
  result: string;
  reward_amount: number;
  profile_id: string;
  next_free_spin_in?: number; // milliseconds
}

interface UseSpinUnifiedOptions {
  onSpinComplete?: (result: string, rewardAmount: number) => void;
  onError?: (error: string) => void;
}

export function useSpinUnified({ onSpinComplete, onError }: UseSpinUnifiedOptions = {}) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastResult, setLastResult] = useState<SpinResult | null>(null);
  const [currentPayment, setCurrentPayment] = useState<PaymentDTO | null>(null);

  const { wallet, updateBalance, profileId, fetchWalletData } = useWallet();
  const { playResultSound } = useSoundEffects(); // 🔊 ربط الأصوات

  const spin = useCallback(
    async (spinType: string, cost: number = 0) => {
      if (isSpinning) return null;
      if (!profileId) {
        toast.error("User not authenticated!");
        return null;
      }

      setIsSpinning(true);

      try {
        // ===== spin مدفوع =====
        if (cost > 0) {
          if (!piSDK.isAvailable()) {
            toast.error("Open in Pi Browser to perform paid spin");
            setIsSpinning(false);
            return null;
          }

          const paymentResult = await new Promise<{ success: boolean; payment?: PaymentDTO }>((resolve) => {
            piSDK.createPayment(cost, `Spin ${spinType}`, { pi_username: profileId }, {
              onReadyForServerApproval: async (paymentId) => {
                try {
                  const { data, error } = await supabase.functions.invoke("approve-payment", {
                    body: { payment_id: paymentId, pi_username: profileId, amount: cost, memo: `Spin ${spinType}` },
                  });
                  if (error) resolve({ success: false });
                  else console.log("Payment approved:", data);
                } catch {
                  resolve({ success: false });
                }
              },
              onReadyForServerCompletion: async (paymentId, txid) => {
                try {
                  const { data, error } = await supabase.functions.invoke("complete-payment", {
                    body: { payment_id: paymentId, txid },
                  });
                  if (error) resolve({ success: false });
                  else resolve({ success: true, payment: { paymentId, txid } as PaymentDTO });
                } catch {
                  resolve({ success: false });
                }
              },
              onCancel: () => resolve({ success: false }),
              onError: () => resolve({ success: false }),
            }).then(p => setCurrentPayment(p || null));
          });

          if (!paymentResult.success) {
            toast.error("Payment failed, spin canceled");
            setIsSpinning(false);
            return null;
          }
        }

        // ===== استدعاء Supabase للحصول على نتيجة spin =====
        const { data, error } = await supabase.functions.invoke<SpinResult>("spin-result", {
          body: { profile_id: profileId, spin_type: spinType },
        });

        if (error || !data) {
          const msg = error?.message || "Spin failed";
          toast.error(msg);
          onError?.(msg);
          setIsSpinning(false);
          return null;
        }

        // ===== free spin cooldown =====
        if (data.next_free_spin_in) {
          const hours = Math.floor(data.next_free_spin_in / 3600000);
          const mins = Math.floor((data.next_free_spin_in % 3600000) / 60000);
          toast.info(`Next free spin available in ${hours}h ${mins}m`);
        }

        // ===== تحديث wallet بالـ reward =====
        const newBalance = (wallet.balance || 0) + data.reward_amount;
        updateBalance(newBalance, true);

        setLastResult(data);

        // ===== تشغيل الصوت المناسب تلقائيًا =====
        playResultSound(data.result);

        // ===== animation واقعي للعجلة =====
        await new Promise<void>((resolve) => {
          const totalDuration = 3000 + Math.random() * 2000;
          const frames = 60;
          let frame = 0;
          const interval = setInterval(() => {
            frame++;
            if (frame >= frames) {
              clearInterval(interval);
              resolve();
            }
          }, totalDuration / frames);
        });

        // callback بعد spin
        onSpinComplete?.(data.result, data.reward_amount);

        // تحديث بيانات wallet بعد spin
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
    [isSpinning, profileId, wallet, updateBalance, fetchWalletData, onSpinComplete, onError, playResultSound]
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
    currentPayment,
    completeAnimation,
  };
                       }
