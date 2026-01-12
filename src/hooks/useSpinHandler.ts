import { useState } from "react";
import { toast } from "sonner";

type SpinFn = (type: string, cost: number) => Promise<void>;

export function useSpinHandler(
  spinFn: SpinFn,
  updateBalance: (amount: number) => void,
  refreshData: () => void,
  refreshProfile: () => void
) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [targetResult, setTargetResult] = useState<number | null>(null);

  const handleSpinClick = async (type: string, cost: number, user: any, canFreeSpin: boolean, createPayment: any) => {
    if (!user) {
      toast.error("You must be logged in to spin!");
      return;
    }

    if (isSpinning) return;

    setIsSpinning(true);

    try {
      // هنا ممكن تحط logic حقيقي للـ spin أو Pi SDK
      await spinFn(type, cost);

      // تحديث افتراضي للـ target result
      setTargetResult(Math.floor(Math.random() * 100));

      // تحديث افتراضي للرصيد
      updateBalance(user.balance - cost);

      // تحديث البيانات
      refreshData();
      refreshProfile();
    } catch (err) {
      console.error(err);
      toast.error("Spin failed!");
    } finally {
      setIsSpinning(false);
    }
  };

  return {
    isSpinning,
    setIsSpinning,
    targetResult,
    setTargetResult,
    handleSpinClick,
  };
}
