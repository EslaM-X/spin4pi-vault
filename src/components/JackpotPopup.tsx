import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy, Sparkles, TrendingUp } from "lucide-react";
import { JackpotCounter } from "./JackpotCounter";

interface JackpotPopupProps {
  isOpen?: boolean;
  onClose?: () => void;
  jackpotAmount?: number;
}

export default function JackpotPopup({
  isOpen = true,
  onClose,
  jackpotAmount = 12345.67,
}: JackpotPopupProps) {
  const [visible, setVisible] = useState(isOpen);

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Glowing Background Effect */}
          <div className="absolute w-[300px] h-[300px] bg-gold/10 blur-[100px] rounded-full animate-pulse" />

          {/* Popup Container */}
          <motion.div
            className="relative w-full max-w-lg mx-4 rounded-[2.5rem] bg-[#0d0d12] border-2 border-gold/30 shadow-[0_0_50px_rgba(251,191,36,0.2)] p-8 overflow-hidden"
            initial={{ scale: 0.8, rotate: -2, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.8, rotate: 2, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            {/* Decorative Corner Icons */}
            <div className="absolute -top-4 -left-4 opacity-10">
              <Trophy className="w-24 h-24 text-gold rotate-12" />
            </div>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute right-6 top-6 rounded-xl p-2 bg-white/5 text-gold hover:bg-gold hover:text-black transition-all duration-300 z-10"
              aria-label="Close jackpot popup"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Content */}
            <div className="relative text-center mb-8">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 bg-gold/10 px-4 py-1.5 rounded-full border border-gold/20 mb-4"
              >
                <Sparkles className="w-4 h-4 text-gold animate-spin-slow" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gold">Grand Treasury</span>
              </motion.div>
              
              <motion.h2
                className="text-3xl md:text-4xl font-black text-white italic uppercase tracking-tighter"
                style={{ fontFamily: 'Cinzel, serif' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Imperial <span className="text-gold font-bold">Jackpot</span>
              </motion.h2>
              <p className="text-white/30 text-[10px] uppercase tracking-[0.2em] font-bold mt-2">The ultimate prize awaits the worthy</p>
            </div>

            {/* Jackpot Counter Container */}
            <motion.div 
              className="relative py-10 px-6 rounded-[2rem] bg-gradient-to-b from-gold/5 to-transparent border border-gold/10 shadow-inner"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <JackpotCounter amount={jackpotAmount} />
              
              {/* Live Indicator */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-black border border-gold/20 px-4 py-1 rounded-full flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="text-[9px] font-black text-white uppercase tracking-widest">Live Updates</span>
              </div>
            </motion.div>

            {/* Footer / Stats */}
            <motion.div
              className="mt-10 flex flex-col items-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-6 text-white/40">
                <div className="flex flex-col items-center">
                  <TrendingUp className="w-4 h-4 text-gold mb-1" />
                  <span className="text-[8px] font-bold uppercase tracking-widest">Growing Fast</span>
                </div>
                <div className="w-px h-8 bg-white/5" />
                <div className="flex flex-col items-center">
                  <Trophy className="w-4 h-4 text-gold mb-1" />
                  <span className="text-[8px] font-bold uppercase tracking-widest">Provably Fair</span>
                </div>
              </div>
              
              <p className="text-[8px] text-white/20 font-black uppercase tracking-[0.2em]">
                Secured by Pi Network Infrastructure
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
