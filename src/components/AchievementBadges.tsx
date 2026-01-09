import { motion } from "framer-motion";
import { 
  Sparkles, Zap, Trophy, Crown, Coins, Gem, Star, 
  Flame, Rocket, Users, Share2, Lock 
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles, Zap, Trophy, Crown, Coins, Gem, Star, 
  Flame, Fire: Flame, Rocket, Users, Share2
};

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement_type: string;
  requirement_value: number;
  reward_pi: number;
}

interface UserAchievement {
  achievement_id: string;
  earned_at: string;
}

interface AchievementBadgesProps {
  profileId: string;
  compact?: boolean;
}

export function AchievementBadges({ profileId, compact = false }: AchievementBadgesProps) {
  const { data: achievements } = useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('requirement_value', { ascending: true });
      if (error) throw error;
      return data as Achievement[];
    }
  });

  const { data: userAchievements } = useQuery({
    queryKey: ['user-achievements', profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('achievement_id, earned_at')
        .eq('profile_id', profileId);
      if (error) throw error;
      return data as UserAchievement[];
    },
    enabled: !!profileId
  });

  const earnedIds = new Set(userAchievements?.map(ua => ua.achievement_id) || []);

  if (!achievements) return null;

  const displayAchievements = compact 
    ? achievements.filter(a => earnedIds.has(a.id)).slice(0, 6)
    : achievements;

  if (compact && displayAchievements.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No achievements yet. Keep spinning!</p>
    );
  }

  return (
    <div className={`grid ${compact ? 'grid-cols-6 gap-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'}`}>
      {displayAchievements.map((achievement, index) => {
        const Icon = iconMap[achievement.icon] || Sparkles;
        const isEarned = earnedIds.has(achievement.id);
        
        return (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={`relative group ${compact ? '' : 'p-4 rounded-xl border'} ${
              isEarned 
                ? 'bg-gradient-to-br from-gold/20 to-gold-dark/20 border-gold/50' 
                : 'bg-card/50 border-border/50 opacity-60'
            }`}
          >
            {compact ? (
              <div className="relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isEarned ? 'bg-gradient-to-br from-gold to-gold-dark' : 'bg-muted'
                }`}>
                  <Icon className={`w-5 h-5 ${isEarned ? 'text-background' : 'text-muted-foreground'}`} />
                </div>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-popover border border-border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                  <p className="text-sm font-semibold">{achievement.name}</p>
                  <p className="text-xs text-muted-foreground">{achievement.description}</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                    isEarned ? 'bg-gradient-to-br from-gold to-gold-dark' : 'bg-muted'
                  }`}>
                    {isEarned ? (
                      <Icon className="w-6 h-6 text-background" />
                    ) : (
                      <Lock className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{achievement.name}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">{achievement.description}</p>
                    {achievement.reward_pi > 0 && (
                      <p className="text-xs text-gold mt-1">+{achievement.reward_pi} π reward</p>
                    )}
                  </div>
                </div>
                {isEarned && (
                  <motion.div 
                    className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <span className="text-white text-xs">✓</span>
                  </motion.div>
                )}
              </>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
