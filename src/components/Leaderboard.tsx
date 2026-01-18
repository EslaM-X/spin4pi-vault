import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Medal, Award, Loader2, RefreshCw, Zap, ShieldCheck, Trophy, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LeaderboardEntry {
  pi_username: string;
  total_winnings: number;
  total_spins: number;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const CACHE_KEY = "spin4pi_leaderboard_cache";

export function Leaderboard({ entries, isLoading, error, onRetry }: LeaderboardProps) {
  const [cachedEntries, setCachedEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < 5 * 60 * 1000) setCachedEntries(data);
    }
  }, []);

  useEffect(() => {
    if (entries.length > 0 && !error) {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ data: entries, timestamp: Date.now() }));
      setCachedEntries(entries);
    }
  }, [entries, error]);

  const displayEntries = entries.length > 0 ? entries : cachedEntries;
  const topThree = [displayEntries[1], displayEntries[0], displayEntries[2]]; // ترتيب المنصة: 2, 1, 3
  const theRest = displayEntries.slice(3, 10);

  return (
    <motion.div
      className="w-full max-w-xl bg-[#0d0d12]/90 backdrop-blur-xl rounded-[3rem] border-2 border-gold/20 p-6 md:p-8 shadow-[0_0_80px_rgba(0,0,0,0.8)] relative overflow-hidden"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      {/* تأثيرات الإضاءة الخلفية */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-gold/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-pi-purple/10 blur-[100px] rounded-full pointer-events-none" />

      {/* العنوان الإمبراطوري */}
      <div className="relative flex flex-col items-center mb-12">
        <motion.div 
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="bg-gradient-to-b from-gold/20 to-transparent px-8 py-3 rounded-2xl border border-gold/30 shadow-xl backdrop-blur-sm"
        >
          <h3 className="text-2xl font-black text-gold uppercase tracking-[0.2em] flex items-center gap-3" style={{ fontFamily: 'Cinzel, serif' }}>
            <Trophy className="w-6 h-6 fill-gold/20" />
            Hall of Legends
          </h3>
        </motion.div>
        <div className="h-[2px] w-24 bg-gradient-to-r from-transparent via-gold/50 to-transparent mt-4" />
      </div>

      {isLoading && displayEntries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-6">
          <div className="relative">
            <Loader2 className="w-16 h-16 animate-spin text-gold" />
            <div className="absolute inset-0 blur-xl bg-gold/20 animate-pulse" />
          </div>
          <p className="text-gold/40 font-black uppercase tracking-[0.3em] text-[10px]">Syncing Imperial Records...</p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* منصة التتويج (THE PODIUM) */}
          <div className="flex justify-center items-end gap-2 md:gap-4 h-72 pt-10 px-2">
            {topThree[0] && <PodiumStep entry={topThree[0]} rank={2} color="#E5E7EB" height="h-32" delay={0.3} />}
            {topThree[1] && <PodiumStep entry={topThree[1]} rank={1} color="#FBBC05" height="h-48" delay={0.1} />}
            {topThree[2] && <PodiumStep entry={topThree[2]} rank={3} color="#D97706" height="h-24" delay={0.5} />}
          </div>

          {/* قائمة الـ 7 الباقين */}
          <div className="space-y-3 relative z-10">
            <AnimatePresence>
              {theRest.map((player, index) => (
                <motion.div
                  key={player.pi_username}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-[1.5rem] bg-white/[0.03] border border-white/5 hover:border-gold/30 hover:bg-white/[0.08] transition-all group"
                >
                  <div className="w-8 h-8 rounded-full bg-black border border-white/10 flex items-center justify-center text-[10px] font-black text-white/30 italic group-hover:text-gold transition-colors">
                    {index + 4}
                  </div>
                  
                  <div className="flex-1">
                    <p className="font-black text-sm text-white/90 group-hover:text-white transition-colors tracking-tight">
                      {player.pi_username}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-black text-gold/40 uppercase tracking-widest">{player.total_spins} Battles</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <span className="text-lg font-black text-gold italic tracking-tighter">
                        {player.total_winnings.toFixed(2)}
                      </span>
                      <span className="text-xs font-bold text-gold/60">π</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* زر التحديث اليدوي */}
      <div className="mt-8 flex justify-center">
        <Button 
          variant="ghost" 
          onClick={onRetry} 
          disabled={isLoading}
          className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 hover:text-gold transition-colors gap-2"
        >
          <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Standings
        </Button>
      </div>
    </motion.div>
  );
}

function PodiumStep({ entry, rank, color, height, delay }: any) {
  const isFirst = rank === 1;
  return (
    <motion.div 
      className="flex flex-col items-center flex-1 min-w-[80px] max-w-[110px]"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.8, type: "spring" }}
    >
      <div className="relative mb-4">
        {isFirst && (
          <motion.div
            animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 z-20"
          >
            <Crown className="w-10 h-10 text-gold drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]" />
          </motion.div>
        )}
        
        {/* أفاتار "إمبراطوري" */}
        <div 
          className="w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] bg-[#1a1a1a] border-2 rotate-3 group-hover:rotate-0 transition-transform overflow-hidden relative"
          style={{ borderColor: color }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
          <div className="w-full h-full flex items-center justify-center -rotate-3 font-black text-2xl uppercase italic" style={{ color }}>
            {entry.pi_username.substring(0, 2)}
          </div>
        </div>
        
        {/* رقم الترتيب فوق الأفاتار */}
        <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-white text-black rounded-lg flex items-center justify-center font-black text-xs shadow-xl">
          {rank}
        </div>
      </div>

      <div className="text-center mb-4 px-1">
        <p className="text-[10px] font-black text-white truncate uppercase tracking-tighter mb-1">{entry.pi_username}</p>
        <p className="text-sm font-black italic tracking-tighter shadow-gold" style={{ color }}>{entry.total_winnings.toFixed(2)} π</p>
      </div>

      {/* بوكس المنصة بتأثير زجاجي */}
      <div 
        className={`w-full ${height} rounded-t-[1.5rem] relative overflow-hidden flex flex-col items-center pt-4`}
        style={{ 
          background: `linear-gradient(to bottom, ${color}22, transparent)`,
          borderTop: `2px solid ${color}44` 
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60" />
        <Star className="w-4 h-4 opacity-20 animate-pulse" style={{ color }} />
      </div>
    </motion.div>
  );
}
