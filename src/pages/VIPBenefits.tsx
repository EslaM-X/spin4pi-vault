import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Crown, Gem, Star, Award, Sparkles, 
  Check, ChevronRight, Zap, ShieldAlert, Lock 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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

const tierIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Bronze: Award,
  Silver: Star,
  Gold: Gem,
  Platinum: Crown,
  Diamond: Sparkles
};

const tierColors: Record<string, { gradient: string; border: string; bg: string; text: string }> = {
  Bronze: { gradient: "from-[#CD7F32] to-[#8B4513]", border: "border-[#CD7F32]/30", bg: "bg-[#CD7F32]/10", text: "text-[#CD7F32]" },
  Silver: { gradient: "from-[#C0C0C0] to-[#708090]", border: "border-[#C0C0C0]/30", bg: "bg-[#C0C0C0]/10", text: "text-[#C0C0C0]" },
  Gold: { gradient: "from-[#D4AF37] to-[#B8860B]", border: "border-gold/30", bg: "bg-gold/10", text: "text-gold" },
  Platinum: { gradient: "from-[#E5E4E2] to-[#A9A9A9]", border: "border-[#E5E4E2]/30", bg: "bg-[#E5E4E2]/10", text: "text-[#E5E4E2]" },
  Diamond: { gradient: "from-[#B9F2FF] via-[#00D1FF] to-[#7000FF]", border: "border-cyan-400/30", bg: "bg-cyan-500/10", text: "text-cyan-400" }
};

const VIPBenefits = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = usePiAuth();
  const [totalSpins, setTotalSpins] = useState(0);

  // الفحص الإمبراطوري (الدخول + الموافقة القانونية)
  useEffect(() => {
    const hasConsented = localStorage.getItem('imperial_legal_consent');
    if (!authLoading) {
      if (!isAuthenticated || !hasConsented) {
        navigate('/');
        if (!hasConsented && isAuthenticated) {
          toast.error("Imperial Access Denied: Consent Required", {
            icon: <ShieldAlert className="text-gold" />
          });
        }
      }
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (user?.username) {
      fetchSpins(user.username);
    }
  }, [user]);

  const fetchSpins = async (piUsername: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('total_spins')
      .eq('pi_username', piUsername)
      .maybeSingle();
    if (data) setTotalSpins(data.total_spins || 0);
  };

  const { data: tiers } = useQuery({
    queryKey: ['vip-tiers'],
    queryFn: async () => {
      const { data, error } = await supabase.from('vip_tiers').select('*').order('level', { ascending: true });
      if (error) throw error;
      return data as VIPTier[];
    }
  });

  const currentTier = tiers ? [...tiers].reverse().find(t => totalSpins >= t.min_total_spins) || tiers[0] : null;
  const nextTier = tiers && currentTier ? tiers.find(t => t.level === currentTier.level + 1) : null;

  if (authLoading || !isAuthenticated) return <GlobalLoading isVisible={true} />;

  return (
    <div className="min-h-screen bg-[#050507] text-white">
      {/* Background Decor */}
      <div className="fixed inset-0 bg-[url('/stars-pattern.svg')] opacity-10 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-b from-gold/5 via-transparent to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-6 mb-12">
          <Button 
            variant="ghost" 
            size="icon" 
            asChild 
            className="w-12 h-12 rounded-2xl border border-white/5 bg-white/5 hover:bg-gold/10 hover:text-gold transition-all"
          >
            <Link to="/profile"><ArrowLeft className="w-5 h-5" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
               <div className="h-[1px] w-8 bg-gold" />
               <span className="text-[10px] font-black text-gold uppercase tracking-[4px]">Elite Status</span>
            </div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase flex items-center gap-3">
              <Crown className="w-10 h-10 text-gold drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]" />
              VIP <span className="text-gold">BENEFITS</span>
            </h1>
          </div>
        </motion.div>

        {/* Current Status - The "Imperial Passport" Card */}
        {currentTier && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-16">
            <Card className={`relative overflow-hidden bg-[#0d0d12] border-2 ${tierColors[currentTier.name]?.border} rounded-[40px] shadow-[0_0_50px_rgba(0,0,0,0.5)]`}>
              {/* Card Glow Effect */}
              <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${tierColors[currentTier.name]?.gradient} opacity-10 blur-[80px]`} />
              
              <CardContent className="p-8 md:p-12 relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10">
                  <div className="flex items-center gap-6">
                    <div className={`w-24 h-24 rounded-[30px] bg-gradient-to-br ${tierColors[currentTier.name]?.gradient} flex items-center justify-center shadow-2xl rotate-3 group-hover:rotate-0 transition-transform`}>
                      {tierIcons[currentTier.name] && (() => { const Icon = tierIcons[currentTier.name]; return <Icon className="w-12 h-12 text-white drop-shadow-md" />; })()}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-[3px] mb-1">Authorized Rank</p>
                      <h2 className={`text-4xl font-black italic uppercase tracking-tighter ${tierColors[currentTier.name]?.text}`}>
                        {currentTier.name} VIP
                      </h2>
                      <p className="text-white/60 font-bold uppercase text-[10px] mt-2 bg-white/5 px-3 py-1 rounded-full border border-white/5 inline-block">
                        {totalSpins} Imperial Spins Recorded
                      </p>
                    </div>
                  </div>

                  {nextTier && (
                    <div className="text-center md:text-right bg-white/5 p-6 rounded-[30px] border border-white/5 backdrop-blur-sm">
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-[2px] mb-1">Next Evolution</p>
                      <div className="flex items-center gap-2 justify-center md:justify-end">
                         <span className="text-3xl font-black italic text-gold">{nextTier.min_total_spins - totalSpins}</span>
                         <span className="text-xs font-bold text-white/60">SPINS LEFT</span>
                      </div>
                      <p className={`text-[10px] font-black uppercase mt-1 ${tierColors[nextTier.name]?.text}`}>TO {nextTier.name} RANK</p>
                    </div>
                  )}
                </div>

                {nextTier && (
                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
                      <span>{currentTier.name}</span>
                      <span>{nextTier.name}</span>
                    </div>
                    <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/5 p-1">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${((totalSpins - currentTier.min_total_spins) / (nextTier.min_total_spins - currentTier.min_total_spins)) * 100}%` }}
                         className={`h-full rounded-full bg-gradient-to-r ${tierColors[currentTier.name]?.gradient} shadow-[0_0_15px_rgba(212,175,55,0.5)]`}
                       />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* All VIP Tiers Grid */}
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-black italic uppercase tracking-widest">Imperial Hierarchy</h3>
            <div className="h-[1px] flex-1 bg-white/5" />
          </div>
          
          <div className="grid gap-6">
            {tiers?.map((tier, index) => {
              const Icon = tierIcons[tier.name] || Crown;
              const colors = tierColors[tier.name] || tierColors.Bronze;
              const isUnlocked = totalSpins >= tier.min_total_spins;
              const isCurrent = currentTier?.id === tier.id;

              return (
                <motion.div 
                  key={tier.id} 
                  initial={{ opacity: 0, x: -20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`relative overflow-hidden bg-[#0d0d12] transition-all duration-500 rounded-[32px] ${isCurrent ? `border-2 ${colors.border}` : 'border border-white/5'} ${!isUnlocked && 'opacity-40 grayscale'}`}>
                    <CardContent className="p-8">
                      <div className="flex flex-col md:flex-row md:items-center gap-8">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-xl ${isUnlocked ? `bg-gradient-to-br ${colors.gradient}` : 'bg-white/5'}`}>
                          <Icon className={`w-8 h-8 ${isUnlocked ? 'text-white' : 'text-white/20'}`} />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className={`text-2xl font-black italic uppercase tracking-tighter ${isUnlocked ? colors.text : 'text-white/40'}`}>
                              {tier.name} Rank
                            </h4>
                            {isCurrent && <span className="px-3 py-1 text-[8px] font-black bg-gold text-black rounded-full uppercase tracking-widest">Active</span>}
                            {!isUnlocked && <Lock className="w-4 h-4 text-white/20" />}
                          </div>
                          <p className="text-[10px] font-bold text-white/30 uppercase tracking-[2px] mb-6">
                            {tier.min_total_spins === 0 ? 'Entry Level Protocol' : `Requires ${tier.min_total_spins} Completed Spins`}
                          </p>
                          
                          <div className="grid sm:grid-cols-2 gap-4">
                            {tier.spin_discount > 0 && (
                              <div className="flex items-center gap-3 bg-white/[0.02] p-3 rounded-2xl border border-white/5">
                                <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}><Zap className={`w-5 h-5 ${colors.text}`} /></div>
                                <span className="text-xs font-black italic uppercase tracking-tight">{(tier.spin_discount * 100).toFixed(0)}% Protocol Discount</span>
                              </div>
                            )}
                            {tier.bonus_multiplier > 1 && (
                              <div className="flex items-center gap-3 bg-white/[0.02] p-3 rounded-2xl border border-white/5">
                                <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}><Sparkles className={`w-5 h-5 ${colors.text}`} /></div>
                                <span className="text-xs font-black italic uppercase tracking-tight">{tier.bonus_multiplier}x Reward Magnifier</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap md:flex-col gap-2 min-w-[150px]">
                          {tier.exclusive_rewards.map((reward, i) => (
                            <div key={i} className={`flex items-center gap-2 px-4 py-2 text-[9px] font-black uppercase tracking-tighter rounded-xl ${colors.bg} ${colors.text} border ${colors.border}`}>
                              <Check className="w-3 h-3" /> {reward}
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-16 text-center">
          <Button asChild size="lg" className="h-16 px-12 rounded-2xl bg-gradient-to-r from-gold to-[#B8860B] text-black font-black uppercase tracking-[3px] text-xs shadow-[0_0_30px_rgba(212,175,55,0.3)] hover:scale-105 active:scale-95 transition-all gap-3">
            <Link to="/"><Zap className="w-5 h-5 fill-current" /> Initialize Next Spin</Link>
          </Button>
          <p className="mt-6 text-[9px] font-bold text-white/20 uppercase tracking-[4px]">Ascend the ranks to maximize Pi yield</p>
        </motion.div>
      </div>
    </div>
  );
};

export default VIPBenefits;
