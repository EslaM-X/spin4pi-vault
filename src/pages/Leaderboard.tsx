import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trophy, Medal, Crown, Zap, Star, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePiAuth } from '@/hooks/usePiAuth';
import GlobalLoading from '@/components/GlobalLoading';

const Leaderboard = () => {
  const { user } = usePiAuth();

  // 1. جلب قائمة أفضل 10 لاعبين
  const { data: rankings, isLoading: ranksLoading } = useQuery({
    queryKey: ['global-rankings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('pi_username, total_spins, avatar_url')
        .order('total_spins', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    }
  });

  // 2. جلب ترتيب المستخدم الحالي (Your Rank)
  const { data: userRank, isLoading: userRankLoading } = useQuery({
    queryKey: ['user-rank', user?.username],
    enabled: !!user?.username,
    queryFn: async () => {
      // جلب جميع المستخدمين مرتبين لمعرفة الترتيب الفعلي
      const { data: allProfiles, error } = await supabase
        .from('profiles')
        .select('pi_username, total_spins')
        .order('total_spins', { ascending: false });

      if (error) throw error;
      
      const index = allProfiles.findIndex(p => p.pi_username === user?.username);
      return {
        rank: index !== -1 ? index + 1 : '?',
        total_spins: allProfiles[index]?.total_spins || 0
      };
    }
  });

  if (ranksLoading || userRankLoading) return <GlobalLoading isVisible={true} />;

  return (
    <div className="min-h-screen bg-[#050507] text-white pb-32 overflow-x-hidden">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.05),transparent)] pointer-events-none" />

      <div className="container mx-auto px-4 pt-12 relative z-10">
        <header className="mb-10 text-center md:text-left">
          <Link to="/" className="inline-flex items-center gap-2 text-white/20 hover:text-gold mb-6 transition-all group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1" />
            <span className="text-[10px] font-black uppercase tracking-[3px]">Return to Arena</span>
          </Link>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-gold uppercase tracking-[5px]">Imperial Records</p>
            <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-none">
              RANK<span className="text-gold">INGS</span>
            </h1>
          </div>
        </header>

        {/* قائمة المتصدرين */}
        <div className="space-y-4 max-w-2xl mx-auto">
          {rankings?.map((player, index) => {
            const isTop3 = index < 3;
            const isCurrentUser = player.pi_username === user?.username;
            const rankColors = [
              "from-gold via-yellow-200 to-gold/50", 
              "from-slate-300 via-white to-slate-400", 
              "from-[#CD7F32] via-[#FFDAB9] to-[#8B4513]" 
            ];

            return (
              <motion.div
                key={player.pi_username}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`relative p-[1px] rounded-[30px] ${isTop3 ? 'bg-gradient-to-r ' + rankColors[index] : isCurrentUser ? 'bg-gold/40' : 'bg-white/5'}`}
              >
                <div className="bg-[#0d0d12] rounded-[29px] p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black italic text-xl ${isTop3 ? 'text-gold' : 'text-white/20'}`}>
                      #{index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className={`font-black uppercase tracking-tight ${isCurrentUser ? 'text-gold' : 'text-white'}`}>
                          {player.pi_username}
                          {isCurrentUser && <span className="ml-2 text-[8px] bg-gold/10 text-gold px-2 py-0.5 rounded-full border border-gold/20 font-black">YOU</span>}
                        </h3>
                        {index === 0 && <Crown className="w-4 h-4 text-gold fill-gold animate-bounce" />}
                      </div>
                      <div className="flex items-center gap-1.5 opacity-40 text-[10px]">
                        <Zap className="w-3 h-3 text-gold fill-gold" />
                        <span className="font-black uppercase tracking-widest">{player.total_spins} Spins</span>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {index === 0 && <Trophy className="w-6 h-6 text-gold drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]" />}
                    {isTop3 && index !== 0 && <Medal className={`w-6 h-6 ${index === 1 ? 'text-slate-300' : 'text-[#CD7F32]'}`} />}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ميزة Your Rank الثابتة بالأسفل */}
      {userRank && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/90 to-transparent z-50">
          <div className="max-w-2xl mx-auto">
            <motion.div 
              initial={{ y: 100 }} 
              animate={{ y: 0 }}
              className="bg-[#1a1a23] border border-gold/30 rounded-[30px] p-5 flex items-center justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.5)]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center border border-gold/20">
                  <User className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-gold uppercase tracking-[3px]">Your Standing</p>
                  <h4 className="text-xl font-black italic uppercase tracking-tighter text-white">
                    Rank #{userRank.rank}
                  </h4>
                </div>
              </div>
              <div className="text-right px-4 py-2 bg-white/5 rounded-2xl border border-white/5">
                <span className="block text-xs font-black text-white/40 uppercase tracking-widest mb-1">Total Spins</span>
                <div className="flex items-center gap-2 justify-end">
                  <Zap className="w-3 h-3 text-gold fill-gold" />
                  <span className="text-lg font-black italic text-gold">{userRank.total_spins}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
