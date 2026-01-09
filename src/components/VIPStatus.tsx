import { motion } from "framer-motion";
import { Crown, ChevronRight, Gem, Sparkles, Star, Award } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";

interface VIPTier {
  id: string;
  name: string;
  level: number;
  min_total_spins: number;
  spin_discount: number;
  bonus_multiplier: number;
  exclusive_rewards: string[];
}

interface VIPStatusProps {
  totalSpins: number;
  compact?: boolean;
}

const tierIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Bronze: Award,
  Silver: Star,
  Gold: Gem,
  Platinum: Crown,
  Diamond: Sparkles
};

const tierColors: Record<string, string> = {
  Bronze: "from-amber-700 to-amber-900",
  Silver: "from-slate-300 to-slate-500",
  Gold: "from-gold to-gold-dark",
  Platinum: "from-violet-400 to-violet-600",
  Diamond: "from-cyan-300 via-blue-400 to-purple-500"
};

export function VIPStatus({ totalSpins, compact = false }: VIPStatusProps) {
  const { data: tiers } = useQuery({
    queryKey: ['vip-tiers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vip_tiers')
        .select('*')
        .order('level', { ascending: true });
      if (error) throw error;
      return data as VIPTier[];
    }
  });

  if (!tiers || tiers.length === 0) return null;

  // Find current tier
  const currentTier = [...tiers].reverse().find(t => totalSpins >= t.min_total_spins) || tiers[0];
  const nextTier = tiers.find(t => t.level === currentTier.level + 1);
  
  const spinsToNext = nextTier ? nextTier.min_total_spins - totalSpins : 0;
  const progressToNext = nextTier 
    ? ((totalSpins - currentTier.min_total_spins) / (nextTier.min_total_spins - currentTier.min_total_spins)) * 100
    : 100;

  const TierIcon = tierIcons[currentTier.name] || Crown;
  const tierGradient = tierColors[currentTier.name] || tierColors.Bronze;

  if (compact) {
    return (
      <motion.div 
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${tierGradient}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <TierIcon className="w-4 h-4 text-white" />
        <span className="text-sm font-bold text-white">{currentTier.name}</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="p-6 rounded-2xl bg-card border border-border overflow-hidden relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${tierGradient} opacity-10`} />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${tierGradient} flex items-center justify-center shadow-lg`}>
              <TierIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold">{currentTier.name} VIP</h3>
              <p className="text-sm text-muted-foreground">Level {currentTier.level}</p>
            </div>
          </div>
          
          {nextTier && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Next tier</p>
              <div className="flex items-center gap-1 text-gold">
                <span className="font-semibold">{nextTier.name}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          )}
        </div>

        {/* Progress to next tier */}
        {nextTier && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>{totalSpins} spins</span>
              <span className="text-muted-foreground">{spinsToNext} more to {nextTier.name}</span>
            </div>
            <Progress value={progressToNext} className="h-2" />
          </div>
        )}

        {/* Current benefits */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-muted-foreground">Your Benefits</h4>
          <div className="grid grid-cols-2 gap-2">
            {currentTier.spin_discount > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>{(currentTier.spin_discount * 100).toFixed(0)}% spin discount</span>
              </div>
            )}
            {currentTier.bonus_multiplier > 1 && (
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-gold" />
                <span>{currentTier.bonus_multiplier}x win multiplier</span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {currentTier.exclusive_rewards.map((reward, i) => (
              <span 
                key={i} 
                className="px-2 py-1 text-xs bg-muted rounded-full"
              >
                {reward}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
