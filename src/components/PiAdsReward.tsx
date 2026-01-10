import { useState, useEffect } from 'react';
import { Play, Gift, Loader2, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface PiAdsRewardProps {
  isOpen: boolean;
  onClose: () => void;
  onAdComplete: () => void;
  rewardType: 'free_spin' | 'bonus_pi' | 'boost';
}

declare global {
  interface Window {
    PiAds?: {
      init: (config: { appId: string }) => void;
      showRewardedAd: (callbacks: {
        onAdLoaded?: () => void;
        onAdRewarded?: (reward: { amount: number; type: string }) => void;
        onAdClosed?: () => void;
        onAdError?: (error: string) => void;
      }) => void;
      isReady: () => boolean;
    };
  }
}

const PiAdsReward = ({ isOpen, onClose, onAdComplete, rewardType }: PiAdsRewardProps) => {
  const [adState, setAdState] = useState<'loading' | 'ready' | 'watching' | 'complete' | 'error'>('loading');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const { toast } = useToast();

  const rewardInfo = {
    free_spin: { title: 'Watch Ad for Free Spin', reward: '1 Free Spin', icon: '🎰' },
    bonus_pi: { title: 'Watch Ad for Bonus Pi', reward: '0.001 Pi', icon: '💰' },
    boost: { title: 'Watch Ad for 2x Boost', reward: '2x Win Multiplier (1 spin)', icon: '⚡' },
  };

  useEffect(() => {
    if (isOpen) {
      setAdState('loading');
      setProgress(0);
      setErrorMessage('');
      
      // Simulate ad loading (Pi Ads SDK integration point)
      const loadTimer = setTimeout(() => {
        // Check if Pi Ads SDK is available
        if (window.PiAds?.isReady?.()) {
          setAdState('ready');
        } else {
          // Fallback: simulate ad availability for demo
          setAdState('ready');
        }
      }, 1500);

      return () => clearTimeout(loadTimer);
    }
  }, [isOpen]);

  const handleWatchAd = () => {
    setAdState('watching');
    
    // Try to use Pi Ads SDK if available
    if (window.PiAds?.showRewardedAd) {
      window.PiAds.showRewardedAd({
        onAdLoaded: () => setProgress(10),
        onAdRewarded: () => {
          setAdState('complete');
          setTimeout(() => {
            onAdComplete();
            onClose();
          }, 1500);
        },
        onAdClosed: () => {
          if (adState !== 'complete') {
            setAdState('ready');
            toast({
              title: "Ad Closed",
              description: "Watch the full ad to receive your reward",
              variant: "destructive",
            });
          }
        },
        onAdError: (error) => {
          setAdState('error');
          setErrorMessage(error);
        },
      });
    } else {
      // Simulate ad watching for demo/development
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setAdState('complete');
            setTimeout(() => {
              onAdComplete();
              onClose();
            }, 1500);
            return 100;
          }
          return prev + 4;
        });
      }, 200);
    }
  };

  const handleRetry = () => {
    setAdState('loading');
    setErrorMessage('');
    setTimeout(() => setAdState('ready'), 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{rewardInfo[rewardType].icon}</span>
            {rewardInfo[rewardType].title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Reward Preview */}
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Your Reward</p>
            <p className="text-2xl font-bold text-primary">{rewardInfo[rewardType].reward}</p>
          </div>

          {/* Ad State Display */}
          <div className="min-h-[120px] flex items-center justify-center">
            {adState === 'loading' && (
              <div className="text-center space-y-3">
                <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                <p className="text-sm text-muted-foreground">Loading ad...</p>
              </div>
            )}

            {adState === 'ready' && (
              <div className="text-center space-y-4 w-full">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                  <Play className="h-8 w-8 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Watch a short ad to claim your reward
                </p>
                <Button 
                  onClick={handleWatchAd}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Watch Ad (15-30s)
                </Button>
              </div>
            )}

            {adState === 'watching' && (
              <div className="text-center space-y-4 w-full">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-primary/20 flex items-center justify-center mx-auto">
                    <span className="text-2xl font-bold text-primary">
                      {Math.ceil((100 - progress) / 4)}s
                    </span>
                  </div>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  Watching ad... Please don't close this window
                </p>
              </div>
            )}

            {adState === 'complete' && (
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto animate-scale-in">
                  <Gift className="h-8 w-8 text-green-500" />
                </div>
                <p className="text-lg font-semibold text-green-500">Reward Claimed!</p>
                <p className="text-sm text-muted-foreground">
                  {rewardInfo[rewardType].reward} has been added
                </p>
              </div>
            )}

            {adState === 'error' && (
              <div className="text-center space-y-4 w-full">
                <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <p className="text-sm text-destructive">{errorMessage || 'Failed to load ad'}</p>
                <Button onClick={handleRetry} variant="outline" className="w-full">
                  Try Again
                </Button>
              </div>
            )}
          </div>

          {/* Pi Ads Disclaimer */}
          <p className="text-xs text-center text-muted-foreground">
            Powered by Pi Ads • Ads support free rewards
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PiAdsReward;
