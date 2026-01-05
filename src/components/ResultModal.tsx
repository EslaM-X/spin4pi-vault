import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, PartyPopper, Frown, Gift, Coins, Star, Sparkles } from "lucide-react";
import { useSoundEffects } from "@/hooks/useSoundEffects";

interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: string | null;
}

const resultConfig: Record<string, { 
  title: string; 
  subtitle: string; 
  icon: any; 
  color: string; 
  bgGradient: string;
  isWin: boolean;
  isBigWin: boolean;
}> = {
  "LOSE": {
    title: "Better Luck Next Time!",
    subtitle: "Spin again for another chance",
    icon: Frown,
    color: "text-muted-foreground",
    bgGradient: "from-muted/50 to-card",
    isWin: false,
    isBigWin: false,
  },
  "0.01_PI": {
    title: "You Won 0.01 π!",
    subtitle: "Nice spin! Keep going!",
    icon: Coins,
    color: "text-gold",
    bgGradient: "from-gold/20 to-card",
    isWin: true,
    isBigWin: false,
  },
  "0.05_PI": {
    title: "You Won 0.05 π!",
    subtitle: "Great spin! You're on fire!",
    icon: Coins,
    color: "text-gold",
    bgGradient: "from-gold/30 to-card",
    isWin: true,
    isBigWin: true,
  },
  "FREE_SPIN": {
    title: "Free Spin Won!",
    subtitle: "You got an extra spin!",
    icon: Gift,
    color: "text-emerald-400",
    bgGradient: "from-emerald-500/20 to-card",
    isWin: true,
    isBigWin: false,
  },
  "NFT_ENTRY": {
    title: "NFT Wheel Entry!",
    subtitle: "You're entered in the NFT draw!",
    icon: Star,
    color: "text-pi-purple-glow",
    bgGradient: "from-pi-purple/30 to-card",
    isWin: true,
    isBigWin: true,
  },
  "JACKPOT_ENTRY": {
    title: "JACKPOT ENTRY!",
    subtitle: "You're in the jackpot draw!",
    icon: PartyPopper,
    color: "text-gold",
    bgGradient: "from-gold/40 via-pi-purple/20 to-card",
    isWin: true,
    isBigWin: true,
  },
};

// Confetti particle component
function ConfettiParticle({ delay, color, startX }: { delay: number; color: string; startX: number }) {
  return (
    <motion.div
      className="absolute w-3 h-3 rounded-sm"
      style={{
        left: `${startX}%`,
        backgroundColor: color,
        rotate: Math.random() * 360,
      }}
      initial={{ top: "50%", opacity: 1, scale: 0 }}
      animate={{
        top: [null, "0%", "-20%"],
        opacity: [0, 1, 0],
        scale: [0, 1, 0.5],
        x: (Math.random() - 0.5) * 300,
        rotate: Math.random() * 720,
      }}
      transition={{
        duration: 1.5,
        delay,
        ease: "easeOut",
      }}
    />
  );
}

// Sparkle effect component
function SparkleEffect({ delay }: { delay: number }) {
  const x = Math.random() * 100;
  const y = Math.random() * 100;
  
  return (
    <motion.div
      className="absolute"
      style={{ left: `${x}%`, top: `${y}%` }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 0],
        scale: [0, 1, 0],
      }}
      transition={{
        duration: 0.6,
        delay,
        repeat: Infinity,
        repeatDelay: Math.random() * 2,
      }}
    >
      <Sparkles className="w-4 h-4 text-gold" />
    </motion.div>
  );
}

export function ResultModal({ isOpen, onClose, result }: ResultModalProps) {
  const { playResultSound } = useSoundEffects();
  
  // Play sound when modal opens with a result
  useEffect(() => {
    if (isOpen && result) {
      // Small delay to sync with animation
      const timer = setTimeout(() => {
        playResultSound(result);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, result, playResultSound]);

  if (!result) return null;
  
  const config = resultConfig[result] || resultConfig["LOSE"];
  const Icon = config.icon;

  const confettiColors = ['#F5C542', '#7D3CF0', '#10B981', '#F472B6', '#60A5FA'];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-dark-space/80 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className={`pointer-events-auto relative overflow-hidden bg-gradient-to-br ${config.bgGradient} rounded-3xl p-8 max-w-md w-full border shadow-2xl ${
                config.isBigWin ? 'border-gold glow-gold' : config.isWin ? 'border-gold/30' : 'border-border'
              }`}
              initial={{ scale: 0.5, y: 50 }}
              animate={{ 
                scale: 1, 
                y: 0,
                transition: {
                  type: "spring",
                  damping: 15,
                  stiffness: 300,
                }
              }}
              exit={{ scale: 0.5, y: 50 }}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </button>
              
              {/* Sparkle effects for big wins */}
              {config.isBigWin && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {[...Array(8)].map((_, i) => (
                    <SparkleEffect key={i} delay={i * 0.2} />
                  ))}
                </div>
              )}
              
              {/* Confetti for wins */}
              {config.isWin && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {[...Array(config.isBigWin ? 40 : 20)].map((_, i) => (
                    <ConfettiParticle 
                      key={i} 
                      delay={i * 0.03} 
                      color={confettiColors[i % confettiColors.length]}
                      startX={10 + (i % 10) * 8}
                    />
                  ))}
                </div>
              )}
              
              {/* Pulsing glow effect for big wins */}
              {config.isBigWin && (
                <motion.div
                  className="absolute inset-0 rounded-3xl"
                  style={{
                    background: `radial-gradient(circle at center, hsl(var(--gold) / 0.3) 0%, transparent 70%)`,
                  }}
                  animate={{
                    opacity: [0.5, 1, 0.5],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              )}
              
              {/* Content */}
              <div className="relative flex flex-col items-center text-center">
                {/* Icon with animation */}
                <motion.div
                  className={`relative p-6 rounded-full mb-6 ${
                    config.isBigWin 
                      ? 'bg-gradient-to-br from-gold/30 to-pi-purple/30' 
                      : 'bg-gradient-to-br from-card to-muted'
                  }`}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ 
                    scale: 1, 
                    rotate: 0,
                  }}
                  transition={{ 
                    type: "spring", 
                    delay: 0.1,
                    damping: 10,
                    stiffness: 200,
                  }}
                >
                  {/* Rotating ring for big wins */}
                  {config.isBigWin && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-dashed border-gold/50"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                  
                  <motion.div
                    animate={config.isWin ? {
                      scale: [1, 1.2, 1],
                      rotate: config.isBigWin ? [0, 10, -10, 0] : 0,
                    } : {}}
                    transition={{
                      duration: 0.5,
                      repeat: config.isBigWin ? Infinity : 0,
                      repeatDelay: 1,
                    }}
                  >
                    <Icon className={`w-16 h-16 ${config.color}`} />
                  </motion.div>
                </motion.div>
                
                {/* Title with stagger animation */}
                <motion.h2
                  className={`text-3xl font-display font-bold mb-2 ${config.color}`}
                  initial={{ opacity: 0, y: 30, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    delay: 0.2,
                    type: "spring",
                    damping: 12,
                  }}
                >
                  {config.isBigWin ? (
                    <motion.span
                      animate={{ 
                        textShadow: [
                          "0 0 10px hsl(var(--gold) / 0.5)",
                          "0 0 30px hsl(var(--gold) / 0.8)",
                          "0 0 10px hsl(var(--gold) / 0.5)",
                        ]
                      }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      {config.title}
                    </motion.span>
                  ) : config.title}
                </motion.h2>
                
                <motion.p
                  className="text-muted-foreground text-lg mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {config.subtitle}
                </motion.p>
                
                <motion.button
                  onClick={onClose}
                  className={`px-8 py-3 font-display font-bold rounded-full transition-all ${
                    config.isWin 
                      ? 'bg-gradient-to-r from-gold to-gold-dark text-dark-space hover:scale-105' 
                      : 'bg-gradient-to-r from-pi-purple to-pi-purple-dark text-foreground hover:scale-105'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {config.isWin ? "Collect & Continue" : "Try Again"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
