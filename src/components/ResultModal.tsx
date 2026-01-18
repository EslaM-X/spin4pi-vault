import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, PartyPopper, Frown, Gift, Coins, Star, Sparkles, ArrowRight, Trophy } from "lucide-react";
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
  glowColor: string;
  isWin: boolean;
  isBigWin: boolean;
}> = {
  "LOSE": {
    title: "The Vault Closed!",
    subtitle: "Fortune favors the persistent. Try once more!",
    icon: Frown,
    color: "text-white/40",
    bgGradient: "from-[#1a1528] to-[#0d0d12]",
    glowColor: "rgba(255,255,255,0.05)",
    isWin: false,
    isBigWin: false,
  },
  "0.01_PI": {
    title: "Royal Bounty!",
    subtitle: "You've secured 0.01 π for your empire.",
    icon: Coins,
    color: "text-gold",
    bgGradient: "from-[#1a1528] via-[#0d0d12] to-gold/10",
    glowColor: "rgba(251,191,36,0.2)",
    isWin: true,
    isBigWin: false,
  },
  "0.05_PI": {
    title: "Grand Treasure!",
    subtitle: "A significant 0.05 π has been added to your vault!",
    icon: Trophy,
    color: "text-gold",
    bgGradient: "from-gold/20 via-[#0d0d12] to-[#1a1528]",
    glowColor: "rgba(251,191,36,0.4)",
    isWin: true,
    isBigWin: true,
  },
  "FREE_SPIN": {
    title: "Imperial Grace!",
    subtitle: "The gods of luck grant you an extra spin!",
    icon: Gift,
    color: "text-emerald-400",
    bgGradient: "from-emerald-900/20 via-[#0d0d12] to-[#0d0d12]",
    glowColor: "rgba(16,185,129,0.3)",
    isWin: true,
    isBigWin: false,
  },
  "NFT_ENTRY": {
    title: "Artifact Entry!",
    subtitle: "Your name is now etched in the NFT royal draw.",
    icon: Star,
    color: "text-blue-400",
    bgGradient: "from-blue-900/20 via-[#0d0d12] to-[#0d0d12]",
    glowColor: "rgba(59,130,246,0.4)",
    isWin: true,
    isBigWin: true,
  },
  "JACKPOT_ENTRY": {
    title: "The King's Chance!",
    subtitle: "You are now a candidate for the Imperial Jackpot!",
    icon: PartyPopper,
    color: "text-gold",
    bgGradient: "from-gold/30 via-pi-purple/20 to-[#0d0d12]",
    glowColor: "rgba(251,191,36,0.6)",
    isWin: true,
    isBigWin: true,
  },
};

// تحسين نظام الكونفيتي ليكون أكثر سلاسة
function ConfettiParticle({ delay, color, startX }: { delay: number; color: string; startX: number }) {
  return (
    <motion.div
      className="absolute w-2 h-2 rounded-full"
      style={{ left: `${startX}%`, backgroundColor: color }}
      initial={{ top: "100%", opacity: 1, scale: 0 }}
      animate={{
        top: "-10%",
        opacity: [0, 1, 1, 0],
        scale: [0, 1.2, 1, 0.5],
        x: (Math.random() - 0.5) * 200,
        rotate: 360,
      }}
      transition={{ duration: 2, delay, ease: "easeOut" }}
    />
  );
}

export function ResultModal({ isOpen, onClose, result }: ResultModalProps) {
  const { playResultSound } = useSoundEffects();
  
  useEffect(() => {
    if (isOpen && result) {
      const timer = setTimeout(() => playResultSound(result), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, result, playResultSound]);

  if (!result) return null;
  const config = resultConfig[result] || resultConfig["LOSE"];
  const Icon = config.icon;
  const confettiColors = ['#FBBC05', '#7D3CF0', '#10B981', '#FFFFFF'];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-[101] p-4 pointer-events-none"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div 
              className={`pointer-events-auto relative overflow-hidden bg-gradient-to-br ${config.bgGradient} rounded-[3rem] p-10 max-w-sm w-full border-2 shadow-[0_0_80px_rgba(0,0,0,0.5)] ${
                config.isBigWin ? 'border-gold/50' : 'border-white/10'
              }`}
              initial={{ scale: 0.8, y: 100, rotateX: 30 }}
              animate={{ scale: 1, y: 0, rotateX: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              {/* هالة الضوء الخلفية */}
              <div 
                className="absolute inset-0 opacity-30 pointer-events-none"
                style={{ background: `radial-gradient(circle at center, ${config.glowColor} 0%, transparent 70%)` }}
              />

              {/* تأثير الكونفيتي عند الفوز */}
              {config.isWin && (
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(30)].map((_, i) => (
                    <ConfettiParticle key={i} delay={i * 0.05} color={confettiColors[i % 4]} startX={Math.random() * 100} />
                  ))}
                </div>
              )}

              <div className="relative z-10 flex flex-col items-center text-center">
                {/* الأيقونة المركزية مع تأثير التوهج */}
                <motion.div
                  className={`relative w-24 h-24 rounded-3xl flex items-center justify-center mb-8 ${
                    config.isBigWin ? 'bg-gold/10 shadow-[0_0_30px_rgba(251,191,36,0.3)]' : 'bg-white/5'
                  }`}
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring" }}
                >
                  <Icon className={`w-12 h-12 ${config.color} drop-shadow-[0_0_10px_currentColor]`} />
                  {config.isBigWin && (
                    <motion.div 
                      className="absolute -inset-2 border-2 border-gold/30 rounded-3xl"
                      animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </motion.div>
                
                <h2 className={`text-4xl font-black mb-3 uppercase tracking-tighter italic ${config.color}`} style={{ fontFamily: 'Cinzel, serif' }}>
                  {config.title}
                </h2>
                
                <p className="text-white/60 text-base mb-10 leading-relaxed font-medium">
                  {config.subtitle}
                </p>
                
                <motion.button
                  onClick={onClose}
                  className={`group relative w-full py-5 rounded-2xl flex items-center justify-center gap-3 overflow-hidden transition-all ${
                    config.isWin 
                      ? 'bg-gold text-black shadow-[0_10px_20px_rgba(251,191,36,0.3)]' 
                      : 'bg-white/10 text-white border border-white/20'
                  }`}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="font-black uppercase tracking-[0.2em] text-sm">
                    {config.isWin ? "Claim Reward" : "Dismiss"}
                  </span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>

              {/* زخرفة سفلية ملكية */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent opacity-30" />
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
