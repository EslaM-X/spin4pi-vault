import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Trophy, Sparkles, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AchievementBadges } from '@/components/AchievementBadges';
import { AchievementUnlockModal } from '@/components/AchievementUnlockModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { usePiAuth } from '@/hooks/usePiAuth';
import { useQueryClient } from '@tanstack/react-query';
import GlobalLoading from '@/components/GlobalLoading';
import DashboardLayout from '@/layouts/DashboardLayout';

interface UnlockedAchievement {
  name: string;
  reward_pi: number;
}

const Achievements = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading: authLoading } = usePiAuth();

  const [profileId, setProfileId] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [unlockedAchievements, setUnlockedAchievements] = useState<UnlockedAchievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageTransitionLoading, setPageTransitionLoading] = useState(true);

  // الفحص الإمبراطوري للموافقة القانونية وتسجيل الدخول
  useEffect(() => {
    const hasConsented = localStorage.getItem('imperial_legal_consent');
    
    if (!authLoading) {
      if (!isAuthenticated || !hasConsented) {
        // إذا لم يسجل دخول أو لم يوافق على الشروط، نرجعه للرئيسية ليظهر له المودال هناك
        navigate('/');
        if (!hasConsented && isAuthenticated) {
           toast.error("Please accept Imperial Protocols to view achievements", {
             icon: <ShieldAlert className="text-gold" />
           });
        }
      }
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    setPageTransitionLoading(true);
    const timer = setTimeout(() => setPageTransitionLoading(false), 800);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  useEffect(() => {
    if (user?.username) {
      fetchProfile(user.username);
    }
  }, [user]);

  const fetchProfile = async (piUsername: string) => {
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('pi_username', piUsername)
        .maybeSingle();

      if (data) setProfileId(data.id);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAchievements = async () => {
    if (!user?.username) return;
    setIsChecking(true);
    
    // صوت "البحث عن إنجازات" خفيف
    const searchSfx = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
    searchSfx.volume = 0.3;
    searchSfx.play().catch(() => {});

    try {
      const { data, error } = await supabase.functions.invoke('check-achievements', {
        body: { pi_username: user.username },
      });
      if (error) throw error;

      if (data?.new_achievements?.length > 0) {
        setUnlockedAchievements(data.new_achievements);
      } else {
        toast('No new achievements found', {
          description: "Keep spinning to unlock Imperial rewards.",
          action: { label: "Spin Now", onClick: () => navigate('/') }
        });
      }
    } catch (error) {
      toast.error('Protocol Error: Failed to check progress');
    } finally {
      setIsChecking(false);
    }
  };

  const handleCloseModal = () => {
    setUnlockedAchievements([]);
    if (profileId) {
      queryClient.invalidateQueries({ queryKey: ['user-achievements', profileId] });
    }
  };

  if (authLoading || isLoading || pageTransitionLoading) {
    return <GlobalLoading isVisible={true} />;
  }

  return (
    <DashboardLayout>
      <div className="relative min-h-[80vh]">
        {/* Imperial Background Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gold/5 blur-[120px] pointer-events-none rounded-full" />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 relative z-10"
        >
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              asChild 
              className="rounded-xl border border-white/5 bg-white/5 hover:bg-gold/10 hover:text-gold transition-all"
            >
              <Link to="/profile">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                 <div className="h-[1px] w-8 bg-gold/50" />
                 <span className="text-[10px] font-black text-gold uppercase tracking-[3px]">Imperial Collection</span>
              </div>
              <h1 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
                <Trophy className="w-10 h-10 text-gold drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]" />
                ACHIEVEMENTS
              </h1>
            </div>
          </div>

          <Button 
            onClick={checkAchievements} 
            disabled={isChecking} 
            className="h-14 px-8 rounded-2xl bg-gradient-to-r from-gold to-[#B8860B] text-black font-black uppercase tracking-widest text-xs shadow-[0_0_30px_rgba(212,175,55,0.2)] hover:scale-105 active:scale-95 transition-all gap-3"
          >
            <Sparkles className={`w-5 h-5 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'SYNCHRONIZING...' : 'CHECK PROGRESS'}
          </Button>
        </motion.div>

        {profileId && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative z-10 bg-[#0d0d12]/50 border border-white/5 p-8 rounded-[32px] backdrop-blur-sm shadow-2xl"
          >
            <AchievementBadges profileId={profileId} />
          </motion.div>
        )}

        {unlockedAchievements.length > 0 && (
          <AchievementUnlockModal achievements={unlockedAchievements} onClose={handleCloseModal} />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Achievements;
