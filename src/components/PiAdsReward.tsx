import { useState, useEffect } from 'react';
import { Play, Gift, Loader2, X, AlertCircle, Zap, Coins, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

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
    free_spin: { title: 'Imperial Free Spin', reward: '1 Free Spin', icon: <Star className="text-gold" />, color: "from-gold/20" },
    bonus_pi: { title: 'Royal Pi Bounty', reward: '0.001 Pi', icon: <Coins className="text-emerald-400" />, color: "from-emerald-500/10" },
    boost: { title: 'Divine Multiplier', reward: '2x Win Boost', icon: <Zap className="text-blue-400" />, color: "from-blue-500/10" },
  };

  useEffect(() => {
    if (isOpen) {
      setAdState('loading');
      setProgress(0);
      setErrorMessage('');
      
      const loadTimer = setTimeout(() => {
        if (window.PiAds?.isReady?.()) {
          setAdState('ready');
        } else {
          // Fallback للبيئة التطويرية
          setAdState('ready');
        }
      }, 1500);

      return () => clearTimeout(loadTimer);
    }
  }, [isOpen]);

  const handleWatchAd = () => {
    setAdState('watching');
    
    if (window.PiAds?.showRewardedAd) {
      window.PiAds.showRewardedAd({
        onAdLoaded: () => setProgress(5),
        onAdRewarded: () => {
          setAdState('complete');
          setTimeout(() => {
            onAdComplete();
            onClose();
          }, 2000);
        },
        onAdClosed: () => {
          if (adState !== 'complete') {
            setAdState('ready');
            toast({
              title: "Mission Aborted",
              description: "Watch the full scroll to claim your bounty.",
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
      // محاكاة الإعلان للتطوير
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setAdState('complete');
            setTimeout(() => {
              onAdComplete();
              onClose();
            }, 2000);
            return 100;
          }
          return prev + 2;
        });
      }, 100);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[#0d0d12] border-2 border-gold/20 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Background Aura */}
        <div className={`absolute inset-0 bg-gradient-to-b ${rewardInfo[rewardType].color} to-transparent opacity-30 pointer-events-none`} />

        <DialogHeader className="relative z-10">
          <DialogTitle className="flex items-center justify-center gap-3 text-white italic tracking-widest uppercase py-2" style={{ fontFamily: 'Cinzel, serif' }}>
            {rewardInfo[rewardType].icon}
            {rewardInfo[rewardType].title}
          </DialogTitle>
        </DialogHeader>

        <div className="relative z-10 space-y-8 py-4">
          {/* Reward Preview Card */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center backdrop-blur-sm"
          >
            <p className="text-[10px] text-white/40 uppercase tracking-[0.3em] mb-2 font-black">Imperial Offering</p>
            <p className="text-3xl font-black text-gold italic tracking-tighter">
              {rewardInfo[rewardType].reward}
            </p>
          </motion.div>

          {/* Ad Interaction Zone */}
          <div className="min-h-[160px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              {adState === 'loading' && (
                <motion.div key="loading" exit={{ opacity: 0 }} className="text-center space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin text-gold mx-auto opacity-50" />
                  <p className="text-[10px] text-gold/40 uppercase tracking-[0.2em] font-black">Consulting the Oracle...</p>
                </motion.div>
              )}

              {adState === 'ready' && (
                <motion.div 
                  key="ready" 
                  initial={{ y: 20, opacity: 0 }} 
                  animate={{ y: 0, opacity: 1 }}
                  className="text-center space-y-6 w-full px-4"
                >
                  <div className="w-20 h-20 rounded-3xl bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto rotate-12 hover:rotate-0 transition-transform duration-500">
                    <Play className="h-10 w-10 text-gold fill-gold/20" />
                  </div>
                  <Button 
                    onClick={handleWatchAd}
                    className="w-full h-14 bg-gold hover:bg-gold/80 text-black font-black uppercase tracking-[0.2em] rounded-2xl shadow-[0_10px_20px_rgba(251,191,36,0.2)]"
                  >
                    Watch Proclamation
                  </Button>
                </motion.div>
              )}

              {adState === 'watching' && (
                <motion.div key="watching" className="text-center space-y-6 w-full">
                  <div className="relative inline-block">
                    <svg className="w-24 h-24 transform -rotate-90">
                      <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/5" />
                      <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="4" fill="transparent" 
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 - (251.2 * progress) / 100}
                        className="text-gold transition-all duration-300" 
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center font-black text-gold">
                      {Math.ceil((100 - progress) / 5)}s
                    </div>
                  </div>
                  <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-black animate-pulse">
                    Absorbing Ancient Wisdom...
                  </p>
                </motion.div>
              )}

              {adState === 'complete' && (
                <motion.div 
                  key="complete"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center space-y-4"
                >
                  <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                    <Gift className="h-10 w-10 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-black text-emerald-400 uppercase italic">Bounty Secured!</h3>
                </motion.div>
              )}

              {adState === 'error' && (
                <motion.div key="error" className="text-center space-y-4 w-full">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
                  <p className="text-xs text-red-400 font-bold">{errorMessage || 'Transmission Interrupted'}</p>
                  <Button onClick={() => setAdState('ready')} variant="ghost" className="text-white/40 hover:text-white uppercase text-[10px] tracking-widest">
                    Try Again
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <p className="text-[9px] text-center text-white/20 uppercase tracking-[0.2em] font-medium border-t border-white/5 pt-4">
            Authorized by Pi Ads Infrastructure
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PiAdsReward;
