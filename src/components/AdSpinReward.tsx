import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Gift, Zap, Clock, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function AdSpinReward({ isOpen, onClose, onSpinEarned, piUsername }: any) {
  const [adsWatched, setAdsWatched] = useState(0);
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  const ADS_NEEDED = 2;

  useEffect(() => {
    if (isOpen && piUsername) {
      checkUserCooldown();
    }
  }, [isOpen, piUsername]);

  // التحقق من قاعدة البيانات عن آخر موعد للمطالبة
  const checkUserCooldown = async () => {
    setIsChecking(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('last_ad_spin_date')
        .eq('pi_username', piUsername)
        .single();

      if (data?.last_ad_spin_date) {
        const lastDate = new Date(data.last_ad_spin_date).getTime();
        const now = new Date().getTime();
        const diff = now - lastDate;
        const cooldown = 24 * 60 * 60 * 1000;

        if (diff < cooldown) {
          setTimeLeft(cooldown - diff);
        } else {
          setTimeLeft(null);
        }
      }
    } catch (err) {
      console.error("Error checking cooldown", err);
    } finally {
      setIsChecking(false);
    }
  };

  const handleWatchAd = async () => {
    // هنا نقوم باستدعاء Pi Ads SDK الحقيقي
    // Pi.Ads.showRewardedAd()...
    
    setIsWatchingAd(true);
    
    // محاكاة وقت الإعلان
    setTimeout(() => {
      setIsWatchingAd(false);
      const newCount = adsWatched + 1;
      setAdsWatched(newCount);

      if (newCount >= ADS_NEEDED) {
        completeReward();
      } else {
        toast.info("إعلان واحد متبقي للحصول على الجائزة!");
      }
    }, 4000); 
  };

  const completeReward = async () => {
    try {
      // تحديث قاعدة البيانات بالوقت الحالي
      await supabase
        .from('profiles')
        .update({ last_ad_spin_date: new Date().toISOString() })
        .eq('pi_username', piUsername);

      onSpinEarned(); // إضافة اللفة للمستخدم
      toast.success("تم شحن الطاقة! حصلت على لفة مجانية");
      onClose();
    } catch (err) {
      toast.error("حدث خطأ أثناء تحديث البيانات");
    }
  };

  // تنسيق الوقت للعداد التنازلي
  const formatTime = (ms: number) => {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0d0d12] border-gold/20 max-w-sm rounded-[2.5rem] p-8 overflow-hidden">
        <AnimatePresence mode="wait">
          {isChecking ? (
            <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-gold" /></div>
          ) : timeLeft ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-6">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10">
                <Lock className="w-10 h-10 text-white/20" />
              </div>
              <h3 className="text-xl font-black text-white italic">RECHARGE IN PROGRESS</h3>
              <div className="bg-gold/10 border border-gold/20 p-4 rounded-2xl">
                <span className="text-2xl font-black text-gold font-mono">{formatTime(timeLeft)}</span>
              </div>
              <p className="text-[10px] text-white/30 uppercase tracking-[0.2em]">Next broadcast available after cooldown</p>
            </motion.div>
          ) : (
            <div className="text-center space-y-8">
              <div className="relative mx-auto w-20 h-20 bg-gold rounded-3xl flex items-center justify-center shadow-lg rotate-3">
                <Zap className="w-10 h-10 text-black fill-black" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white italic uppercase">Power Station</h2>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-2">Watch 2 ads for 1 Free Spin</p>
              </div>
              
              <div className="flex justify-center gap-4">
                {[...Array(ADS_NEEDED)].map((_, i) => (
                  <div key={i} className={`w-4 h-4 rounded-full border-2 ${i < adsWatched ? 'bg-gold border-gold' : 'border-white/20'}`} />
                ))}
              </div>

              <Button 
                onClick={handleWatchAd}
                disabled={isWatchingAd}
                className="w-full py-8 bg-gold hover:bg-gold-dark text-black font-black rounded-2xl text-lg transition-transform active:scale-95"
              >
                {isWatchingAd ? "WATCHING..." : `START BROADCAST ${adsWatched + 1}`}
              </Button>
            </div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
