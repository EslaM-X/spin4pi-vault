import { useState, useEffect } from 'react';
import { Lock, Unlock, TrendingUp, Clock, Coins, AlertCircle, ShieldCheck, Zap, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';

interface StakingTier {
  id: string;
  name: string;
  minAmount: number;
  duration: number;
  apy: number;
  boostMultiplier: number;
  color: string;
}

const STAKING_TIERS: StakingTier[] = [
  { id: 'bronze', name: 'Iron Legions', minAmount: 1, duration: 7, apy: 5, boostMultiplier: 1.1, color: 'border-slate-500 text-slate-400' },
  { id: 'silver', name: 'Elite Guard', minAmount: 5, duration: 14, apy: 10, boostMultiplier: 1.25, color: 'border-blue-400 text-blue-400' },
  { id: 'gold', name: 'Royal Knights', minAmount: 10, duration: 30, apy: 20, boostMultiplier: 1.5, color: 'border-gold text-gold' },
  { id: 'platinum', name: 'Imperial Council', minAmount: 50, duration: 90, apy: 35, boostMultiplier: 2.0, color: 'border-emerald-400 text-emerald-400' },
];

const StakingPanel = ({ username, walletBalance, onBalanceUpdate }: any) => {
  const [selectedTier, setSelectedTier] = useState<StakingTier>(STAKING_TIERS[0]);
  const [stakeAmount, setStakeAmount] = useState('');
  const [userStakes, setUserStakes] = useState<any[]>([]);
  const [isStaking, setIsStaking] = useState(false);

  const calculateRewards = (amount: number, tier: StakingTier) => {
    return (amount * (tier.apy / 100) * (tier.duration / 365));
  };

  const handleStake = async () => {
    const amount = parseFloat(stakeAmount);
    if (!username || isNaN(amount) || amount < selectedTier.minAmount || amount > walletBalance) {
      toast.error("Invalid amount or insufficient balance");
      return;
    }

    setIsStaking(true);
    // محاكاة عملية الربط مع الخزنة
    setTimeout(() => {
      toast.success(`Success! ${amount} Pi locked in ${selectedTier.name}`);
      onBalanceUpdate(walletBalance - amount);
      setStakeAmount('');
      setIsStaking(false);
    }, 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0d0d12]/90 border-2 border-gold/10 rounded-[2.5rem] p-6 backdrop-blur-xl relative overflow-hidden shadow-2xl"
    >
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-[60px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gold/10 rounded-2xl border border-gold/20 shadow-lg shadow-gold/5">
            <ShieldCheck className="w-6 h-6 text-gold" />
          </div>
          <div>
            <h3 className="font-black text-white italic uppercase tracking-widest text-lg" style={{ fontFamily: 'Cinzel, serif' }}>
              Imperial <span className="text-gold">Vault</span>
            </h3>
            <p className="text-[9px] text-white/30 font-black uppercase tracking-[0.2em]">Stake & Earn Tributes</p>
          </div>
        </div>
        <Badge variant="outline" className="border-gold/20 text-gold bg-gold/5 px-3 py-1 rounded-full text-[10px] font-black italic">
          ACTIVE POOLS
        </Badge>
      </div>

      <Tabs defaultValue="stake" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white/5 rounded-2xl p-1 mb-6 border border-white/10">
          <TabsTrigger value="stake" className="rounded-xl data-[state=active]:bg-gold data-[state=active]:text-black font-black uppercase text-[10px] tracking-widest transition-all">Stake Assets</TabsTrigger>
          <TabsTrigger value="active" className="rounded-xl data-[state=active]:bg-gold data-[state=active]:text-black font-black uppercase text-[10px] tracking-widest transition-all">My Treasury</TabsTrigger>
        </TabsList>

        <TabsContent value="stake" className="space-y-6 outline-none">
          {/* Tier Selection */}
          <div className="grid grid-cols-2 gap-3">
            {STAKING_TIERS.map((tier) => (
              <button
                key={tier.id}
                onClick={() => setSelectedTier(tier)}
                className={`relative p-4 rounded-2xl border-2 transition-all duration-300 text-left overflow-hidden group ${
                  selectedTier.id === tier.id
                    ? `${tier.color} bg-white/5`
                    : 'border-white/5 bg-transparent opacity-40 hover:opacity-100'
                }`}
              >
                <div className="font-black text-[11px] uppercase tracking-tighter mb-1">{tier.name}</div>
                <div className="flex justify-between items-end">
                   <span className="text-xl font-black italic tracking-tighter leading-none">{tier.apy}%</span>
                   <span className="text-[8px] font-bold opacity-60 uppercase">{tier.duration} Days</span>
                </div>
                {selectedTier.id === tier.id && (
                  <motion.div layoutId="activeTier" className="absolute top-0 right-0 p-1">
                    <Zap className="w-3 h-3 fill-current" />
                  </motion.div>
                )}
              </button>
            ))}
          </div>

          {/* Detailed Stats */}
          <div className="bg-black/40 border border-white/5 rounded-2xl p-4 grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Spin Multiplier</p>
              <p className="text-sm font-black text-gold italic">{selectedTier.boostMultiplier}x Boost</p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Min. Required</p>
              <p className="text-sm font-black text-white">{selectedTier.minAmount} Pi</p>
            </div>
          </div>

          {/* Input Area */}
          <div className="space-y-3">
            <div className="relative group">
              <Input
                type="number"
                placeholder="Amount of Pi to Lock"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                className="h-14 bg-white/5 border-white/10 rounded-2xl px-5 font-bold text-white placeholder:text-white/20 focus:border-gold/50 focus:ring-0 transition-all"
              />
              <Button 
                variant="ghost" 
                onClick={() => setStakeAmount(walletBalance.toString())}
                className="absolute right-2 top-2 h-10 text-[10px] font-black text-gold hover:bg-gold/10 rounded-xl"
              >
                MAX
              </Button>
            </div>

            {stakeAmount && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-between px-2 text-[10px] font-black uppercase italic">
                <span className="text-white/30 tracking-widest">Estimated Reward:</span>
                <span className="text-emerald-400">+{calculateRewards(parseFloat(stakeAmount), selectedTier).toFixed(4)} Pi</span>
              </motion.div>
            )}
          </div>

          <Button
            onClick={handleStake}
            disabled={isStaking || !stakeAmount}
            className="w-full h-14 bg-gold hover:bg-gold/80 text-black font-black uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-gold/10 group overflow-hidden"
          >
            {isStaking ? (
              <Clock className="w-5 h-5 animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                Secure the Vault <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </Button>

          <div className="flex items-center gap-3 px-2 py-3 border-t border-white/5">
             <AlertCircle className="w-4 h-4 text-white/20" />
             <p className="text-[8px] text-white/20 font-bold uppercase leading-relaxed">
               Assets are strictly locked for the duration. Early release is prohibited by the Imperial Protocol.
             </p>
          </div>
        </TabsContent>

        <TabsContent value="active" className="mt-4 outline-none min-h-[300px] flex flex-col items-center justify-center text-center">
             <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
                <Coins className="w-10 h-10 text-white/10" />
             </div>
             <p className="text-[11px] font-black text-white/40 uppercase tracking-widest">No Active Contracts Found</p>
             <p className="text-[9px] text-white/20 mt-2 font-medium">Stake your assets to start earning daily tributes.</p>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default StakingPanel;
