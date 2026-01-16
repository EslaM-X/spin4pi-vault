import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Gift, Loader2, CheckCircle2, AlertCircle, Tv } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AdSpinRewardProps {
  isOpen: boolean;
  onClose: () => void;
  onSpinEarned: () => void;
  piUsername: string;
}

// Minimum ads to watch for a free spin (ensures ad revenue > spin cost)
const MIN_ADS_REQUIRED = 3;
const S4P_PER_AD = 10;

export function AdSpinReward({ isOpen, onClose, onSpinEarned, piUsername }: AdSpinRewardProps) {
  const [adsWatched, setAdsWatched] = useState(0);
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adProgress, setAdProgress] = useState(0);

  const canClaim = adsWatched >= MIN_ADS_REQUIRED;
  const s4pReward = adsWatched * S4P_PER_AD;

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setAdsWatched(0);
      setClaimSuccess(false);
      setError(null);
    }
  }, [isOpen]);

  const watchAd = useCallback(async () => {
    setIsWatchingAd(true);
    setAdProgress(0);
    setError(null);

    try {
      // Try to use Pi Ads SDK if available
      if (typeof window !== 'undefined' && (window as any).PiAds?.showRewardedAd) {
        const result = await (window as any).PiAds.showRewardedAd();
        if (result?.completed) {
          setAdsWatched(prev => prev + 1);
          toast.success("إعلان مكتمل!", { description: `+${S4P_PER_AD} S4P` });
        }
      } else {
        // Simulate ad watching with progress
        const duration = 5000; // 5 seconds per ad
        const interval = 100;
        const steps = duration / interval;
        let currentStep = 0;

        await new Promise<void>((resolve) => {
          const timer = setInterval(() => {
            currentStep++;
            setAdProgress((currentStep / steps) * 100);
            if (currentStep >= steps) {
              clearInterval(timer);
              resolve();
            }
          }, interval);
        });

        setAdsWatched(prev => prev + 1);
        toast.success("إعلان مكتمل!", { description: `+${S4P_PER_AD} S4P` });
      }
    } catch (err) {
      console.error('Ad error:', err);
      setError("فشل تحميل الإعلان. حاول مرة أخرى.");
    } finally {
      setIsWatchingAd(false);
      setAdProgress(0);
    }
  }, []);

  const claimFreeSpin = async () => {
    if (!canClaim || isClaiming) return;

    setIsClaiming(true);
    setError(null);

    try {
      const { data, error: claimError } = await supabase.functions.invoke('claim-ad-spin', {
        body: { pi_username: piUsername, ads_watched: adsWatched }
      });

      if (claimError) {
        throw new Error(claimError.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setClaimSuccess(true);
      toast.success("🎉 حصلت على لفة مجانية!", {
        description: `+${s4pReward} S4P tokens`
      });

      setTimeout(() => {
        onSpinEarned();
        onClose();
      }, 1500);

    } catch (err: any) {
      console.error('Claim error:', err);
      setError(err.message || "فشل المطالبة. حاول مرة أخرى.");
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-gradient-to-br from-card via-card to-primary/5 border-primary/20 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-display">
            <Tv className="w-6 h-6 text-gold" />
            شاهد إعلانات واحصل على لفة مجانية
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Progress indicator */}
          <div className="text-center">
            <div className="flex justify-center gap-2 mb-3">
              {Array.from({ length: MIN_ADS_REQUIRED }).map((_, i) => (
                <motion.div
                  key={i}
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    i < adsWatched 
                      ? 'bg-green-500 text-white' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                  initial={false}
                  animate={{ scale: i < adsWatched ? [1, 1.2, 1] : 1 }}
                >
                  {i < adsWatched ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
                </motion.div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {adsWatched}/{MIN_ADS_REQUIRED} إعلانات تمت مشاهدتها
            </p>
          </div>

          {/* S4P reward info */}
          <div className="bg-gradient-to-r from-gold/10 to-amber-500/10 border border-gold/20 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center">
                <span className="text-[8px] font-bold text-background">S4P</span>
              </div>
              <span className="text-lg font-bold text-gold">+{s4pReward} S4P</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">مكافأة رموز S4P</p>
          </div>

          {/* Ad watching area */}
          <AnimatePresence mode="wait">
            {claimSuccess ? (
              <motion.div
                key="success"
                className="text-center py-8"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="w-20 h-20 mx-auto bg-green-500 rounded-full flex items-center justify-center mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                >
                  <Gift className="w-10 h-10 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold text-green-500">تم!</h3>
                <p className="text-muted-foreground">اللفة المجانية جاهزة</p>
              </motion.div>
            ) : isWatchingAd ? (
              <motion.div
                key="watching"
                className="text-center py-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Play className="w-8 h-8 text-primary animate-pulse" />
                </div>
                <p className="text-sm text-muted-foreground mb-2">جاري مشاهدة الإعلان...</p>
                <Progress value={adProgress} className="h-2" />
              </motion.div>
            ) : (
              <motion.div
                key="watch"
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {!canClaim && (
                  <Button
                    onClick={watchAd}
                    className="w-full bg-gradient-to-r from-pi-purple to-gold hover:opacity-90"
                    size="lg"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    شاهد إعلان ({adsWatched + 1}/{MIN_ADS_REQUIRED})
                  </Button>
                )}

                {canClaim && (
                  <Button
                    onClick={claimFreeSpin}
                    disabled={isClaiming}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90"
                    size="lg"
                  >
                    {isClaiming ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <Gift className="w-5 h-5 mr-2" />
                    )}
                    احصل على اللفة المجانية!
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error message */}
          {error && (
            <motion.div
              className="flex items-center gap-2 text-destructive text-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle className="w-4 h-4" />
              {error}
            </motion.div>
          )}

          {/* Info text */}
          <p className="text-xs text-center text-muted-foreground">
            شاهد {MIN_ADS_REQUIRED} إعلانات للحصول على لفة مجانية إضافية يومياً.
            <br />
            متاحة مرة واحدة يومياً فقط.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
