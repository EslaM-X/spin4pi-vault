import { motion } from "framer-motion";
import { Trophy } from "lucide-react";

interface JackpotCounterProps {
  amount: number;
}

export function JackpotCounter({ amount }: JackpotCounterProps) {
  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card via-pi-purple/20 to-card border border-gold/30 p-6 shadow-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-gold/5 via-transparent to-pi-purple/5" />
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 animate-shimmer pointer-events-none" />
      
      <div className="relative flex items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Trophy className="w-10 h-10 text-gold" />
        </motion.div>
        
        <div className="text-center">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Jackpot Pool</p>
          <motion.p
            className="text-4xl md:text-5xl font-display font-bold text-gradient-gold"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {amount.toFixed(2)} π
          </motion.p>
        </div>
        
        <motion.div
          animate={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
        >
          <Trophy className="w-10 h-10 text-gold" />
        </motion.div>
      </div>
      
      {/* Pulsing border effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl border-2 border-gold/50"
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.div>
  );
}
