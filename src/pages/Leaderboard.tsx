import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trophy, Medal, Crown, Zap, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePiAuth } from '@/hooks/usePiAuth';
import GlobalLoading from '@/components/GlobalLoading';

const Leaderboard = () => {
  const { user } = usePiAuth();

  // 1. جلب قائمة أفضل 10 لاعبين (مُحسّنة)
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
    },
    refetchInterval: 60000 // تحديث تلقائي كل دقيقة
  });

  // 2. جلب ترتيب المستخدم الحالي (طريقة احترافية وعالية الأداء)
  const { data: userRank, isLoading: userRankLoading } = useQuery({
    queryKey: ['user-rank', user?.username],
    enabled: !!user?.username,
    queryFn: async () => {
      // أ- جلب عدد اللفات للمستخدم الحالي أولاً
      const { data: me } = await supabase
        .from('profiles')
        .select('total_spins')
        .eq('pi_username', user?.username)
        .single();

      if (!me) return { rank: '?', total_spins: 0 };

      // ب- حساب عدد الأشخاص الذين لديهم لفات أكثر (هذا هو الترتيب)
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gt('total_spins', me.total_spins);

      return {
        rank: (count || 0) + 1,
        total_spins: me.total_spins
      };
    }
  });

  if (ranksLoading || userRankLoading) return <GlobalLoading isVisible={true} />;

  return (
    <div className="min-h-screen bg-[#050507] text-white pb-32 overflow-x-hidden selection:bg-gold/20">
      {/* Background Decorative Element */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.08),transparent)] pointer-events-none" />

      <div className="container mx-auto px-4 pt-12 relative z-10">
        <header className="mb-12 text-center md:text-left">
          <Link to="/" className="inline-flex items-center gap-2 text-white/30 hover:text-gold mb-8 transition-all group">
            <div className="p-2 rounded-xl bg-white/5 group-hover:bg-gold/10 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[3px]">Imperial Gates</span>
          </Link>
          
          <div className="space-y-2">
            <motion.p 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-[10px] font-black text-gold uppercase tracking-[6px]"
            >
              Imperial Hall of Fame
            </motion.p>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-[100px] font-black italic tracking-tighter uppercase leading-none"
            >
              TOP<span className="text-gold">10</span>
            </motion.h1>
          </div>
        </header>

        {/* Rankings List */}
        <div className="space-y-4 max-w-2xl mx-auto">
          {rankings?.map((player, index) => {
            const isTop3 = index < 3;
            const isCurrentUser = player.pi_username === user?.username;
            
            return (
              <motion.div
                key={player.pi_username}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative p-[1.5px] rounded-[32px] overflow-hidden ${
                  index === 0 ? 'bg-gradient-to-r from-gold via-white to-gold' :
                  index === 1 ? 'bg-gradient-to-r from-slate-400 via-white to-slate-400' :
                  index === 2 ? 'bg-gradient-to-r from-amber-700 via-amber-200 to-amber-700' :
                  isCurrentUser ? 'bg-gold/40' : 'bg-white/10'
                }`}
              >
                <div className="bg-[#0a0a0f] rounded-[31px] p-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-5">
                    <div className={`text-2xl font-black italic w-8 ${isTop3 ? 'text-gold' : 'text-white/10'}`}>
                      {index + 1}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-black uppercase tracking-tight ${isCurrentUser ? 'text-gold' : 'text-white'}`}>
                          @{player.pi_username}
                        </span>
                        {index === 0 && <Crown className="w-4 h-4 text-gold fill-gold" />}
                      </div>
                      <div className="flex items-center gap-2 opacity-50">
                        <Zap className="w-3 h-3 text-gold fill-gold" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{player.total_spins} Spins Completed</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    {index === 0 && <Trophy className="w-8 h-8 text-gold drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" />}
                    {index === 1 && <Medal className="w-8 h-8 text-slate-300" />}
                    {index === 2 && <Medal className="w-8 h-8 text-amber-600" />}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Floating Personal Status Bar */}
      {userRank && (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent backdrop-blur-sm z-50">
          <div className="max-w-2xl mx-auto">
            <motion.div 
              initial={{ y: 100 }} animate={{ y: 0 }}
              className="bg-[#13131a] border border-gold/30 rounded-[35px] p-6 flex items-center justify-between shadow-2xl"
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center border border-gold/20">
                  <User className="w-7 h-7 text-gold" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gold/60 uppercase tracking-[4px] mb-1">Your Imperial Rank</p>
                  <h4 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                    #{userRank.rank} <span className="text-sm not-italic font-normal text-white/20 ml-2">OVERALL</span>
                  </h4>
                </div>
              </div>
              
              <div className="hidden sm:block text-right">
                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Activity</p>
                <div className="flex items-center gap-2 text-gold font-black italic text-xl">
                  <Zap size={16} className="fill-gold" />
                  {userRank.total_spins}
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
