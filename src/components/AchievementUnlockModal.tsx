import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Sparkles, X, Coins, Share2, Crown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { usePiShare } from "@/hooks/usePiShare";
import confetti from 'canvas-confetti';

interface Achievement {
  name: string;
  reward_pi: number;
}

interface AchievementUnlockModalProps {
  achievements: Achievement[];
  onClose: () => void;
}

export function AchievementUnlockModal({ achievements, onClose }: AchievementUnlockModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { playAchievementSound } = useSoundEffects();
  const { shareAchievement } = usePiShare();

  useEffect(() => {
    if (achievements.length > 0) {
      playAchievementSound();
      // انفجار كونفيتي احترافي
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FBBC05', '#7D3CF0', '#FFFFFF']
      });
    }
  }, [currentIndex, playAchievementSound, achievements.length]);

  if (achievements.length === 0) return null;

  const currentAchievement = achievements[currentIndex];
  const hasMore = currentIndex < achievements.length - 1;

  const handleNext = () => {
    if (hasMore) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        {/* Backdrop مع تعتيم عالي */}
        <motion.div
          className="absolute inset-0 bg-black/90 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        <motion.div
          className="relative w-full max-w-sm"
          initial={{ scale: 0.7, opacity: 0, rotateX: 45 }}
          animate={{ scale: 1, opacity: 1, rotateX: 0 }}
          exit={{ scale: 0.7, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
        >
          {/* Aura الخلفية المضيئة */}
          <div className="absolute -inset-4 bg-gradient-to-r from-gold/30 via-pi-purple/30 to-gold/30 rounded-[3rem] blur-3xl animate-pulse" />
          
          <div className="relative bg-[#0d0d12] border-2 border-gold/40 rounded-[2.5rem] p-8 text-center overflow-hidden shadow-[0_0_100px_rgba(251,191,36,0.2)]">
            
            {/* لمعة الستيل المتحركة */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none"
              animate={{ x: ["-200%", "200%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            
            {/* زر الإغلاق الملكي */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors z-50"
            >
              <X className="w-5 h-5 text-gold/60" />
            </button>

            {/* الأيقونة المركزية: الكأس المحاط بالهالة */}
            <div className="relative mx-auto w-32 h-32 mb-8 flex items-center justify-center">
              <motion.div
                className="absolute inset-0 bg-gold/20 rounded-full blur-2xl"
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              
              <motion.div
                className="relative z-10 w-24 h-24 bg-gradient-to-b from-gold via-amber-500 to-amber-700 rounded-[2rem] flex items-center justify-center shadow-[0_15px_35px_rgba(251,191,36,0.4)] rotate-12"
                initial={{ y: 20, rotate: 0 }}
                animate={{ y: 0, rotate: 12 }}
                transition={{ type: "spring", bounce: 0.6 }}
              >
                <Trophy className="w-12 h-12 text-black" strokeWidth={2.5} />
                
                {/* تاج صغير فوق الكأس */}
                <Crown className="absolute -top-4 -right-2 w-8 h-8 text-gold drop-shadow-lg rotate-12" />
              </motion.div>

              {/* نجوم متطايرة */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                    x: Math.cos(i) * 70,
                    y: Math.sin(i) * 70,
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                >
                  <Sparkles className="w-4 h-4 text-gold/50" />
                </motion.div>
              ))}
            </div>

            {/* نصوص الإنجاز */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span className="inline-block px-4 py-1 rounded-full bg-gold/10 border border-gold/20 text-[10px] font-black text-gold uppercase tracking-[0.3em] mb-4">
                Imperial Decree
              </span>
              
              <h2 className="text-3xl font-black text-white mb-2 tracking-tight italic uppercase" style={{ fontFamily: 'Cinzel, serif' }}>
                {currentAchievement.name}
              </h2>
              
              <p className="text-white/40 text-sm font-medium mb-6 uppercase tracking-widest">
                New Honor Unlocked
              </p>
            </motion.div>

            {/* المكافأة */}
            {currentAchievement.reward_pi > 0 && (
              <motion.div
                className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 rounded-2xl border border-white/10 mb-8"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
              >
                <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(251,191,36,0.5)]">
                  <Coins className="w-6 h-6 text-black" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-tighter">Imperial Bounty</p>
                  <p className="text-xl font-black text-gold">+{currentAchievement.reward_pi} π</p>
                </div>
              </motion.div>
            )}

            {/* الأزرار الأسطورية */}
            <div className="grid gap-3 relative z-20">
              <Button
                onClick={() => shareAchievement(currentAchievement.name, currentAchievement.reward_pi)}
                variant="ghost"
                className="w-full py-6 rounded-2xl border border-white/10 text-white/60 hover:text-gold hover:bg-white/5 transition-all group"
              >
                <Share2 className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Spread the Glory
              </Button>
              
              <Button
                onClick={handleNext}
                className="w-full py-7 bg-gold hover:bg-gold-dark text-black font-black text-lg rounded-2xl shadow-[0_10px_20px_rgba(251,191,36,0.3)] group"
              >
                <span>{hasMore ? "Next Honor" : "Claim & Close"}</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* مؤشر الصفحات السفلي */}
            {achievements.length > 1 && (
              <div className="flex justify-center gap-1.5 mt-6">
                {achievements.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 rounded-full transition-all duration-500 ${
                      i === currentIndex ? 'w-8 bg-gold' : 'w-2 bg-white/10'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
