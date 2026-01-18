import { motion } from "framer-motion";
import { 
  Sparkles, Zap, Trophy, Crown, Coins, Gem, Star, 
  Flame, Rocket, Users, Share2, Lock, ShieldCheck, Medal
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles, Zap, Trophy, Crown, Coins, Gem, Star, 
  Flame, Fire: Flame, Rocket, Users, Share2, ShieldCheck, Medal
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
      <p className="text-sm text-muted-foreground/60 italic font-serif">No royal honors yet. The vault awaits...</p>
    );
  }

  return (
    <div className={`grid ${compact ? 'grid-cols-6 gap-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'}`}>
      {displayAchievements.map((achievement, index) => {
        const Icon = iconMap[achievement.icon] || Medal;
        const isEarned = earnedIds.has(achievement.id);
        
        return (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={isEarned ? { scale: 1.05, rotateY: 10 } : {}}
            transition={{ delay: index * 0.05 }}
            className={`relative group overflow-hidden ${
              compact ? 'w-12 h-12' : 'p-5 rounded-[2rem] border-2 transition-all duration-500'
            } ${
              isEarned 
                ? 'bg-[#0f0f13] border-gold/40 shadow-[0_0_20px_rgba(251,191,36,0.1)]' 
                : 'bg-black/40 border-white/5 grayscale opacity-50'
            }`}
          >
            {/* الخلفية المضيئة للأوسمة المكتسبة */}
            {isEarned && !compact && (
              <div className="absolute -inset-10 bg-gradient-to-tr from-gold/10 via-transparent to-pi-purple/10 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
            )}

            {compact ? (
              <div className="relative flex items-center justify-center h-full">
                <div className={`w-full h-full rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${
                  isEarned ? 'bg-gradient-to-br from-gold/20 to-gold shadow-[0_0_10px_#fbbf24]' : 'bg-muted/20'
                }`}>
                  <Icon className={`w-6 h-6 ${isEarned ? 'text-white drop-shadow-[0_0_5px_rgba(251,191,36,1)]' : 'text-muted-foreground/40'}`} />
                </div>
                {/* Tooltip الملكي */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-2 bg-[#0d0d12] border border-gold/30 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 whitespace-nowrap backdrop-blur-md">
                  <p className="text-xs font-black text-gold uppercase tracking-widest">{achievement.name}</p>
                </div>
              </div>
            ) : (
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  {/* حاوية الأيقونة الأسطورية */}
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 rotate-3 group-hover:rotate-0 transition-transform duration-300 ${
                    isEarned 
                      ? 'bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border-2 border-gold/50 shadow-[0_0_15px_rgba(251,191,36,0.3)]' 
                      : 'bg-white/5 border border-white/10'
                  }`}>
                    {isEarned ? (
                      <Icon className="w-8 h-8 text-gold drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                    ) : (
                      <Lock className="w-6 h-6 text-white/20" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-black text-base uppercase tracking-tight ${isEarned ? 'text-white' : 'text-white/40'}`} style={{ fontFamily: 'Cinzel, serif' }}>
                      {achievement.name}
                    </h4>
                    <div className="flex items-center gap-2">
                       {isEarned && <ShieldCheck className="w-3 h-3 text-gold" />}
                       <p className="text-[10px] text-white/40 uppercase font-bold tracking-[0.2em]">
                         {isEarned ? "Honor Unlocked" : "Classified Achievement"}
                       </p>
                    </div>
                  </div>
                </div>

                <p className={`text-sm mb-4 leading-relaxed ${isEarned ? 'text-white/70' : 'text-white/20 italic'}`}>
                  {isEarned ? achievement.description : "Complete secret requirements to unveil this royal honor."}
                </p>

                {isEarned && achievement.reward_pi > 0 && (
                  <div className="flex items-center gap-2 bg-gold/10 w-fit px-3 py-1 rounded-full border border-gold/20">
                    <Coins className="w-3 h-3 text-gold" />
                    <span className="text-[10px] font-black text-gold uppercase tracking-tighter">+{achievement.reward_pi} π Imperial Bounty</span>
                  </div>
                )}

                {/* تأثير اللمعان عند التمرير */}
                {isEarned && (
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                  />
                )}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
