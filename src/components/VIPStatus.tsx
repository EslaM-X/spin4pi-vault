import { motion } from "framer-motion";
import { Crown, ChevronRight, Gem, Sparkles, Star, Award, ShieldCheck, Zap } from "lucide-react";
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

const tierIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Bronze: Award,
  Silver: Star,
  Gold: Gem,
  Platinum: Crown,
  Diamond: Sparkles
};

// تدرجات لونية "معدنية" فخمة تناسب الإمبراطورية
const tierColors: Record<string, string> = {
  Bronze: "from-[#a77044] via-[#f3cf14] to-[#a77044]", // نحاسي ملكي
  Silver: "from-[#757F9A] to-[#D7DDE8]", // فضي كريستالي
  Gold: "from-[#BF953F] via-[#FCF6BA] to-[#B38728]", // ذهبي خالص
  Platinum: "from-[#e5e4e2] via-[#ffffff] to-[#7f8c8d]", // بلاتينيوم
  Diamond: "from-[#00d2ff] via-[#92fe9d] to-[#00d2ff]" // ماسي متوهج
};

export function VIPStatus({ totalSpins, compact = false }: { totalSpins: number, compact?: boolean }) {
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

  const currentTier = [...tiers].reverse().find(t => totalSpins >= t.min_total_spins) || tiers[0];
  const nextTier = tiers.find(t => t.level === currentTier.level + 1);
  const progressToNext = nextTier 
    ? ((totalSpins - currentTier.min_total_spins) / (nextTier.min_total_spins - currentTier.min_total_spins)) * 100
    : 100;

  const TierIcon = tierIcons[currentTier.name] || Crown;
  const tierGradient = tierColors[currentTier.name] || tierColors.Bronze;

  if (compact) {
    return (
      <motion.div 
        className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r ${tierGradient} shadow-lg border border-white/20`}
        whileHover={{ scale: 1.05 }}
      >
        <TierIcon className="w-3.5 h-3.5 text-black/80" />
        <span className="text-[10px] font-black text-black uppercase tracking-widest italic">{currentTier.name}</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="relative p-6 rounded-[2.5rem] bg-[#0d0d12]/90 border-2 border-gold/10 overflow-hidden backdrop-blur-xl shadow-2xl group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* هالة الضوء خلف الرتبة */}
      <div className={`absolute -top-10 -left-10 w-40 h-40 bg-gradient-to-br ${tierGradient} opacity-5 blur-[80px] rounded-full`} />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-[1.5rem] bg-gradient-to-br ${tierGradient} p-[2px] shadow-2xl transform rotate-3 group-hover:rotate-0 transition-transform duration-500`}>
              <div className="w-full h-full rounded-[1.4rem] bg-black flex items-center justify-center">
                <TierIcon className={`w-8 h-8 bg-gradient-to-br ${tierGradient} bg-clip-text text-transparent`} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3 h-3 text-gold/50" />
                <span className="text-[10px] font-black text-gold/50 uppercase tracking-[0.3em]">Imperial Rank</span>
              </div>
              <h3 className="font-black text-2xl text-white italic tracking-widest uppercase" style={{ fontFamily: 'Cinzel, serif' }}>
                {currentTier.name}
              </h3>
            </div>
          </div>
          
          <div className="text-right">
            <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5">
               <p className="text-[10px] font-black text-gold uppercase leading-none">Level</p>
               <p className="text-xl font-black text-white italic leading-none mt-1">{currentTier.level}</p>
            </div>
          </div>
        </div>

        {/* مسار الترقية (Progress) */}
        {nextTier && (
          <div className="mb-8 space-y-3">
            <div className="flex justify-between items-end px-1">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{totalSpins} / {nextTier.min_total_spins} Spins</span>
              <span className="text-[10px] font-black text-gold uppercase tracking-widest flex items-center gap-1">
                Next: {nextTier.name} <ChevronRight className="w-3 h-3" />
              </span>
            </div>
            <div className="relative h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                <motion.div 
                  className={`h-full rounded-full bg-gradient-to-r ${tierGradient} shadow-[0_0_15px_rgba(251,191,36,0.5)]`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressToNext}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
            </div>
          </div>
        )}

        {/* الامتيازات الملكية (Benefits) */}
        <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
                <Zap className="w-4 h-4 text-amber-400" />
                <div>
                   <p className="text-[8px] font-black text-white/20 uppercase">Spin Discount</p>
                   <p className="text-xs font-black text-white">{(currentTier.spin_discount * 100).toFixed(0)}% OFF</p>
                </div>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-gold" />
                <div>
                   <p className="text-[8px] font-black text-white/20 uppercase">Win Multiplier</p>
                   <p className="text-xs font-black text-white">{currentTier.bonus_multiplier}x POWER</p>
                </div>
            </div>
        </div>

        {/* المكافآت الحصرية */}
        <div className="flex flex-wrap gap-2">
            {currentTier.exclusive_rewards.map((reward, i) => (
              <span key={i} className="px-3 py-1 text-[9px] font-black bg-gold/5 border border-gold/20 text-gold rounded-lg uppercase tracking-wider">
                {reward}
              </span>
            ))}
        </div>
      </div>
    </motion.div>
  );
}
