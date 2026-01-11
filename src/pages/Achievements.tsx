import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AchievementBadges } from '@/components/AchievementBadges';
import { AchievementUnlockModal } from '@/components/AchievementUnlockModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { usePiAuth } from '@/hooks/usePiAuth';
import { useQueryClient } from '@tanstack/react-query';

interface UnlockedAchievement {
  name: string;
  reward_pi: number;
}

const Achievements = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading: authLoading } = usePiAuth();

  const [profileId, setProfileId] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [unlockedAchievements, setUnlockedAchievements] = useState<UnlockedAchievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // حماية الصفحة: لو مش مسجل دخول، يرجع للصفحة الرئيسية
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, authLoading]);

  // fetch profile بعد ما user موجود
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
      
      if (data) {
        setProfileId(data.id);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to fetch profile');
    } finally {
      setIsLoading(false);
    }
  };

  const checkAchievements = async () => {
    if (!user?.username) return;
    
    setIsChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-achievements', {
        body: { pi_username: user.username }
      });

      if (error) throw error;

      if (data?.new_achievements?.length > 0) {
        setUnlockedAchievements(data.new_achievements);
      } else {
        toast.info('No new achievements yet. Keep spinning!');
      }
    } catch (error) {
      console.error('Check achievements error:', error);
      toast.error('Failed to check achievements');
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

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 bg-stars opacity-50 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-radial from-pi-purple/10 via-transparent to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 py-8 relative">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/profile">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-2">
                <Trophy className="w-8 h-8 text-gold" />
                Achievements
              </h1>
              <p className="text-muted-foreground">Collect badges and earn rewards</p>
            </div>
          </div>

          <Button
            onClick={checkAchievements}
            disabled={isChecking || isLoading}
            className="gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {isChecking ? 'Checking...' : 'Check Progress'}
          </Button>
        </motion.div>

        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-8 w-48 bg-muted rounded" />
            <div className="h-6 w-64 bg-muted rounded" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="h-28 bg-muted rounded-lg" />
              ))}
            </div>
          </div>
        ) : (
          profileId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <AchievementBadges profileId={profileId} />
            </motion.div>
          )
        )}
      </div>

      {unlockedAchievements.length > 0 && (
        <AchievementUnlockModal
          achievements={unlockedAchievements}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Achievements;
