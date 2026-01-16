// src/hooks/useSpin.ts - Unified Spin Hook (Enhanced Security Version)
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { piSDK, PaymentCallbacks } from "@/lib/pi-sdk";
import { useWallet } from "@/hooks/useWallet";
import { useSoundEffects } from "@/hooks/useSoundEffects";

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

function useSpinUnified({ onSpinComplete, onError }: UseSpinOptions = {}) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastResult, setLastResult] = useState<SpinResult | null>(null);
  const [targetResult, setTargetResult] = useState<string | null>(null);

  const { wallet, updateBalance, profileId, fetchWalletData } = useWallet();
  const { playResultSound } = useSoundEffects();

  const spin = useCallback(
    async (spinType: string, cost: number = 0) => {
      if (isSpinning) return null;
      if (!profileId) {
        toast.error("User not authenticated!");
        return null;
      }

      setIsSpinning(true);

      try {
        // ===== Paid spin logic with Pi SDK =====
        if (cost > 0) {
          if (!piSDK.isAvailable()) {
            toast.error("Open in Pi Browser to perform paid spin");
            setIsSpinning(false);
            return null;
          }

          const paymentSuccess = await new Promise<boolean>((resolve) => {
            const callbacks: PaymentCallbacks = {
              onReadyForServerApproval: async (paymentId) => {
                try {
                  const { error } = await supabase.functions.invoke("approve-payment", {
                    body: { payment_id: paymentId, pi_username: profileId, amount: cost, memo: `Spin ${spinType}` },
                  });
                  if (error) {
                    console.error("Approval failed:", error);
                    resolve(false);
                  }
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
                  if (error) {
                    console.error("Completion failed:", error);
                    resolve(false);
                  } else {
                    resolve(true);
                  }
                } catch (err) {
                  console.error("Completion error:", err);
                  resolve(false);
                }
              },
              onCancel: () => {
                toast.info("Payment cancelled");
                resolve(false);
              },
              onError: (error) => {
                toast.error("Payment error: " + error.message);
                resolve(false);
              },
            };

            piSDK.createPayment(cost, `Spin ${spinType}`, { pi_username: profileId }, callbacks);
          });

          if (!paymentSuccess) {
            setIsSpinning(false);
            return null;
          }
        }

        // ===== Fetch spin result from Supabase Edge Function =====
        const { data, error } = await supabase.functions.invoke<SpinResult>("spin-result", {
          body: { pi_username: profileId, spin_type: spinType },
        });

        if (error || !data) {
          const msg = error?.message || "Failed to fetch spin result";
          toast.error(msg);
          onError?.(msg);
          setIsSpinning(false);
          return null;
        }

        // Set results for animation
        setTargetResult(data.result);
        setLastResult(data);

        // Notify cooldown if it's a free spin
        if (data.next_free_spin_in) {
          const hours = Math.floor(data.next_free_spin_in / 3600000);
          const mins = Math.floor((data.next_free_spin_in % 3600000) / 60000);
          toast.info(`Next free spin available in ${hours}h ${mins}m`);
        }

        // Update balances and play sounds
        const newBalance = (wallet.balance || 0) + data.reward_amount;
        updateBalance(newBalance, true);
        playResultSound(data.result);

        // Finalize state
        fetchWalletData();
        return data;

      } catch (err) {
        const msg = err instanceof Error ? err.message : "An unexpected error occurred during spin";
        console.error("Spin error:", err);
        toast.error(msg);
        onError?.(msg);
        setIsSpinning(false);
        return null;
      }
    },
    [isSpinning, profileId, wallet, updateBalance, fetchWalletData, onError, playResultSound]
  );

  const completeAnimation = useCallback(() => {
    if (lastResult && onSpinComplete) {
      onSpinComplete(lastResult.result, lastResult.reward_amount);
    }
    setIsSpinning(false);
  }, [lastResult, onSpinComplete]);

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

export { useSpinUnified };
export const useSpin = useSpinUnified;
export default useSpinUnified;
