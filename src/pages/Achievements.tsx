import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Award, Target, Flame, Compass, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AchievementBadges } from '@/components/AchievementBadges';
import { AchievementUnlockModal } from '@/components/AchievementUnlockModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { usePiAuth } from '@/hooks/usePiAuth';
import GlobalLoading from '@/components/GlobalLoading';

const Achievements = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = usePiAuth();
  const [profileId, setProfileId] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [unlockedAchievements, setUnlockedAchievements] = useState<any[]>([]);

  useEffect(() => {
    if (user?.username) fetchProfile(user.username);
  }, [user]);

  const fetchProfile = async (piUsername: string) => {
    const { data } = await supabase.from('profiles').select('id').eq('pi_username', piUsername).maybeSingle();
    if (data) setProfileId(data.id);
  };

  const checkAchievements = async () => {
    setIsChecking(true);
    // صوت رادار عند الفحص
    new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3').play().catch(() => {});
    
    try {
      const { data } = await supabase.functions.invoke('check-achievements', { body: { pi_username: user?.username } });
      if (data?.new_achievements?.length > 0) {
        setUnlockedAchievements(data.new_achievements);
      } else {
        toast.info('Vault Synchronized', { description: "No new artifacts found in this cycle." });
      }
    } catch (e) {
      toast.error('Sync failed');
    } finally {
      setIsChecking(false);
    }
  };

  if (authLoading) return <GlobalLoading isVisible={true} />;

  return (
    <div className="min-h-screen bg-[#050507] text-white pb-24 overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.05),transparent)] pointer-events-none" />
      
      <div className="container mx-auto px-6 pt-12 relative z-10">
        <Link to="/profile" className="inline-flex items-center gap-2 text-white/20 hover:text-gold mb-12 transition-all group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-2 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-[3px]">Return to Vault</span>
        </Link>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-20">
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-3 mb-4">
                <Compass className="text-gold w-5 h-5" />
                <span className="text-[10px] font-black text-gold uppercase tracking-[5px]">Hall of Fame</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-[0.8] mb-8">
                LEGACY <br /> <span className="text-gold">BADGES</span>
              </h1>
              <p className="max-w-md text-white/40 text-[11px] font-bold uppercase tracking-widest leading-relaxed border-l-2 border-gold/20 pl-6">
                Your badges are not just icons; they are the proof of your dominance in the arena. Each one represents a milestone secured.
              </p>
            </motion.div>
          </div>

          {/* Sync & Next Step Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0d0d12] border border-white/5 rounded-[40px] p-8 relative overflow-hidden group flex flex-col justify-between"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-gold/10 blur-3xl rounded-full group-hover:bg-gold/20 transition-all" />
            
            <div>
              <h3 className="text-gold text-[10px] font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                <Target className="w-4 h-4" /> Next Milestone
              </h3>
              <p className="text-xl font-black italic uppercase leading-tight">Master Spinner III</p>
              <span className="text-[9px] text-white/30 uppercase font-black">75% Completed</span>
            </div>

            <Button 
              onClick={checkAchievements}
              disabled={isChecking}
              className="w-full mt-8 bg-gold text-black hover:scale-105 rounded-2xl py-7 font-black uppercase text-[11px] tracking-[2px] transition-all shadow-[0_10px_20px_rgba(212,175,55,0.15)]"
            >
              {isChecking ? "Scanning Vault..." : "Sync Achievements"}
            </Button>
          </motion.div>
        </div>

        {/* The Badges Grid (The Most Important Part) */}
        {profileId ? (
          <div className="space-y-12">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center border border-gold/20 shadow-lg">
                    <Award className="text-gold w-6 h-6" />
                 </div>
                 <h2 className="text-3xl font-black uppercase italic tracking-tighter">Your Collection</h2>
              </div>
              <div className="hidden md:flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                <Lock className="w-3 h-3 text-white/20" />
                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Locked Badges are Hidden</span>
              </div>
            </div>
            
            {/* عرض الـ Badges بتصميم الـ Grid المطور */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-[#0d0d12]/40 p-8 md:p-12 rounded-[50px] border border-white/5 backdrop-blur-md relative"
            >
               {/* تأثير ضوئي خلف الـ Badges */}
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.03),transparent)] pointer-events-none" />
               
               <AchievementBadges profileId={profileId} />
            </motion.div>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[50px]">
             <Sparkles className="w-10 h-10 text-white/5 animate-pulse mb-4" />
             <p className="text-white/20 font-black uppercase text-[10px] tracking-[4px]">Waiting for Identity Sync...</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {unlockedAchievements.length > 0 && (
          <AchievementUnlockModal achievements={unlockedAchievements} onClose={() => setUnlockedAchievements([])} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Achievements;
