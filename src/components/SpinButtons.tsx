import { motion } from "framer-motion";
import { Coins, Gift, Sparkles, Crown, Zap, ShieldCheck } from "lucide-react";

interface SpinButtonsProps {
  onSpin: (type: string, cost: number) => void;
  disabled: boolean;
  canFreeSpin: boolean;
  freeSpinTimer: string;
}

const spinOptions = [
  {
    id: "free",
    label: "Daily Tribute",
    cost: 0,
    icon: Gift,
    color: "#10b981", // Emerald
    gradient: "from-[#064e3b] via-[#10b981] to-[#064e3b]",
    description: "Imperial Gift",
    badge: "FREE"
  },
  {
    id: "basic",
    label: "Commoner Spin",
    cost: 0.1,
    icon: Coins,
    color: "#94a3b8", // Slate/Silver
    gradient: "from-[#1e293b] via-[#94a3b8] to-[#1e293b]",
    description: "Standard Odds",
    badge: "BASIC"
  },
  {
    id: "pro",
    label: "Elite Spin",
    cost: 0.25,
    icon: Sparkles,
    color: "#fbbf24", // Gold
    gradient: "from-[#78350f] via-[#fbbf24] to-[#78350f]",
    description: "+15% Luck Boost",
    badge: "15% BOOST"
  },
  {
    id: "vault",
    label: "Imperial Spin",
    cost: 1,
    icon: Crown,
    color: "#f59e0b", // Amber/Gold
    gradient: "from-[#451a03] via-[#f59e0b] to-[#451a03]",
    description: "Jackpot Protocol",
    badge: "MAX ODDS"
  },
];

export function SpinButtons({ onSpin, disabled, canFreeSpin, freeSpinTimer }: SpinButtonsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-6xl mx-auto px-4 mt-8">
      {spinOptions.map((option, index) => {
        const Icon = option.icon;
        const isFreeSpin = option.id === "free";
        const isDisabled = disabled || (isFreeSpin && !canFreeSpin);
        
        return (
          <motion.button
            key={option.id}
            onClick={() => onSpin(option.id, option.cost)}
            disabled={isDisabled}
            className={`
              relative overflow-hidden rounded-[2rem] p-[1.5px] transition-all duration-500
              ${isDisabled ? 'opacity-30 grayscale cursor-not-allowed' : 'hover:scale-[1.03] active:scale-95 shadow-2xl shadow-black/50'}
              group
            `}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {/* Border Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-b ${option.gradient} opacity-20 group-hover:opacity-100 transition-opacity`} />
            
            {/* Main Button Body */}
            <div className="relative bg-[#0d0d12] rounded-[1.9rem] p-6 h-full flex flex-col items-center gap-4 border border-white/5 backdrop-blur-3xl overflow-hidden">
              
              {/* Decorative Background Element */}
              <div className="absolute -top-10 -right-10 w-24 h-24 blur-[40px] opacity-10 group-hover:opacity-30 transition-opacity" 
                   style={{ backgroundColor: option.color }} />

              {/* Top Badge */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5">
                <Zap className="w-2.5 h-2.5 text-gold" />
                <span className="text-[8px] font-black text-white/50 uppercase tracking-[0.2em]">
                  {option.badge}
                </span>
              </div>

              {/* Icon Container */}
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center group-hover:border-gold/30 group-hover:bg-gold/5 transition-all duration-500 transform group-hover:rotate-6">
                  <Icon className="w-8 h-8 text-white group-hover:text-gold transition-colors" 
                        style={{ filter: !isDisabled ? `drop-shadow(0 0 10px ${option.color}40)` : 'none' }} />
                </div>
              </div>

              {/* Labels */}
              <div className="text-center">
                <h3 className="font-black text-sm text-white uppercase tracking-wider mb-1 italic" style={{ fontFamily: 'Cinzel, serif' }}>
                  {option.label}
                </h3>
                <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.1em]">
                  {option.description}
                </p>
              </div>

              {/* Price / Status Area */}
              <div className="w-full mt-2 pt-4 border-t border-white/5 flex flex-col items-center">
                {isFreeSpin ? (
                  <div className={`text-[10px] font-black px-4 py-2 rounded-xl transition-all ${
                    canFreeSpin 
                    ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)] animate-pulse' 
                    : 'bg-white/5 text-white/20 border border-white/5'
                  }`}>
                    {canFreeSpin ? "READY TO SPIN" : freeSpinTimer}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-white tracking-tighter italic">
                      {option.cost}
                    </span>
                    <div className="flex flex-col items-start leading-none">
                       <span className="text-[10px] font-black text-gold">PI</span>
                       <span className="text-[7px] font-bold text-white/20 uppercase">Network</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Hover Shine Effect */}
              <div className="absolute inset-0 pointer-events-none">
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent"
                  initial={{ x: '-100%', y: '-100%' }}
                  whileHover={{ x: '100%', y: '100%' }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
