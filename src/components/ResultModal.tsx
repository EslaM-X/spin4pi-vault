import { motion, AnimatePresence } from "framer-motion";
import { X, PartyPopper, Frown, Gift, Coins, Star } from "lucide-react";

interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: string | null;
}

const resultConfig: Record<string, { title: string; subtitle: string; icon: any; color: string; isWin: boolean }> = {
  "LOSE": {
    title: "Better Luck Next Time!",
    subtitle: "Spin again for another chance",
    icon: Frown,
    color: "text-muted-foreground",
    isWin: false,
  },
  "0.01_PI": {
    title: "You Won 0.01 π!",
    subtitle: "Nice spin! Keep going!",
    icon: Coins,
    color: "text-gold",
    isWin: true,
  },
  "0.05_PI": {
    title: "You Won 0.05 π!",
    subtitle: "Great spin! You're on fire!",
    icon: Coins,
    color: "text-gold",
    isWin: true,
  },
  "FREE_SPIN": {
    title: "Free Spin Won!",
    subtitle: "You got an extra spin!",
    icon: Gift,
    color: "text-emerald-400",
    isWin: true,
  },
  "NFT_ENTRY": {
    title: "NFT Wheel Entry!",
    subtitle: "You're entered in the NFT draw!",
    icon: Star,
    color: "text-pi-purple-glow",
    isWin: true,
  },
  "JACKPOT_ENTRY": {
    title: "JACKPOT ENTRY!",
    subtitle: "You're in the jackpot draw!",
    icon: PartyPopper,
    color: "text-gold",
    isWin: true,
  },
};

export function ResultModal({ isOpen, onClose, result }: ResultModalProps) {
  if (!result) return null;
  
  const config = resultConfig[result] || resultConfig["LOSE"];
  const Icon = config.icon;

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
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <div className="relative bg-gradient-to-br from-card via-card to-pi-purple/20 rounded-3xl p-8 max-w-md w-full border border-gold/30 shadow-2xl">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              {/* Content */}
              <div className="flex flex-col items-center text-center">
                {/* Icon with animation */}
                <motion.div
                  className={`p-6 rounded-full bg-gradient-to-br from-card to-muted mb-6 ${config.isWin ? 'animate-bounce' : ''}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                >
                  <Icon className={`w-16 h-16 ${config.color}`} />
                </motion.div>
                
                {/* Confetti for wins */}
                {config.isWin && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {[...Array(20)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 rounded-full"
                        style={{
                          left: `${Math.random() * 100}%`,
                          backgroundColor: ['#F5C542', '#7D3CF0', '#10B981'][i % 3],
                        }}
                        initial={{ top: '50%', opacity: 1 }}
                        animate={{
                          top: '-10%',
                          opacity: 0,
                          x: (Math.random() - 0.5) * 200,
                        }}
                        transition={{
                          duration: 1.5,
                          delay: i * 0.05,
                          ease: "easeOut",
                        }}
                      />
                    ))}
                  </motion.div>
                )}
                
                <motion.h2
                  className={`text-3xl font-display font-bold mb-2 ${config.color}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {config.title}
                </motion.h2>
                
                <motion.p
                  className="text-muted-foreground text-lg mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {config.subtitle}
                </motion.p>
                
                <motion.button
                  onClick={onClose}
                  className="px-8 py-3 bg-gradient-to-r from-pi-purple to-pi-purple-dark text-foreground font-display font-bold rounded-full hover:scale-105 transition-transform"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  Continue
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
