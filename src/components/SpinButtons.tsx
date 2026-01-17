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
    color: "#10b981", // Emerald
    gradient: "from-[#064e3b] via-[#10b981] to-[#064e3b]",
    description: "Gift from Vault",
    glow: "shadow-[0_0_20px_rgba(16,185,129,0.3)]",
  },
  {
    id: "basic",
    label: "Basic Spin",
    cost: 0.1,
    icon: Coins,
    color: "#9333ea", // Purple
    gradient: "from-[#3b0764] via-[#9333ea] to-[#3b0764]",
    description: "Standard Entry",
    glow: "shadow-[0_0_20px_rgba(147,51,234,0.3)]",
  },
  {
    id: "pro",
    label: "Pro Spin",
    cost: 0.25,
    icon: Sparkles,
    color: "#fbbf24", // Gold
    gradient: "from-[#78350f] via-[#fbbf24] to-[#78350f]",
    description: "+10% Luck Boost",
    glow: "shadow-[0_0_20px_rgba(251,191,36,0.3)]",
  },
  {
    id: "vault",
    label: "Vault Spin",
    cost: 1,
    icon: Crown,
    color: "#f59e0b", // Amber/Gold
    gradient: "from-[#451a03] via-[#f59e0b] to-[#451a03]",
    description: "Royal Jackpot Odds",
    glow: "shadow-[0_0_30px_rgba(245,158,11,0.5)]",
  },
];

export function SpinButtons({ onSpin, disabled, canFreeSpin, freeSpinTimer }: SpinButtonsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-5xl mx-auto px-4">
      {spinOptions.map((option, index) => {
        const Icon = option.icon;
        const isFreeSpin = option.id === "free";
        const isActive = isFreeSpin ? canFreeSpin : true;
        const isDisabled = disabled || (isFreeSpin && !canFreeSpin);
        
        return (
          <motion.button
            key={option.id}
            onClick={() => onSpin(option.id, option.cost)}
            disabled={isDisabled}
            className={`
              relative overflow-hidden rounded-2xl p-[2px] transition-all duration-300
              ${isDisabled ? 'opacity-40 grayscale-[0.5]' : `hover:scale-105 ${option.glow}`}
              group
            `}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
          >
            {/* الخلفية المتحركة للحواف (Border Gradient Animation) */}
            <div className={`absolute inset-0 bg-gradient-to-r ${option.gradient} opacity-50 group-hover:opacity-100 animate-pulse`} />
            
            {/* جسم الزر الرئيسي (Inner Body) */}
            <div className="relative bg-[#0a0a0c] rounded-[14px] p-5 h-full flex flex-col items-center gap-3 border border-white/5 backdrop-blur-xl">
              
              {/* تأثير الهالة الخلفية للأيقونة */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" 
                   style={{ backgroundColor: option.color }} />

              <div className="relative z-10 p-3 rounded-full bg-white/5 border border-white/10 group-hover:border-white/20 transition-colors">
                <Icon className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-500" 
                      style={{ filter: `drop-shadow(0 0 8px ${option.color})` }} />
              </div>

              <div className="flex flex-col items-center">
                <span className="font-display font-black text-xs uppercase tracking-[0.2em] text-white/50 mb-1">
                  {option.id === 'vault' ? '⭐ Legendary' : 'Premium'}
                </span>
                <span className="font-display font-bold text-xl text-white tracking-tight">
                  {option.label}
                </span>
              </div>

              <div className="flex flex-col items-center gap-1">
                {isFreeSpin ? (
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${canFreeSpin ? 'bg-emerald-500/20 text-emerald-400 animate-pulse' : 'bg-white/5 text-white/40'}`}>
                    {canFreeSpin ? "COLLECT NOW" : freeSpinTimer}
                  </span>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">
                      {option.cost}
                    </span>
                    <span className="text-sm font-bold text-[#fbbf24]">π</span>
                  </div>
                )}
              </div>

              <p className="text-[10px] uppercase font-medium tracking-wider text-white/40 group-hover:text-white/70 transition-colors">
                {option.description}
              </p>

              {/* تأثير اللمعان المتحرك (Shine) */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[14px]">
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
                  animate={{ x: ['-200%', '200%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: index }}
                />
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
