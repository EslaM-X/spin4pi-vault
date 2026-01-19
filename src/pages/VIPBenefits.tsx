import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Crown, Gem, Star, Award, Sparkles, 
  Check, ChevronRight, Zap, ShieldAlert, Lock, Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { usePiAuth } from '@/hooks/usePiAuth';
import { toast } from 'sonner';
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

const tierColors: Record<string, { gradient: string; border: string; bg: string; text: string; glow: string }> = {
  Bronze: { gradient: "from-[#CD7F32] to-[#8B4513]", border: "border-[#CD7F32]/30", bg: "bg-[#CD7F32]/10", text: "text-[#CD7F32]", glow: "shadow-[#CD7F32]/20" },
  Silver: { gradient: "from-[#C0C0C0] to-[#708090]", border: "border-[#C0C0C0]/30", bg: "bg-[#C0C0C0]/10", text: "text-[#C0C0C0]", glow: "shadow-[#C0C0C0]/20" },
  Gold: { gradient: "from-[#D4AF37] to-[#B8860B]", border: "border-gold/30", bg: "bg-gold/10", text: "text-gold", glow: "shadow-gold/20" },
  Platinum: { gradient: "from-[#E5E4E2] to-[#A9A9A9]", border: "border-[#E5E4E2]/30", bg: "bg-[#E5E4E2]/10", text: "text-[#E5E4E2]", glow: "shadow-[#E5E4E2]/20" },
  Diamond: { gradient: "from-[#B9F2FF] via-[#00D1FF] to-[#7000FF]", border: "border-cyan-400/30", bg: "bg-cyan-500/10", text: "text-cyan-400", glow: "shadow-cyan-400/20" }
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
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.03),transparent)] pointer-events-none" />

      <div className="container mx-auto px-6 pt-12 relative z-10">
        {/* Header */}
        <header className="mb-16">
          <Link to="/profile" className="inline-flex items-center gap-2 text-white/30 hover:text-gold transition-colors mb-8 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1" />
            <span className="text-[10px] font-black uppercase tracking-[2px]">Identity Hub</span>
          </Link>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <p className="text-[10px] font-black text-gold uppercase tracking-[4px] mb-3">Spin4Pi Elite</p>
              <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none">VIP <span className="text-gold">STATUS</span></h1>
            </div>
          </div>
        </header>

        {/* Active Rank Card */}
        {currentTier && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-20">
            <Card className={`relative border-0 bg-[#0d0d12] rounded-[48px] overflow-hidden p-[2px]`}>
              {/* Shine Animation Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-r ${tierColors[currentTier.name]?.gradient} opacity-20`} />
              
              <CardContent className="relative bg-[#0d0d12] rounded-[46px] p-8 md:p-14 z-10">
                <div className="flex flex-col lg:flex-row justify-between gap-12">
                  <div className="flex items-center gap-8">
                    <div className={`w-24 h-24 md:w-32 md:h-32 rounded-[35px] bg-gradient-to-br ${tierColors[currentTier.name]?.gradient} flex items-center justify-center shadow-2xl relative group`}>
                      <div className="absolute inset-0 bg-white/20 rounded-[35px] opacity-0 group-hover:opacity-100 transition-opacity" />
                      {(() => { const Icon = tierIcons[currentTier.name] || Crown; return <Icon className="w-12 h-12 md:w-16 md:h-16 text-white drop-shadow-2xl" />; })()}
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-white/30 uppercase tracking-[4px]">Current Rank</span>
                      <h2 className={`text-5xl md:text-6xl font-black italic uppercase tracking-tighter ${tierColors[currentTier.name]?.text} mb-4`}>
                        {currentTier.name}
                      </h2>
                      <div className="inline-flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                        <Zap className="w-3 h-3 text-gold" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{totalSpins} Lifetime Spins</span>
                      </div>
                    </div>
                  </div>

                  {nextTier && (
                    <div className="lg:w-1/3 flex flex-col justify-center">
                      <div className="flex justify-between items-end mb-4">
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Next: {nextTier.name}</span>
                        <span className="text-xs font-black italic text-gold">{nextTier.min_total_spins - totalSpins} Spins Remaining</span>
                      </div>
                      <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (totalSpins / nextTier.min_total_spins) * 100)}%` }}
                          className={`h-full bg-gradient-to-r ${tierColors[currentTier.name]?.gradient} shadow-[0_0_20px_rgba(212,175,55,0.3)]`}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Tiers List */}
        <div className="grid grid-cols-1 gap-6">
          <div className="flex items-center gap-4 mb-4">
            <h3 className="text-xl font-black italic uppercase tracking-widest">Protocol Tiers</h3>
            <div className="h-[1px] flex-1 bg-white/5" />
          </div>

          {tiers?.map((tier, idx) => {
            const isUnlocked = totalSpins >= tier.min_total_spins;
            const isCurrent = currentTier?.id === tier.id;
            const colors = tierColors[tier.name];
            const Icon = tierIcons[tier.name] || Crown;

            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`relative group ${!isUnlocked && 'opacity-40 grayscale'}`}
              >
                <div className={`p-6 md:p-10 bg-[#0d0d12]/60 rounded-[40px] border ${isCurrent ? colors.border : 'border-white/5'} hover:border-white/10 transition-all flex flex-col md:flex-row items-start md:items-center gap-8`}>
                  <div className={`w-16 h-16 rounded-2xl shrink-0 flex items-center justify-center ${isUnlocked ? `bg-gradient-to-br ${colors.gradient}` : 'bg-white/5'}`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className={`text-2xl font-black italic uppercase tracking-tighter ${isUnlocked ? colors.text : 'text-white/40'}`}>
                        {tier.name}
                      </h4>
                      {!isUnlocked && <Lock className="w-4 h-4 text-white/20" />}
                    </div>
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[2px] mb-6">
                      Required: {tier.min_total_spins} Spins
                    </p>

                    <div className="flex flex-wrap gap-3">
                      {tier.exclusive_rewards.map((reward, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/5 text-[9px] font-black uppercase tracking-widest text-white/60">
                          <Check className="w-3 h-3 text-gold" /> {reward}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex md:flex-col gap-3 min-w-[140px]">
                    <div className={`px-4 py-3 rounded-2xl bg-white/5 border border-white/5 text-center`}>
                       <span className={`block text-lg font-black italic ${isUnlocked ? colors.text : 'text-white/20'}`}>{(tier.spin_discount * 100).toFixed(0)}%</span>
                       <span className="text-[8px] font-black text-white/20 uppercase">Discount</span>
                    </div>
                    <div className={`px-4 py-3 rounded-2xl bg-white/5 border border-white/5 text-center`}>
                       <span className={`block text-lg font-black italic ${isUnlocked ? colors.text : 'text-white/20'}`}>{tier.bonus_multiplier}x</span>
                       <span className="text-[8px] font-black text-white/20 uppercase">Bonus</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VIPBenefits;
