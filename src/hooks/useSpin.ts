import { useState, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { piSDK } from "@/lib/pi-sdk";
import { useWallet } from "@/hooks/useWallet";
import { usePiAuth } from "@/hooks/usePiAuth";

export function useSpinUnified() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [targetResult, setTargetResult] = useState<string | null>(null);
  const { user } = usePiAuth(); 
  const { wallet, updateBalance } = useWallet();

  const spin = useCallback(async (spinType: string, cost: number = 0) => {
    if (isSpinning || !user?.username) return null;
    setIsSpinning(true);

    try {
      if (cost > 0) {
        const paymentSuccess = await new Promise<boolean>((resolve) => {
          piSDK.createPayment(cost, `Spin ${spinType}`, {
            onReadyForServerApproval: (id) => console.log("Approved:", id),
            onReadyForServerCompletion: async (id, txid) => {
              const { error } = await supabase.rpc('complete_pi_payment', {
                u_name: user.username, p_amount: cost, p_id: id
              });
              resolve(!error);
            },
            onCancel: () => resolve(false),
            onError: () => resolve(false)
          });
        });

        if (!paymentSuccess) {
          setIsSpinning(false);
          return null;
        }
      }

      const results = ["WIN_0.1", "WIN_0.5", "LOSE", "WIN_1", "JACKPOT_ENTRY"];
      const res = results[Math.floor(Math.random() * results.length)];
      let reward = res.includes("0.1") ? 0.1 : res.includes("0.5") ? 0.5 : res.includes("1") ? 1 : 0;

      setTargetResult(res);
      await updateBalance((Number(wallet.balance) || 0) + reward, true);
      return { success: true, result: res };
    } catch (err) {
      setIsSpinning(false);
      return null;
    }
  }, [isSpinning, user, wallet.balance, updateBalance]);

  return { spin, isSpinning, setIsSpinning, targetResult, setTargetResult, completeAnimation: () => setIsSpinning(false) };
}

export const useSpin = useSpinUnified;
