import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Sparkles, X, Coins, Share2, Crown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { usePiShare } from "@/hooks/usePiShare";

interface Achievement {
  name: string;
  reward_pi: number;
}

interface AchievementUnlockModalProps {
  achievements: Achievement[];
  onClose: () => void;
}

// مكون الجسيمات المتفجرة (يدوي)
function ManualConfetti() {
  const particles = Array.from({ length: 40 });
  const colors = ['#FBBC05', '#7D3CF0', '#FFFFFF', '#9B5DE5'];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1001]">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-sm"
          style={{
            backgroundColor: colors[i % colors.length],
            left: '50%',
            top: '60%',
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
          animate={{
            x: (Math.random() - 0.5) * 600, // انفجار أفقي
            y: (Math.random() - 0.8) * 800, // انفجار رأسي للأعلى ثم سقوط
            opacity: [1, 1, 0],
            scale: [0, 1.5, 0.5],
            rotate: Math.random() * 720,
          }}
          transition={{
            duration: 2.5,
            ease: [0.22, 1, 0.36, 1], // حركة فيزيائية ناعمة
            delay: Math.random() * 0.2,
          }}
        />
      ))}
    </div>
  );
}

export function AchievementUnlockModal({ achievements, onClose }: AchievementUnlockModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [explosionKey, setExplosionKey] = useState(0); // لإعادة تشغيل الانفجار عند التنقل
  const { playAchievementSound } = useSoundEffects();
  const { shareAchievement } = usePiShare();

  useEffect(() => {
    if (achievements.length > 0) {
      playAchievementSound();
      setExplosionKey(prev => prev + 1); // تشغيل الانفجار
    }
  }, [currentIndex, playAchievementSound, achievements.length]);

  if (achievements.length === 0) return null;

  const currentAchievement = achievements[currentIndex];
  const hasMore = currentIndex < achievements.length - 1;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/95 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* تشغيل نظام الكونفيتي اليدوي */}
        <ManualConfetti key={explosionKey} />

        <motion.div
          className="relative w-full max-w-sm"
          initial={{ scale: 0.7, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.7, opacity: 0 }}
          transition={{ type: "spring", damping: 20 }}
        >
          {/* تصميم الكارت الأسطوري */}
          <div className="absolute -inset-1 bg-gradient-to-r from-gold/50 via-pi-purple/50 to-gold/50 rounded-[2.6rem] blur-2xl opacity-40 animate-pulse" />
          
          <div className="relative bg-[#0d0d12] border-2 border-gold/40 rounded-[2.5rem] p-8 text-center overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)]">
            
            {/* الأيقونة المركزية */}
            <div className="relative mx-auto w-32 h-32 mb-8 flex items-center justify-center">
              <motion.div
                className="absolute inset-0 bg-gold/20 rounded-full blur-2xl"
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              
              <motion.div
                className="relative z-10 w-24 h-24 bg-gradient-to-b from-gold via-amber-500 to-amber-800 rounded-[2rem] flex items-center justify-center shadow-[0_15px_30px_rgba(0,0,0,0.5)] rotate-12"
              >
                <Trophy className="w-12 h-12 text-black" />
                <Crown className="absolute -top-4 -right-2 w-8 h-8 text-gold drop-shadow-lg" />
              </motion.div>
            </div>

            <h2 className="text-3xl font-black text-white mb-2 tracking-tight uppercase" style={{ fontFamily: 'Cinzel, serif' }}>
              {currentAchievement.name}
            </h2>
            
            <p className="text-gold font-bold text-xs uppercase tracking-[0.4em] mb-6">
              New Honor Unlocked
            </p>

            {/* المكافأة */}
            {currentAchievement.reward_pi > 0 && (
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 rounded-2xl border border-white/10 mb-8">
                <Coins className="w-6 h-6 text-gold" />
                <div className="text-left">
                  <p className="text-xl font-black text-gold">+{currentAchievement.reward_pi} π</p>
                </div>
              </div>
            )}

            <div className="grid gap-3">
              <Button
                onClick={() => shareAchievement(currentAchievement.name, currentAchievement.reward_pi)}
                variant="ghost"
                className="w-full py-6 rounded-2xl border border-white/10 text-white/60 hover:text-gold"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Share Glory
              </Button>
              
              <Button
                onClick={handleNext}
                className="w-full py-7 bg-gold hover:bg-gold-dark text-black font-black text-lg rounded-2xl"
              >
                <span>{hasMore ? "Next" : "Awesome!"}</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
