import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, TrendingUp, Shield, Zap, Crown, Percent } from "lucide-react";
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

const UTILITY_CONFIG: Record<string, { icon: React.ReactNode; description: string; color: string }> = {
  luck_boost: {
    icon: <Sparkles className="w-4 h-4" />,
    description: "-5% lose chance",
    color: "from-green-500 to-emerald-500"
  },
  multiplier: {
    icon: <TrendingUp className="w-4 h-4" />,
    description: "1.5x Pi rewards",
    color: "from-amber-500 to-yellow-500"
  },
  vip_access: {
    icon: <Crown className="w-4 h-4" />,
    description: "-3% lose, 1.2x, +1% jackpot",
    color: "from-purple-500 to-pink-500"
  },
  discount: {
    icon: <Percent className="w-4 h-4" />,
    description: "10% spin discount",
    color: "from-blue-500 to-cyan-500"
  },
  jackpot_boost: {
    icon: <Zap className="w-4 h-4" />,
    description: "+2% jackpot chance",
    color: "from-orange-500 to-red-500"
  },
  loss_protection: {
    icon: <Shield className="w-4 h-4" />,
    description: "-10% lose chance",
    color: "from-teal-500 to-green-500"
  }
};

export function ActiveBoostsIndicator({ piUsername, isSpinning }: ActiveBoostsIndicatorProps) {
  const [activeBoosts, setActiveBoosts] = useState<Boost[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (piUsername) {
      fetchActiveBoosts();
    } else {
      setActiveBoosts([]);
    }
  }, [piUsername]);

  const fetchActiveBoosts = async () => {
    if (!piUsername) return;
    
    setIsLoading(true);
    try {
      // Get profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('pi_username', piUsername)
        .single();

      if (!profile) return;

      // Get equipped NFTs
      const { data: equippedNfts } = await supabase
        .from('nft_ownership')
        .select('nft_asset_id')
        .eq('profile_id', profile.id)
        .eq('is_equipped', true);

      if (!equippedNfts || equippedNfts.length === 0) {
        setActiveBoosts([]);
        return;
      }

      // Get NFT details
      const nftIds = equippedNfts.map(n => n.nft_asset_id);
      const { data: nftAssets } = await supabase
        .from('nft_assets')
        .select('name, utility')
        .in('id', nftIds);

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
    } finally {
      setIsLoading(false);
    }
  };

  if (!piUsername || activeBoosts.length === 0) {
    return null;
  }

  return (
    <motion.div
      className={`p-4 rounded-xl border ${isSpinning ? 'border-primary bg-primary/10' : 'border-border bg-card/80'} backdrop-blur-sm`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className={`w-5 h-5 ${isSpinning ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
        <span className="font-medium text-foreground">
          {isSpinning ? 'Active Boosts Applied!' : 'Equipped Boosts'}
        </span>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {activeBoosts.map((boost, index) => {
            const config = UTILITY_CONFIG[boost.utility];
            return (
              <motion.div
                key={boost.utility}
                className={`flex items-center gap-3 p-2 rounded-lg ${
                  isSpinning 
                    ? `bg-gradient-to-r ${config.color} text-white` 
                    : 'bg-muted/50'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                  scale: isSpinning ? [1, 1.02, 1] : 1
                }}
                transition={{ 
                  delay: index * 0.1,
                  scale: { repeat: isSpinning ? Infinity : 0, duration: 0.5 }
                }}
              >
                <div className={`p-1.5 rounded-full ${isSpinning ? 'bg-white/20' : 'bg-primary/20'}`}>
                  {boost.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isSpinning ? 'text-white' : 'text-foreground'}`}>
                    {boost.name}
                  </p>
                  <p className={`text-xs ${isSpinning ? 'text-white/80' : 'text-muted-foreground'}`}>
                    {boost.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {isSpinning && (
        <motion.div
          className="mt-3 text-center text-sm text-primary font-medium"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          ✨ Boosting your spin! ✨
        </motion.div>
      )}
    </motion.div>
  );
}
