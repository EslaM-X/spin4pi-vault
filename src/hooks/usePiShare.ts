import { useCallback } from 'react';
import { piSDK } from '@/lib/pi-sdk';
import { toast } from 'sonner';

interface ShareOptions {
  title: string;
  message: string;
}

export function usePiShare() {
  const shareAchievement = useCallback((achievementName: string, rewardPi: number) => {
    const title = '🏆 Achievement Unlocked!';
    const message = `I just unlocked the "${achievementName}" achievement on Spin4Pi and earned ${rewardPi} π! 🎉\n\nJoin me and start spinning to win Pi! 🎰✨`;

    if (piSDK.isAvailable()) {
      try {
        piSDK.shareDialog(title, message);
        toast.success('Share dialog opened!');
      } catch (error) {
        console.error('Pi share error:', error);
        fallbackShare(title, message);
      }
    } else {
      fallbackShare(title, message);
    }
  }, []);

  const shareTournamentWin = useCallback((tournamentName: string, rank: number, prize: number) => {
    const title = '🏆 Tournament Victory!';
    const rankEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉';
    const message = `${rankEmoji} I just placed #${rank} in the "${tournamentName}" tournament on Spin4Pi and won ${prize.toFixed(2)} π! 🎉\n\nCompete with me next time! 🎰`;

    if (piSDK.isAvailable()) {
      try {
        piSDK.shareDialog(title, message);
        toast.success('Share dialog opened!');
      } catch (error) {
        console.error('Pi share error:', error);
        fallbackShare(title, message);
      }
    } else {
      fallbackShare(title, message);
    }
  }, []);

  const shareReferral = useCallback((referralCode: string) => {
    const title = '🎰 Join Spin4Pi!';
    const message = `Hey! I'm playing Spin4Pi and earning Pi tokens! Use my referral code "${referralCode}" to get a bonus when you sign up! 🎁✨`;

    if (piSDK.isAvailable()) {
      try {
        piSDK.shareDialog(title, message);
        toast.success('Share dialog opened!');
      } catch (error) {
        console.error('Pi share error:', error);
        fallbackShare(title, message);
      }
    } else {
      fallbackShare(title, message);
    }
  }, []);

  const shareCustom = useCallback((options: ShareOptions) => {
    if (piSDK.isAvailable()) {
      try {
        piSDK.shareDialog(options.title, options.message);
        toast.success('Share dialog opened!');
      } catch (error) {
        console.error('Pi share error:', error);
        fallbackShare(options.title, options.message);
      }
    } else {
      fallbackShare(options.title, options.message);
    }
  }, []);

  return {
    shareAchievement,
    shareTournamentWin,
    shareReferral,
    shareCustom,
  };
}

// Fallback for when Pi SDK is not available
function fallbackShare(title: string, message: string) {
  if (navigator.share) {
    navigator.share({
      title,
      text: message,
    }).catch((error) => {
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
