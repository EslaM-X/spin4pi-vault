import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, TrendingUp, Shield, Zap, Crown, Percent, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Boost {
  name: string;
  utility: string;
  icon: React.ReactNode;
  description: string;
}

interface ActiveBoostsIndicatorProps {
  piUsername: string | null;
  isSpinning: boolean;
}

const UTILITY_CONFIG: Record<string, { icon: React.ReactNode; description: string; color: string; shadow: string }> = {
  luck_boost: {
    icon: <Sparkles className="w-4 h-4" />,
    description: "-5% Lose Chance",
    color: "from-emerald-400 to-green-600",
    shadow: "shadow-green-500/20"
  },
  multiplier: {
    icon: <TrendingUp className="w-4 h-4" />,
    description: "1.5x Pi Rewards",
    color: "from-amber-400 to-orange-600",
    shadow: "shadow-orange-500/20"
  },
  vip_access: {
    icon: <Crown className="w-4 h-4" />,
    description: "Imperial Perks Active",
    color: "from-purple-500 to-indigo-600",
    shadow: "shadow-purple-500/20"
  },
  discount: {
    icon: <Percent className="w-4 h-4" />,
    description: "10% Spin Discount",
    color: "from-blue-400 to-cyan-600",
    shadow: "shadow-blue-500/20"
  },
  jackpot_boost: {
    icon: <Zap className="w-4 h-4" />,
    description: "+2% Jackpot Chance",
    color: "from-red-500 to-rose-600",
    shadow: "shadow-red-500/20"
  },
  loss_protection: {
    icon: <Shield className="w-4 h-4" />,
    description: "Loss Protection Shield",
    color: "from-teal-400 to-emerald-600",
    shadow: "shadow-teal-500/20"
  }
};

export function ActiveBoostsIndicator({ piUsername, isSpinning }: ActiveBoostsIndicatorProps) {
  const [activeBoosts, setActiveBoosts] = useState<Boost[]>([]);

  useEffect(() => {
    if (piUsername) fetchActiveBoosts();
    else setActiveBoosts([]);
  }, [piUsername]);

  const fetchActiveBoosts = async () => {
    if (!piUsername) return;
    try {
      const { data: profile } = await supabase.from('profiles').select('id').eq('pi_username', piUsername).single();
      if (!profile) return;

      const { data: equippedNfts } = await supabase.from('nft_ownership').select('nft_asset_id').eq('profile_id', profile.id).eq('is_equipped', true);
      if (!equippedNfts || equippedNfts.length === 0) {
        setActiveBoosts([]);
        return;
      }

      const nftIds = equippedNfts.map(n => n.nft_asset_id);
      const { data: nftAssets } = await supabase.from('nft_assets').select('name, utility').in('id', nftIds);

      if (nftAssets) {
        const boosts = nftAssets
          .filter(nft => UTILITY_CONFIG[nft.utility])
          .map(nft => ({
            name: nft.name,
            utility: nft.utility,
            icon: UTILITY_CONFIG[nft.utility].icon,
            description: UTILITY_CONFIG[nft.utility].description
          }));
        setActiveBoosts(boosts);
      }
    } catch (error) {
      console.error('Error fetching boosts:', error);
    }
  };

  if (!piUsername || activeBoosts.length === 0) return null;

  return (
    <motion.div
      className={`relative overflow-hidden rounded-[2rem] border-2 transition-all duration-500 p-5 ${
        isSpinning 
          ? 'bg-[#0d0d12] border-gold/40 shadow-[0_0_40px_rgba(251,191,36,0.15)]' 
          : 'bg-black/40 border-white/5 backdrop-blur-xl'
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* HUD Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${isSpinning ? 'bg-gold/20' : 'bg-white/5'}`}>
            <Zap className={`w-4 h-4 ${isSpinning ? 'text-gold animate-pulse' : 'text-white/40'}`} />
          </div>
          <span className="text-xs font-black uppercase tracking-[0.2em] text-white/70">
            System Boosts
          </span>
        </div>
        {isSpinning && (
          <motion.div 
            animate={{ opacity: [0, 1, 0] }} 
            transition={{ repeat: Infinity, duration: 1 }}
            className="flex items-center gap-1 bg-gold/10 px-2 py-0.5 rounded text-[10px] font-bold text-gold border border-gold/20"
          >
            <Flame className="w-3 h-3 fill-gold" /> OVERDRIVE
          </motion.div>
        )}
      </div>

      {/* Boosts Grid */}
      <div className="grid gap-3">
        <AnimatePresence mode="popLayout">
          {activeBoosts.map((boost, index) => {
            const config = UTILITY_CONFIG[boost.utility];
            return (
              <motion.div
                key={boost.utility}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`group relative flex items-center gap-4 p-3 rounded-2xl border transition-all ${
                  isSpinning 
                    ? `bg-gradient-to-r ${config.color} border-white/20 shadow-lg ${config.shadow}` 
                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                }`}
              >
                {/* Icon Capsule */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform ${
                  isSpinning ? 'bg-white/20 rotate-12' : 'bg-black/40 group-hover:rotate-12'
                }`}>
                  <div className={isSpinning ? 'text-white' : 'text-white/60'}>
                    {boost.icon}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-[11px] font-black uppercase tracking-tight ${isSpinning ? 'text-white' : 'text-white/80'}`}>
                    {boost.name}
                  </p>
                  <p className={`text-[10px] font-bold ${isSpinning ? 'text-white/70' : 'text-white/30'}`}>
                    {boost.description}
                  </p>
                </div>

                {/* Spinning Particle Effect */}
                {isSpinning && (
                  <motion.div
                    className="absolute inset-0 bg-white/10 rounded-2xl"
                    animate={{ opacity: [0, 0.2, 0] }}
                    transition={{ repeat: Infinity, duration: 0.5, delay: index * 0.1 }}
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Bottom Status */}
      {isSpinning && (
        <motion.div
          className="mt-4 pt-3 border-t border-white/10 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-gold animate-spin" />
            <span className="text-[10px] font-black text-gold uppercase tracking-[0.3em]">
              Probability Enhanced
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
