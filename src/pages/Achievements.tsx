import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Trophy, Sparkles, ShieldAlert, Award, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AchievementBadges } from '@/components/AchievementBadges';
import { AchievementUnlockModal } from '@/components/AchievementUnlockModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { usePiAuth } from '@/hooks/usePiAuth';
import { useQueryClient } from '@tanstack/react-query';
import GlobalLoading from '@/components/GlobalLoading';

const Achievements = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading: authLoading } = usePiAuth();

  const [profileId, setProfileId] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [unlockedAchievements, setUnlockedAchievements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const hasConsented = localStorage.getItem('imperial_legal_consent');
    if (!authLoading && (!isAuthenticated || !hasConsented)) {
      navigate('/');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (user?.username) {
      fetchProfile(user.username);
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [user, authLoading]);

  const fetchProfile = async (piUsername: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('pi_username', piUsername)
        .maybeSingle();

      if (data) {
        setProfileId(data.id);
      } else {
        console.error("Profile not found in DB");
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAchievements = async () => {
    if (!user?.username) return;
    setIsChecking(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('check-achievements', {
        body: { pi_username: user.username },
      });
      if (error) throw error;

      if (data?.new_achievements?.length > 0) {
        setUnlockedAchievements(data.new_achievements);
      } else {
        toast('Vault is up to date', {
          description: "Keep spinning to unlock legendary badges.",
        });
      }
    } catch (error) {
      toast.error('Sync failed. Try again later.');
    } finally {
      setIsChecking(false);
    }
  };

  if (authLoading || isLoading) return <GlobalLoading isVisible={true} />;

  return (
    <div className="min-h-screen bg-[#050507] text-white selection:bg-gold/30 pb-20 overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[url('/stars-pattern.svg')] opacity-5 pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gold/5 blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 pt-12 relative z-10">
        <Link to="/profile" className="inline-flex items-center gap-2 text-white/40 hover:text-gold mb-12 group transition-colors">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-[2px]">Return to Vault</span>
        </Link>

        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <div className="flex items-center gap-2 mb-3">
               <div className="h-[1px] w-8 bg-gold" />
               <span className="text-[10px] font-black text-gold uppercase tracking-[4px]">Spin4Pi Legacy</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none">
              <span className="text-white">MY</span> <span className="text-gold">BADGES</span>
            </h1>
          </div>

          <Button 
            onClick={checkAchievements} 
            disabled={isChecking} 
            className="h-14 px-10 rounded-2xl bg-gradient-to-r from-gold to-[#B8860B] text-black font-black uppercase tracking-widest text-[10px] shadow-[0_10px_30px_rgba(212,175,55,0.2)] hover:scale-105 active:scale-95 transition-all gap-3"
          >
            <Sparkles className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'SYNCHRONIZING...' : 'CHECK PROGRESS'}
          </Button>
        </header>

        {profileId ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0d0d12]/60 border border-white/5 p-8 md:p-12 rounded-[48px] backdrop-blur-xl shadow-2xl"
          >
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center border border-gold/20">
                <Award className="text-gold w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black uppercase italic tracking-tight">Unlocked Achievements</h2>
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Proof of your Spin4Pi dominance</p>
              </div>
            </div>
            
            <AchievementBadges profileId={profileId} />
          </motion.div>
        ) : (
          <div className="text-center py-24 bg-[#0d0d12]/40 rounded-[48px] border border-dashed border-white/10">
            <UserCircle className="w-16 h-16 text-white/10 mx-auto mb-6" />
            <h3 className="text-lg font-black uppercase italic text-white/60">No Profile Linked</h3>
            <p className="text-white/30 text-[10px] mt-2 uppercase tracking-widest px-10 leading-relaxed">
              We couldn't synchronize your identity. Please re-login to the arena.
            </p>
          </div>
        )}

        <AnimatePresence>
          {unlockedAchievements.length > 0 && (
            <AchievementUnlockModal 
              achievements={unlockedAchievements} 
              onClose={() => setUnlockedAchievements([])} 
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Achievements;
