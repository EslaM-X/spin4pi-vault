import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SpinResult {
  success: boolean;
  result: string;
  reward_amount: number;
  profile_id: string;
}

interface UseSpinOptions {
  onSpinComplete?: (result: string, rewardAmount: number) => void;
  onError?: (error: string) => void;
}

export function useSpin({ onSpinComplete, onError }: UseSpinOptions = {}) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastResult, setLastResult] = useState<SpinResult | null>(null);

  const spin = useCallback(async (piUsername: string, spinType: string) => {
    if (isSpinning) return null;
    
    setIsSpinning(true);

    try {
      const { data, error } = await supabase.functions.invoke('spin-result', {
        body: { pi_username: piUsername, spin_type: spinType }
      });

      if (error) {
        console.error('Spin error:', error);
        const errorMessage = error.message || 'Spin failed';
        onError?.(errorMessage);
        toast.error(errorMessage);
        setIsSpinning(false);
        return null;
      }

      if (data?.error) {
        console.error('Spin API error:', data.error);
        onError?.(data.error);
        
        if (data.next_free_spin_in) {
          const hours = Math.floor(data.next_free_spin_in / 3600000);
          const mins = Math.floor((data.next_free_spin_in % 3600000) / 60000);
          toast.error(`Free spin available in ${hours}h ${mins}m`);
        } else {
          toast.error(data.error);
        }
        setIsSpinning(false);
        return null;
      }

      setLastResult(data);
      return data as SpinResult;

    } catch (err) {
      console.error('Spin error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Spin failed';
      onError?.(errorMessage);
      toast.error(errorMessage);
      setIsSpinning(false);
      return null;
    }
  }, [isSpinning, onError]);

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
