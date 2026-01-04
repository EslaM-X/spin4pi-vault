import { motion } from "framer-motion";
import { Coins, Gift, Sparkles, Crown } from "lucide-react";

interface SpinButtonsProps {
  onSpin: (type: string, cost: number) => void;
  disabled: boolean;
  canFreeSpin: boolean;
  freeSpinTimer: string;
}

const spinOptions = [
  {
    id: "free",
    label: "Daily Free",
    cost: 0,
    icon: Gift,
    gradient: "from-emerald-500 to-emerald-700",
    description: "1 free spin daily",
  },
  {
    id: "basic",
    label: "Basic Spin",
    cost: 0.1,
    icon: Coins,
    gradient: "from-pi-purple to-pi-purple-dark",
    description: "Standard odds",
  },
  {
    id: "pro",
    label: "Pro Spin",
    cost: 0.25,
    icon: Sparkles,
    gradient: "from-gold to-gold-dark",
    description: "+10% better odds",
  },
  {
    id: "vault",
    label: "Vault Spin",
    cost: 1,
    icon: Crown,
    gradient: "from-amber-500 via-gold to-amber-600",
    description: "Best odds + jackpot",
  },
];

export function SpinButtons({ onSpin, disabled, canFreeSpin, freeSpinTimer }: SpinButtonsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-4xl mx-auto">
      {spinOptions.map((option, index) => {
        const Icon = option.icon;
        const isFreeSpin = option.id === "free";
        const isDisabled = disabled || (isFreeSpin && !canFreeSpin);
        
        return (
          <motion.button
            key={option.id}
            onClick={() => onSpin(option.id, option.cost)}
            disabled={isDisabled}
            className={`relative overflow-hidden rounded-xl p-4 bg-gradient-to-br ${option.gradient} text-foreground shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: isDisabled ? 1 : 1.05 }}
            whileTap={{ scale: isDisabled ? 1 : 0.95 }}
          >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            
            <div className="relative flex flex-col items-center gap-2">
              <Icon className="w-8 h-8" />
              <span className="font-display font-bold text-lg">{option.label}</span>
              {isFreeSpin ? (
                <span className="text-sm opacity-90">
                  {canFreeSpin ? "Available!" : freeSpinTimer}
                </span>
              ) : (
                <span className="text-2xl font-display font-bold">{option.cost} π</span>
              )}
              <span className="text-xs opacity-75">{option.description}</span>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
