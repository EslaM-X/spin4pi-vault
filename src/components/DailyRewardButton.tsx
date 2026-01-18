import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Gift, Flame, Star, Crown, ChevronRight, Lock, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DailyRewardButtonProps {
  piUsername: string;
  onRewardClaimed: () => void;
}

const STREAK_REWARDS = [0.01, 0.02, 0.03, 0.04, 0.05, 0.07, 0.10];

export function DailyRewardButton({ piUsername, onRewardClaimed }: DailyRewardButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [claimResult, setClaimResult] = useState<any>(null);
  const [alreadyClaimed, setAlreadyClaimed] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);

  useEffect(() => {
    checkDailyStatus();
  }, [piUsername]);

  const checkDailyStatus = async () => {
    if (!piUsername) return;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('last_login_date, login_streak')
        .eq('pi_username', piUsername)
        .single();

      if (data) {
        const today = new Date().toISOString().split('T')[0];
        setAlreadyClaimed(data.last_login_date === today);
        setCurrentStreak(data.login_streak || 0);
      }
    } catch (error) { console.error(error); }
  };

  const handleClaim = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('daily-login', {
        body: { pi_username: piUsername }
      });

      if (error) throw error;

      if (data?.success) {
        setClaimResult(data);
        setAlreadyClaimed(true);
        setCurrentStreak(data.current_streak);
        toast.success(`Glory Awaits! +${data.reward_amount} π Claimed.`);
        onRewardClaimed();
      }
    } catch (err) {
      toast.error("The vault is temporarily sealed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          onClick={() => setIsOpen(true)}
          className={`relative h-14 px-6 rounded-2xl border-2 transition-all duration-500 overflow-hidden ${
            alreadyClaimed 
            ? 'bg-black/40 border-white/5 text-white/40' 
            : 'bg-gradient-to-r from-gold via-amber-400 to-gold border-gold/40 text-black font-black shadow-[0_0_20px_rgba(251,191,36,0.3)]'
          }`}
        >
          <div className="flex items-center gap-3 z-10">
            <Gift className={`w-5 h-5 ${!alreadyClaimed && 'animate-bounce'}`} />
            <span className="uppercase tracking-widest text-xs">
              {alreadyClaimed ? `${currentStreak} Day Streak` : "Daily Tribute"}
            </span>
            {currentStreak > 0 && <Flame className="w-4 h-4 text-orange-600 fill-orange-600" />}
          </div>
          {!alreadyClaimed && (
            <motion.div 
              className="absolute inset-0 bg-white/20"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            />
          )}
        </Button>
      </motion.div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-[#0d0d12] border-gold/20 max-w-md rounded-[2.5rem] p-0 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.9)]">
          
          {/* Header Section */}
          <div className="bg-gradient-to-b from-gold/10 to-transparent p-8 text-center relative">
            <div className="absolute top-4 right-4 text-gold/20"><Crown className="w-12 h-12 rotate-12" /></div>
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-1" style={{ fontFamily: 'Cinzel, serif' }}>
              Imperial Tribute
            </h2>
            <p className="text-gold font-bold text-[10px] uppercase tracking-[0.3em]">Consistency is the path to wealth</p>
          </div>

          <div className="px-8 pb-8 space-y-8">
            {/* Streak Roadmap */}
            <div className="grid grid-cols-7 gap-2">
              {STREAK_REWARDS.map((reward, index) => {
                const day = index + 1;
                const isCompleted = currentStreak > 0 && (currentStreak % 7 >= day || (currentStreak % 7 === 0 && currentStreak > 0));
                const isNext = (currentStreak % 7) + 1 === day;

                return (
                  <div key={day} className="flex flex-col items-center gap-2">
                    <div className={`w-full aspect-square rounded-xl border-2 flex items-center justify-center transition-all duration-500 ${
                      isCompleted ? 'bg-gold border-gold text-black shadow-lg shadow-gold/20' : 
                      isNext ? 'bg-gold/10 border-gold/40 text-gold animate-pulse' : 'bg-white/5 border-white/5 text-white/10'
                    }`}>
                      {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-[10px] font-black">{day}</span>}
                    </div>
                    <span className={`text-[8px] font-bold ${isCompleted ? 'text-gold' : 'text-white/20'}`}>{reward}π</span>
                  </div>
                );
              })}
            </div>

            {/* Status Display */}
            <div className="relative bg-white/5 border border-white/5 rounded-[2rem] p-6 overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 text-white/[0.02] group-hover:text-gold/[0.05] transition-colors">
                <Flame className="w-32 h-32" />
              </div>
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Current Progress</p>
                  <h3 className="text-4xl font-black text-white italic">{currentStreak} <span className="text-lg text-gold">Days</span></h3>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-xl rotate-6 group-hover:rotate-0 transition-transform">
                  <Flame className="w-8 h-8 text-white fill-white" />
                </div>
              </div>
            </div>

            {/* Claim Area */}
            <AnimatePresence mode="wait">
              {claimResult ? (
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl text-center">
                  <Star className="w-8 h-8 text-emerald-500 mx-auto mb-2 animate-spin-slow" />
                  <p className="text-emerald-500 font-black uppercase tracking-widest text-sm">Reward Secured!</p>
                  <p className="text-white font-bold text-xl mt-1">+{claimResult.reward_amount} π</p>
                </motion.div>
              ) : (
                <Button
                  onClick={handleClaim}
                  disabled={isLoading || alreadyClaimed}
                  className={`w-full py-8 rounded-2xl font-black uppercase tracking-widest text-sm transition-all duration-500 ${
                    alreadyClaimed 
                    ? 'bg-white/5 text-white/20 border border-white/5' 
                    : 'bg-gold text-black hover:bg-gold-dark shadow-[0_10px_30px_rgba(251,191,36,0.3)]'
                  }`}
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : alreadyClaimed ? (
                    <div className="flex items-center gap-2 italic"><Lock className="w-4 h-4" /> Locked until tomorrow</div>
                  ) : (
                    <div className="flex items-center gap-2">Claim Today's Tribute <ChevronRight className="w-4 h-4" /></div>
                  )}
                </Button>
              )}
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
