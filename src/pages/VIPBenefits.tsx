import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Crown, Gem, Star, Award, Sparkles, Check, ChevronRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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

const tierIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Bronze: Award,
  Silver: Star,
  Gold: Gem,
  Platinum: Crown,
  Diamond: Sparkles
};

const tierColors: Record<string, { gradient: string; border: string; bg: string }> = {
  Bronze: { gradient: "from-amber-700 to-amber-900", border: "border-amber-700/50", bg: "bg-amber-900/20" },
  Silver: { gradient: "from-slate-300 to-slate-500", border: "border-slate-400/50", bg: "bg-slate-500/20" },
  Gold: { gradient: "from-gold to-gold-dark", border: "border-gold/50", bg: "bg-gold/20" },
  Platinum: { gradient: "from-violet-400 to-violet-600", border: "border-violet-500/50", bg: "bg-violet-500/20" },
  Diamond: { gradient: "from-cyan-300 via-blue-400 to-purple-500", border: "border-cyan-400/50", bg: "bg-cyan-500/20" }
};

const VIPBenefits = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = usePiAuth();
  const [totalSpins, setTotalSpins] = useState(0);
  const [username, setUsername] = useState<string | null>(null);

  // حماية الدخول
  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate('/');
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    const storedUsername = localStorage.getItem('pi_username');
    if (storedUsername) {
      setUsername(storedUsername);
      fetchSpins(storedUsername);
    }
  }, []);

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

  if (isLoading || !isAuthenticated) return <GlobalLoading isVisible={true} />;

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 bg-stars opacity-50 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-radial from-pi-purple/10 via-transparent to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 py-8 relative">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/profile"><ArrowLeft className="w-5 h-5" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-2">
              <Crown className="w-8 h-8 text-gold" /> VIP Benefits
            </h1>
            <p className="text-muted-foreground">Unlock exclusive rewards as you level up</p>
          </div>
        </motion.div>

        {/* Current Status */}
        {currentTier && username && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Card className={`${tierColors[currentTier.name]?.bg} ${tierColors[currentTier.name]?.border} border-2`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${tierColors[currentTier.name]?.gradient} flex items-center justify-center shadow-lg`}>
                      {tierIcons[currentTier.name] && (() => { const Icon = tierIcons[currentTier.name]; return <Icon className="w-8 h-8 text-white" />; })()}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Your Current Tier</p>
                      <h2 className="text-2xl font-display font-bold">{currentTier.name} VIP</h2>
                      <p className="text-sm text-muted-foreground">{totalSpins} total spins</p>
                    </div>
                  </div>
                  {nextTier && (
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Next milestone</p>
                      <p className="text-xl font-bold text-gold">{nextTier.min_total_spins - totalSpins}</p>
                      <p className="text-sm text-muted-foreground">spins to {nextTier.name}</p>
                    </div>
                  )}
                </div>

                {nextTier ? (
                  <>
                    <div className="flex justify-between text-sm mb-2"><span>{currentTier.name}</span><span>{nextTier.name}</span></div>
                    <Progress value={((totalSpins - currentTier.min_total_spins) / (nextTier.min_total_spins - currentTier.min_total_spins)) * 100} className="h-3" />
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground mt-2 text-center">
                    {totalSpins === 0 ? 'Spin more to unlock your first VIP rewards!' : 'You have reached the highest VIP tier!'}
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* All VIP Tiers */}
        <div className="space-y-6">
          <h3 className="text-xl font-display font-bold">All VIP Tiers</h3>
          <div className="grid gap-4">
            {tiers?.map((tier, index) => {
              const Icon = tierIcons[tier.name] || Crown;
              const colors = tierColors[tier.name] || tierColors.Bronze;
              const isUnlocked = totalSpins >= tier.min_total_spins;
              const isCurrent = currentTier?.id === tier.id;

              return (
                <motion.div key={tier.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}>
                  <Card className={`relative overflow-hidden ${isCurrent ? colors.border + ' border-2' : 'border-border'} ${!isUnlocked && 'opacity-60'}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${isUnlocked ? `bg-gradient-to-br ${colors.gradient}` : 'bg-muted'}`}>
                          <Icon className={`w-7 h-7 ${isUnlocked ? 'text-white' : 'text-muted-foreground'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-lg font-display font-bold">{tier.name}</h4>
                            {isCurrent && <span className="px-2 py-0.5 text-xs bg-gold/20 text-gold rounded-full">Current</span>}
                            {isUnlocked && !isCurrent && <Check className="w-4 h-4 text-green-500" />}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {tier.min_total_spins === 0 ? 'Starting tier' : `Unlock at ${tier.min_total_spins} spins`}
                          </p>
                          <div className="grid sm:grid-cols-2 gap-3">
                            {tier.spin_discount > 0 && (
                              <div className="flex items-center gap-2 text-sm">
                                <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center`}><Zap className="w-4 h-4 text-gold" /></div>
                                <span>{(tier.spin_discount * 100).toFixed(0)}% Spin Discount</span>
                              </div>
                            )}
                            {tier.bonus_multiplier > 1 && (
                              <div className="flex items-center gap-2 text-sm">
                                <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center`}><Sparkles className="w-4 h-4 text-gold" /></div>
                                <span>{tier.bonus_multiplier}x Win Multiplier</span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {tier.exclusive_rewards.map((reward, i) => (
                              <span key={i} className={`px-2 py-1 text-xs rounded-full ${colors.bg} ${colors.border} border`}>{reward}</span>
                            ))}
                          </div>
                        </div>
                        {isUnlocked && <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Call to Action */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-8 text-center">
          <Button asChild size="lg" className="gap-2">
            <Link to="/"><Zap className="w-5 h-5" /> Start Spinning to Level Up</Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default VIPBenefits;
