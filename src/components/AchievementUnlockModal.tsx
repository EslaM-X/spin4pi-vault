import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Sparkles, X, Coins, Share2 } from "lucide-react";
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

export function AchievementUnlockModal({ achievements, onClose }: AchievementUnlockModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { playAchievementSound } = useSoundEffects();
  const { shareAchievement } = usePiShare();
  const [showConfetti, setShowConfetti] = useState(false);
  useEffect(() => {
    if (achievements.length > 0) {
      playAchievementSound();
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 2000);
      return () => clearTimeout(timer);
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

  const handleShare = () => {
    shareAchievement(currentAchievement.name, currentAchievement.reward_pi);
  };
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Confetti particles */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  background: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][i % 6],
                  left: `${Math.random() * 100}%`,
                  top: -20,
                }}
                initial={{ y: 0, rotate: 0, opacity: 1 }}
                animate={{
                  y: window.innerHeight + 100,
                  rotate: Math.random() * 720 - 360,
                  opacity: 0,
                }}
                transition={{
                  duration: 2 + Math.random(),
                  delay: Math.random() * 0.5,
                  ease: "easeOut",
                }}
              />
            ))}
          </div>
        )}

        <motion.div
          className="relative w-full max-w-sm"
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0, y: 50 }}
          transition={{ type: "spring", damping: 15, stiffness: 300 }}
        >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-gold via-amber-400 to-gold rounded-3xl blur-xl opacity-50 animate-pulse" />
          
          <div className="relative bg-card border-2 border-gold/50 rounded-3xl p-8 text-center overflow-hidden">
            {/* Background shimmer */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/10 to-transparent"
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            />
            
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* Trophy icon with animation */}
            <motion.div
              className="relative mx-auto w-24 h-24 mb-6"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 10, delay: 0.2 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gold to-amber-600 rounded-full flex items-center justify-center shadow-2xl">
                <Trophy className="w-12 h-12 text-background" />
              </div>
              
              {/* Sparkles around trophy */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    top: "50%",
                    left: "50%",
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                    x: Math.cos((i * Math.PI * 2) / 6) * 50 - 8,
                    y: Math.sin((i * Math.PI * 2) / 6) * 50 - 8,
                  }}
                  transition={{
                    duration: 1,
                    delay: 0.5 + i * 0.1,
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                >
                  <Sparkles className="w-4 h-4 text-gold" />
                </motion.div>
              ))}
            </motion.div>

            {/* Achievement unlocked text */}
            <motion.p
              className="text-sm font-semibold text-gold uppercase tracking-wider mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Achievement Unlocked!
            </motion.p>

            {/* Achievement name */}
            <motion.h2
              className="text-2xl font-display font-bold mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {currentAchievement.name}
            </motion.h2>

            {/* Reward */}
            {currentAchievement.reward_pi > 0 && (
              <motion.div
                className="flex items-center justify-center gap-2 text-lg mb-6"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Coins className="w-5 h-5 text-gold" />
                <span className="font-bold text-gold">+{currentAchievement.reward_pi} π</span>
                <span className="text-muted-foreground">reward</span>
              </motion.div>
            )}

            {/* Progress indicator */}
            {achievements.length > 1 && (
              <motion.div
                className="flex justify-center gap-2 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {achievements.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === currentIndex ? 'bg-gold' : 'bg-muted'
                    }`}
                  />
                ))}
              </motion.div>
            )}

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="space-y-2"
            >
              <Button
                onClick={handleShare}
                variant="outline"
                className="w-full gap-2 border-pi-purple/50 hover:bg-pi-purple/20"
              >
                <Share2 className="w-4 h-4" />
                Share Achievement
              </Button>
              <Button
                onClick={handleNext}
                className="w-full bg-gradient-to-r from-gold to-amber-600 hover:from-gold-dark hover:to-amber-700 text-background font-bold"
              >
                {hasMore ? `Next (${achievements.length - currentIndex - 1} more)` : 'Awesome!'}
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
