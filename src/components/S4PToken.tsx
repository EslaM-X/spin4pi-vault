import { motion, AnimatePresence } from "framer-motion";
import { Coins, Sparkles, TrendingUp } from "lucide-react";

interface S4PTokenDisplayProps {
  balance: number;
  showAnimation?: boolean;
}

export function S4PTokenDisplay({ balance, showAnimation = false }: S4PTokenDisplayProps) {
  return (
    <motion.div
      className="flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-gold/20 border border-gold/30 rounded-lg px-3 py-2"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* S4P Token Icon - App logo style coin */}
      <div className="relative">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold via-amber-400 to-gold-dark flex items-center justify-center shadow-lg">
          <span className="text-xs font-bold text-background">S4P</span>
        </div>
        {showAnimation && (
          <motion.div
            className="absolute inset-0 rounded-full bg-gold/50"
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.6, repeat: Infinity }}
          />
        )}
      </div>
      
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">S4P Token</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={balance}
            className="font-display font-bold text-gold"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
          >
            {balance.toLocaleString()}
          </motion.span>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

interface S4PTokenInfoProps {
  className?: string;
}

export function S4PTokenInfo({ className }: S4PTokenInfoProps) {
  const features = [
    { icon: Coins, text: "Earn from ads & vault spins" },
    { icon: Sparkles, text: "Use for premium NFTs" },
    { icon: TrendingUp, text: "Stake for bonus rewards" },
  ];

  return (
    <div className={`bg-card/50 border border-border rounded-xl p-4 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold via-amber-400 to-gold-dark flex items-center justify-center shadow-lg">
          <span className="text-sm font-bold text-background">S4P</span>
        </div>
        <div>
          <h3 className="font-display font-bold text-lg text-foreground">Spin4Pi Token</h3>
          <p className="text-xs text-muted-foreground">Pi DEX Testnet</p>
        </div>
      </div>
      
      <div className="space-y-2">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            className="flex items-center gap-2 text-sm text-muted-foreground"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <feature.icon className="w-4 h-4 text-gold" />
            <span>{feature.text}</span>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-border/50">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Token Standard</span>
          <span className="text-gold font-medium">Pi Network Compatible</span>
        </div>
        <div className="flex items-center justify-between text-xs mt-1">
          <span className="text-muted-foreground">Symbol</span>
          <span className="text-foreground font-medium">S4P</span>
        </div>
      </div>
    </div>
  );
}
