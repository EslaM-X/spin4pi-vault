import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Popup Container */}
          <motion.div
            className="relative w-full max-w-lg mx-4 rounded-3xl bg-card border border-gold/40 shadow-2xl p-6"
            initial={{ scale: 0.85, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.85, y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 rounded-full p-2 text-gold hover:bg-gold/10 transition"
              aria-label="Close jackpot popup"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title */}
            <motion.h2
              className="mb-6 text-center text-2xl md:text-3xl font-display font-bold text-gradient-gold"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              🏆 Jackpot Live Pool
            </motion.h2>

            {/* Jackpot Counter */}
            <JackpotCounter amount={jackpotAmount} />

            {/* Footer */}
            <motion.p
              className="mt-6 text-center text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Updated in real-time • Powered by Pi Network
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
