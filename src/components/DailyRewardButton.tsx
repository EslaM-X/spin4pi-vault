import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Gift, Flame, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DailyRewardButtonProps {
  piUsername: string;
  onRewardClaimed: () => void;
}

const STREAK_REWARDS = [0.01, 0.02, 0.03, 0.04, 0.05, 0.07, 0.10];

export function DailyRewardButton({ piUsername, onRewardClaimed }: DailyRewardButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [claimResult, setClaimResult] = useState<{
    success: boolean;
    reward_amount: number;
    current_streak: number;
    streak_day: number;
  } | null>(null);
  const [alreadyClaimed, setAlreadyClaimed] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);

  useEffect(() => {
    // Check if already claimed today when component mounts
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
    } catch (error) {
      console.error('Error checking daily status:', error);
    }
  };

  const handleClaim = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('daily-login', {
        body: { pi_username: piUsername }
      });

      if (error) {
        toast.error("Failed to claim reward");
        return;
      }

      if (data?.already_claimed) {
        setAlreadyClaimed(true);
        setCurrentStreak(data.current_streak);
        toast.info("Daily reward already claimed!");
        return;
      }

      if (data?.success) {
        setClaimResult(data);
        setAlreadyClaimed(true);
        setCurrentStreak(data.current_streak);
        toast.success(`Claimed ${data.reward_amount} Pi! Streak: ${data.current_streak} days`);
        onRewardClaimed();
      }
    } catch (err) {
      toast.error("Failed to claim daily reward");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        disabled={alreadyClaimed}
        variant={alreadyClaimed ? "outline" : "default"}
        className={`gap-2 ${!alreadyClaimed ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 animate-pulse' : ''}`}
      >
        <Gift className="w-4 h-4" />
        {alreadyClaimed ? `${currentStreak} Day Streak` : "Daily Reward"}
        {currentStreak > 0 && <Flame className="w-4 h-4 text-orange-400" />}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Gift className="w-5 h-5 text-primary" />
              Daily Login Rewards
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Streak Progress */}
            <div className="flex justify-center gap-2">
              {STREAK_REWARDS.map((reward, index) => {
                const day = index + 1;
                const isCompleted = currentStreak > 0 && (currentStreak % 7 >= day || currentStreak % 7 === 0);
                const isCurrent = currentStreak > 0 && ((currentStreak % 7) === day || (currentStreak % 7 === 0 && day === 7));
                
                return (
                  <div
                    key={day}
                    className={`flex flex-col items-center p-2 rounded-lg border ${
                      isCompleted
                        ? 'bg-primary/20 border-primary'
                        : isCurrent
                        ? 'bg-amber-500/20 border-amber-500'
                        : 'bg-muted/30 border-border'
                    }`}
                  >
                    <span className="text-xs text-muted-foreground">Day {day}</span>
                    <span className={`text-sm font-bold ${isCompleted ? 'text-primary' : 'text-foreground'}`}>
                      {reward} π
                    </span>
                    {day === 7 && <Star className="w-3 h-3 text-amber-500" />}
                  </div>
                );
              })}
            </div>

            {/* Current Streak */}
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Flame className="w-6 h-6 text-orange-500" />
                <span className="text-2xl font-bold text-foreground">{currentStreak}</span>
              </div>
              <span className="text-muted-foreground">Day Streak</span>
            </div>

            {/* Claim Result */}
            <AnimatePresence>
              {claimResult && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center p-6 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg"
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: 3, duration: 0.3 }}
                  >
                    <Gift className="w-12 h-12 text-primary mx-auto mb-2" />
                  </motion.div>
                  <p className="text-2xl font-bold text-primary">+{claimResult.reward_amount} π</p>
                  <p className="text-muted-foreground">Reward claimed!</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Claim Button */}
            {!claimResult && (
              <Button
                onClick={handleClaim}
                disabled={isLoading || alreadyClaimed}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                {isLoading
                  ? "Claiming..."
                  : alreadyClaimed
                  ? "Come back tomorrow!"
                  : "Claim Daily Reward"}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
