import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Crown, Gem, Star, Award, Sparkles, 
  Check, Zap, Lock 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { usePiAuth } from '@/hooks/usePiAuth';
import GlobalLoading from '@/components/GlobalLoading';

interface VIPTier {
  id: string;
  name: string;
  level: number;
  min_total_spins: number;
  spin_discount: number;
  bonus_multiplier: number;
  exclusive_rewards: string[];
}

const tierIcons: Record<string, any> = {
  Bronze: Award,
  Silver: Star,
  Gold: Gem,
  Platinum: Crown,
  Diamond: Sparkles
};

const tierColors: Record<string, { gradient: string; border: string; bg: string; text: string }> = {
  Bronze: { gradient: "from-[#CD7F32] via-[#8B4513] to-[#CD7F32]", border: "border-[#CD7F32]/40", bg: "bg-[#CD7F32]/10", text: "text-[#CD7F32]" },
  Silver: { gradient: "from-[#C0C0C0] via-[#708090] to-[#C0C0C0]", border: "border-[#C0C0C0]/40", bg: "bg-[#C0C0C0]/10", text: "text-[#C0C0C0]" },
  Gold: { gradient: "from-[#D4AF37] via-[#B8860B] to-[#D4AF37]", border: "border-gold/40", bg: "bg-gold/10", text: "text-gold" },
  Platinum: { gradient: "from-[#E5E4E2] via-[#A9A9A9] to-[#E5E4E2]", border: "border-[#E5E4E2]/40", bg: "bg-[#E5E4E2]/10", text: "text-[#E5E4E2]" },
  Diamond: { gradient: "from-[#B9F2FF] via-[#00D1FF] to-[#7000FF]", border: "border-cyan-400/40", bg: "bg-cyan-500/10", text: "text-cyan-400" }
};

const VIPBenefits = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = usePiAuth();
  const [totalSpins, setTotalSpins] = useState(0);

  useEffect(() => {
    const hasConsented = localStorage.getItem('imperial_legal_consent');
    if (!authLoading && (!isAuthenticated || !hasConsented)) {
      navigate('/');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (user?.username) {
      fetchSpins(user.username);
    }
  }, [user]);

  const fetchSpins = async (piUsername: string) => {
    const { data } = await supabase.from('profiles').select('total_spins').eq('pi_username', piUsername).maybeSingle();
    if (data) setTotalSpins(data.total_spins || 0);
  };

  const { data: tiers, isLoading: tiersLoading } = useQuery({
    queryKey: ['vip-tiers'],
    queryFn: async () => {
      const { data, error } = await supabase.from('vip_tiers').select('*').order('level', { ascending: true });
      if (error) throw error;
      return data as VIPTier[];
    }
  });

  const currentTier = tiers ? [...tiers].reverse().find(t => totalSpins >= t.min_total_spins) || tiers[0] : null;
  const nextTier = tiers && currentTier ? tiers.find(t => t.level === currentTier.level + 1) : null;

  if (authLoading || tiersLoading) return <GlobalLoading isVisible={true} />;

  return (
    <div className="min-h-screen bg-[#050507] text-white pb-24 overflow-x-hidden">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.05),transparent)] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 pt-12 relative z-10">
        <header className="mb-10">
          <Link to="/profile" className="inline-flex items-center gap-2 text-white/20 hover:text-gold mb-6 transition-all group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1" />
            <span className="text-[10px] font-black uppercase tracking-[3px]">Identity Hub</span>
          </Link>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-gold uppercase tracking-[5px]">Spin4Pi Elite</p>
            <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase leading-none">VIP <span className="text-gold">STATUS</span></h1>
          </div>
        </header>

        {currentTier && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <Card className="relative border-0 bg-[#0d0d12] rounded-[35px] md:rounded-[45px] overflow-hidden shadow-2xl">
              <div className={`absolute inset-0 bg-gradient-to-br ${tierColors[currentTier.name]?.gradient} opacity-5`} />
              <CardContent className="relative p-6 md:p-12 z-10">
                <div className="flex flex-col gap-8">
                  <div className="flex flex-wrap items-center gap-5 md:gap-8">
                    <div className={`w-20 h-20 md:w-28 md:h-28 rounded-[25px] md:rounded-[30px] bg-gradient-to-br ${tierColors[currentTier.name]?.gradient} flex items-center justify-center shadow-2xl shrink-0`}>
                      {(() => { const Icon = tierIcons[currentTier.name] || Crown; return <Icon className="w-10 h-10 md:w-14 md:h-14 text-white" />; })()}
                    </div>
                    <div className="min-w-[150px]">
                      <span className="text-[9px] font-black text-white/30 uppercase tracking-[4px]">Active Rank</span>
                      <h2 className={`text-4xl md:text-7xl font-black italic uppercase tracking-tighter ${tierColors[currentTier.name]?.text} leading-tight`}>
                        {currentTier.name}
                      </h2>
                      <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1 rounded-full mt-2">
                        <Zap className="w-3 h-3 text-gold fill-gold" />
                        <span className="text-[9px] font-black uppercase text-white/70">{totalSpins} Lifetime Spins</span>
                      </div>
                    </div>
                  </div>

                  {nextTier && (
                    <div className="bg-black/40 p-5 md:p-8 rounded-[25px] md:rounded-[35px] border border-white/5 space-y-4">
                      <div className="flex justify-between items-end px-1">
                        <span className="text-[9px] font-black text-white/20 uppercase tracking-[2px]">Next: {nextTier.name}</span>
                        <span className="text-[10px] font-black italic text-gold">{nextTier.min_total_spins - totalSpins} Spins Left</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (totalSpins / nextTier.min_total_spins) * 100)}%` }}
                          className={`h-full rounded-full bg-gradient-to-r ${tierColors[currentTier.name]?.gradient}`}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="space-y-6">
          <div className="flex items-center gap-4 px-2">
            <h3 className="text-[10px] font-black italic uppercase tracking-[4px] text-white/30">Protocol Tiers</h3>
            <div className="h-[1px] flex-1 bg-white/5" />
          </div>

          <div className="grid gap-3">
            {tiers?.map((tier, idx) => {
              const isUnlocked = totalSpins >= tier.min_total_spins;
              const isCurrent = currentTier?.id === tier.id;
              const colors = tierColors[tier.name];
              const Icon = tierIcons[tier.name] || Crown;

              return (
                <motion.div key={tier.id} className={`${!isUnlocked && 'opacity-30 grayscale'}`}>
                  <div className={`p-4 md:p-6 bg-[#0d0d12]/60 rounded-[25px] border ${isCurrent ? `border-2 ${colors.border}` : 'border border-white/5'} flex items-center justify-between`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isUnlocked ? `bg-gradient-to-br ${colors.gradient}` : 'bg-white/5'}`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className={`text-lg font-black italic uppercase tracking-tighter ${isUnlocked ? colors.text : 'text-white/20'}`}>{tier.name}</h4>
                        <p className="text-[8px] font-black text-white/20 uppercase">Min Spins: {tier.min_total_spins}</p>
                      </div>
                    </div>
                    {isUnlocked ? <Check className={`w-5 h-5 ${colors.text}`} /> : <Lock className="w-4 h-4 text-white/10" />}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VIPBenefits;
