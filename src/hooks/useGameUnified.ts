// src/hooks/useGameUnified.ts
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
  achievementUnlocked?: boolean;
}

interface UseGameOptions {
  onSpinComplete?: (result: string, rewardAmount: number) => void;
  onError?: (error: string) => void;
}

export function useGameUnified({ onSpinComplete, onError }: UseGameOptions = {}) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastResult, setLastResult] = useState<SpinResult | null>(null);
  const { wallet, updateBalance, profileId, fetchWalletData } = useWallet();
  const { playSpinSound, playWinSound, playLoseSound, playJackpotSound, playAchievementSound } = useSoundEffects();

  // ===== Spin function =====
  const spin = useCallback(async (spinType: string, cost: number = 0) => {
    if (isSpinning) return null;
    if (!profileId) {
      toast.error("User not authenticated!");
      return null;
    }

    setIsSpinning(true);
    playSpinSound();

    try {
      // 💰 Paid spin using Pi SDK with proper callbacks
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
                await supabase.functions.invoke("approve-payment", {
                  body: { payment_id: paymentId, pi_username: profileId, amount: cost, memo: `Spin ${spinType}` },
                });
              } catch {
                resolve(false);
              }
            },
            onReadyForServerCompletion: async (paymentId, txid) => {
              try {
                await supabase.functions.invoke("complete-payment", {
                  body: { payment_id: paymentId, txid },
                });
                resolve(true);
              } catch {
                resolve(false);
              }
            },
            onCancel: () => resolve(false),
            onError: () => resolve(false),
          };

          piSDK.createPayment(cost, `Spin ${spinType}`, { pi_username: profileId }, callbacks);
        });

        if (!paymentSuccess) {
          toast.error("Payment failed, spin canceled");
          setIsSpinning(false);
          return null;
        }
      }

      // 🔄 Call Supabase function for result
      const { data, error } = await supabase.functions.invoke<SpinResult>("spin-result", {
        body: { pi_username: profileId, spin_type: spinType },
      });

      if (error || !data) {
        const msg = error?.message || "Spin failed";
        toast.error(msg);
        onError?.(msg);
        setIsSpinning(false);
        return null;
      }

      // ⏱ Free spin cooldown
      if (data.next_free_spin_in) {
        const hours = Math.floor(data.next_free_spin_in / 3600000);
        const mins = Math.floor((data.next_free_spin_in % 3600000) / 60000);
        toast.info(`Next free spin available in ${hours}h ${mins}m`);
      }

      // 💵 Update wallet with reward
      const newBalance = (wallet.balance || 0) + data.reward_amount;
      updateBalance(newBalance, true);

      setLastResult(data);
      onSpinComplete?.(data.result, data.reward_amount);
      fetchWalletData();

      // 🔊 Play appropriate sound
      if (data.result === "LOSE") playLoseSound();
      else if (data.result === "JACKPOT_ENTRY") playJackpotSound();
      else playWinSound();

      if (data.achievementUnlocked) playAchievementSound();

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
  }, [isSpinning, wallet, profileId, updateBalance, fetchWalletData, onSpinComplete, onError, playSpinSound, playWinSound, playLoseSound, playJackpotSound, playAchievementSound]);

  // ===== Share functions =====
  const shareAchievement = useCallback((achievementName: string, rewardPi: number) => {
    const title = '🏆 Achievement Unlocked!';
    const message = `I just unlocked the "${achievementName}" achievement and earned ${rewardPi} π! 🎉`;
    if (piSDK.isAvailable()) piSDK.shareDialog(title, message);
    else fallbackShare(title, message);
  }, []);

  const shareTournamentWin = useCallback((tournamentName: string, rank: number, prize: number) => {
    const title = '🏆 Tournament Victory!';
    const rankEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉';
    const message = `${rankEmoji} I just placed #${rank} in "${tournamentName}" and won ${prize.toFixed(2)} π! 🎰`;
    if (piSDK.isAvailable()) piSDK.shareDialog(title, message);
    else fallbackShare(title, message);
  }, []);

  const shareReferral = useCallback((referralCode: string) => {
    const title = '🎰 Join Spin4Pi!';
    const message = `Use my referral code "${referralCode}" to get a bonus when you sign up! 🎁`;
    if (piSDK.isAvailable()) piSDK.shareDialog(title, message);
    else fallbackShare(title, message);
  }, []);

  return {
    spin,
    isSpinning,
    setIsSpinning,
    lastResult,
    completeAnimation: () => lastResult && onSpinComplete?.(lastResult.result, lastResult.reward_amount),
    shareAchievement,
    shareTournamentWin,
    shareReferral,
  };
}

// Fallback share
function fallbackShare(title: string, message: string) {
  if (navigator.share) navigator.share({ title, text: message }).catch(() => copyToClipboard(message));
  else copyToClipboard(message);
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(() => toast.success('Message copied to clipboard!')).catch(() => toast.error('Failed to share'));
}
