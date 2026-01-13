// src/hooks/useSpinHandler.ts - Spin Handler Hook for Index page
import { useState, useCallback } from "react";
import { toast } from "sonner";

interface SpinFunction {
  (spinType: string, cost?: number): Promise<any>;
}

interface User {
  uid: string;
  username: string;
  accessToken: string;
}

export function useSpinHandler(
  spinFn: SpinFunction,
  updateBalance: (amount: number, saveToDB?: boolean) => void,
  refreshData: () => void,
  refreshProfile: () => Promise<void>
) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [targetResult, setTargetResult] = useState<string | null>(null);

  const handleSpinClick = useCallback(
    async (
      spinType: string,
      cost: number,
      user: User | null,
      canFreeSpin: () => boolean,
      createPayment?: (amount: number, memo: string) => Promise<any>
    ) => {
      if (!user) {
        toast.error("Please login first");
        return;
      }

      if (isSpinning) {
        toast.info("Spin in progress...");
        return;
      }

      // Check free spin availability
      if (spinType === "free" && !canFreeSpin()) {
        toast.info("Free spin not available yet");
        return;
      }

      setIsSpinning(true);

      try {
        const result = await spinFn(spinType, cost);
        
        if (result) {
          setTargetResult(result.result);
          
          // Refresh data after spin
          refreshData();
          await refreshProfile();
        }
      } catch (error) {
        console.error("Spin error:", error);
        toast.error("Spin failed");
      } finally {
        // isSpinning will be reset when animation completes
      }
    },
    [isSpinning, spinFn, refreshData, refreshProfile]
  );

  return {
    isSpinning,
    setIsSpinning,
    targetResult,
    setTargetResult,
    handleSpinClick,
  };
}

export default useSpinHandler;
