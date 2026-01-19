import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Award, Target, Flame, Compass } from 'lucide-react';
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
    // تفعيل صوت "رادار" تفاعلي
    new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3').play().catch(() => {});
    
    const { data } = await supabase.functions.invoke('check-achievements', { body: { pi_username: user?.username } });
    if (data?.new_achievements?.length > 0) {
      setUnlockedAchievements(data.new_achievements);
    } else {
      toast.success('Your Vault is synchronized!');
    }
    setIsChecking(false);
  };

  if (authLoading) return <GlobalLoading isVisible={true} />;

  return (
    <div className="min-h-screen bg-[#050507] text-white pb-20 overflow-hidden">
      {/* Dynamic Background Element */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[150px] -mr-64 -mt-64 animate-pulse" />

      <div className="container mx-auto px-6 pt-12 relative z-10">
        <Link to="/profile" className="inline-flex items-center gap-2 text-white/20 hover:text-gold mb-12 transition-all group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-2 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-[3px]">Identity Hub</span>
        </Link>

        {/* New Header Style: Quest Map Feel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Compass className="text-gold w-6 h-6 animate-spin-slow" />
              <span className="text-[10px] font-black text-gold uppercase tracking-[5px]">Hall of Valor</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-[0.8]">
              LEGACY <br /> <span className="text-gold">MUSEUM</span>
            </h1>
            <p className="mt-6 text-white/40 text-xs font-bold uppercase tracking-widest max-w-md leading-relaxed">
              Every badge here is a fragment of your history in the Spin4Pi ecosystem. Collect them all to dominate the leaderboard.
            </p>
          </div>

          {/* Quest Widget: Different from Profile Stats */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-[#0d0d12] border-2 border-gold/10 rounded-[35px] p-8 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
              <Target className="w-20 h-20 text-gold" />
            </div>
            <h3 className="text-gold text-[10px] font-black uppercase tracking-widest mb-6 flex items-center gap-2">
              <Flame className="w-4 h-4" /> Next Challenge
            </h3>
            <p className="text-lg font-black italic uppercase leading-tight mb-4">Master of Luck II</p>
            <div className="space-y-2">
              <div className="flex justify-between text-[8px] font-black opacity-40">
                <span>PROGRESS</span>
                <span>75%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gold w-[75%] shadow-[0_0_10px_#D4AF37]" />
              </div>
            </div>
            <Button 
              onClick={checkAchievements}
              className="w-full mt-8 bg-white/5 border border-white/10 hover:bg-gold hover:text-black rounded-2xl py-6 font-black uppercase text-[10px] tracking-widest transition-all"
            >
              {isChecking ? "Scanning..." : "Sync Achievements"}
            </Button>
          </motion.div>
        </div>

        {/* Badges Grid with Animated Title */}
        {profileId ? (
          <div className="space-y-10">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center border border-gold/20 shadow-[0_0_20px_rgba(212,175,55,0.1)]">
                  <Award className="text-gold w-6 h-6" />
               </div>
               <h2 className="text-2xl font-black uppercase italic tracking-tighter">Your Collection</h2>
               <div className="flex-1 h-[1px] bg-gradient-to-r from-white/10 to-transparent" />
            </div>
            
            <div className="bg-[#0d0d12]/30 p-1 rounded-[50px] border border-white/5 backdrop-blur-sm">
               <AchievementBadges profileId={profileId} />
            </div>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[50px]">
             <Sparkles className="w-10 h-10 text-white/10 mb-4" />
             <p className="text-white/20 font-black uppercase text-[10px] tracking-[4px]">Initializing Vault Access...</p>
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
