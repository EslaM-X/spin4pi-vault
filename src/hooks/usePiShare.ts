import { useCallback } from 'react';
import { piSDK } from '@/lib/pi-sdk';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useWallet } from './useWallet';

interface ShareOptions {
  title: string;
  message: string;
}

export function usePiShare() {
  const { profileId, wallet, updateBalance } = useWallet();

  // ===== Achievement Share =====
  const shareAchievement = useCallback(async (achievementName: string, rewardPi: number) => {
    const title = '🏆 Achievement Unlocked!';
    const message = `I just unlocked the "${achievementName}" achievement on Spin4Pi and earned ${rewardPi} π! 🎉\n\nJoin me and start spinning to win Pi! 🎰✨`;

    try {
      if (piSDK.isAvailable()) {
        await piSDK.shareDialog(title, message);
        toast.success('Share dialog opened!');
      } else {
        fallbackShare(title, message);
      }

      // ===== سجل المشاركة في Supabase + اعطاء المكافأة =====
      if (profileId) {
        await supabase.from('shares').insert({
          profile_id: profileId,
          type: 'achievement',
          title,
          message,
          reward_pi: rewardPi,
          created_at: new Date(),
        });

        // تحديث رصيد Pi في wallet
        const newBalance = (wallet.balance || 0) + rewardPi;
        updateBalance(newBalance, true);
      }
    } catch (error) {
      console.error('Share Achievement error:', error);
      toast.error('Failed to share achievement');
    }
  }, [profileId, wallet, updateBalance]);

  // ===== Tournament Share =====
  const shareTournamentWin = useCallback(async (tournamentName: string, rank: number, prize: number) => {
    const title = '🏆 Tournament Victory!';
    const rankEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉';
    const message = `${rankEmoji} I just placed #${rank} in the "${tournamentName}" tournament on Spin4Pi and won ${prize.toFixed(2)} π! 🎉\n\nCompete with me next time! 🎰`;

    try {
      if (piSDK.isAvailable()) {
        await piSDK.shareDialog(title, message);
        toast.success('Share dialog opened!');
      } else {
        fallbackShare(title, message);
      }

      if (profileId) {
        await supabase.from('shares').insert({
          profile_id: profileId,
          type: 'tournament',
          title,
          message,
          reward_pi: prize,
          created_at: new Date(),
        });

        const newBalance = (wallet.balance || 0) + prize;
        updateBalance(newBalance, true);
      }
    } catch (error) {
      console.error('Share Tournament error:', error);
      toast.error('Failed to share tournament');
    }
  }, [profileId, wallet, updateBalance]);

  // ===== Referral Share =====
  const shareReferral = useCallback(async (referralCode: string) => {
    const title = '🎰 Join Spin4Pi!';
    const message = `Hey! I'm playing Spin4Pi and earning Pi tokens! Use my referral code "${referralCode}" to get a bonus when you sign up! 🎁✨`;

    try {
      if (piSDK.isAvailable()) {
        await piSDK.shareDialog(title, message);
        toast.success('Share dialog opened!');
      } else {
        fallbackShare(title, message);
      }

      if (profileId) {
        await supabase.from('shares').insert({
          profile_id: profileId,
          type: 'referral',
          title,
          message,
          reward_pi: 0, // Referral reward يتم عادة عند التسجيل
          created_at: new Date(),
        });
      }
    } catch (error) {
      console.error('Share Referral error:', error);
      toast.error('Failed to share referral');
    }
  }, [profileId]);

  // ===== Custom Share =====
  const shareCustom = useCallback(async (options: ShareOptions) => {
    try {
      if (piSDK.isAvailable()) {
        await piSDK.shareDialog(options.title, options.message);
        toast.success('Share dialog opened!');
      } else {
        fallbackShare(options.title, options.message);
      }
    } catch (error) {
      console.error('Share Custom error:', error);
      toast.error('Failed to share');
    }
  }, []);

  return {
    shareAchievement,
    shareTournamentWin,
    shareReferral,
    shareCustom,
  };
}

// Fallback
function fallbackShare(title: string, message: string) {
  if (navigator.share) {
    navigator.share({ title, text: message }).catch((error) => {
      if (error.name !== 'AbortError') {
        console.error('Share error:', error);
        copyToClipboard(message);
      }
    });
  } else {
    copyToClipboard(message);
  }
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    toast.success('Message copied to clipboard!');
  }).catch(() => {
    toast.error('Failed to share');
  });
}
