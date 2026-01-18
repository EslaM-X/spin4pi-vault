import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Medal, Award, Loader2, RefreshCw, WifiOff, Zap, ShieldCheck } from "lucide-react";
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
  const [isRetrying, setIsRetrying] = useState(false);

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
  const topThree = displayEntries.slice(0, 3);
  const theRest = displayEntries.slice(3, 10);

  return (
    <motion.div
      className="w-full max-w-xl bg-[#0d0d12] rounded-[2.5rem] border-2 border-gold/20 p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden relative"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-[60px] rounded-full" />

      <div className="relative flex flex-col items-center mb-10">
        <div className="bg-gold/10 px-6 py-2 rounded-full border border-gold/20 mb-4 backdrop-blur-md">
          <h3 className="text-xl font-black text-gold uppercase tracking-[0.3em] flex items-center gap-2" style={{ fontFamily: 'Cinzel, serif' }}>
            <Zap className="w-5 h-5 fill-gold" />
            Hall of Legends
          </h3>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-gold" />
          <p className="text-gold/50 font-bold uppercase tracking-widest text-xs">Consulting the Oracle...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* THE PODIUM (TOP 3) */}
          <div className="flex justify-center items-end gap-2 md:gap-4 mb-12 h-64 pt-10">
            {/* 2nd Place */}
            {topThree[1] && (
              <PodiumStep entry={topThree[1]} rank={2} color="#C0C0C0" height="h-32" />
            )}
            {/* 1st Place */}
            {topThree[0] && (
              <PodiumStep entry={topThree[0]} rank={1} color="#FBBC05" height="h-44" />
            )}
            {/* 3rd Place */}
            {topThree[2] && (
              <PodiumStep entry={topThree[2]} rank={3} color="#CD7F32" height="h-24" />
            )}
          </div>

          {/* THE REST (List) */}
          <div className="space-y-3">
            <AnimatePresence>
              {theRest.map((player, index) => (
                <motion.div
                  key={player.pi_username}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-gold/30 hover:bg-white/10 transition-all group"
                >
                  <span className="text-white/30 font-black italic w-6">{index + 4}</span>
                  <div className="flex-1">
                    <p className="font-bold text-white group-hover:text-gold transition-colors">{player.pi_username}</p>
                    <div className="flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-white/20" />
                      <p className="text-[10px] text-white/40 uppercase tracking-widest">{player.total_spins} Spins</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-gold tracking-tighter italic">{player.total_winnings.toFixed(2)} π</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// مكون فرعي للمنصة (Podium Step)
function PodiumStep({ entry, rank, color, height }: { entry: LeaderboardEntry; rank: number; color: string; height: string }) {
  const isFirst = rank === 1;
  return (
    <motion.div 
      className="flex flex-col items-center flex-1 max-w-[120px]"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.2 }}
    >
      {/* Avatar / Icon */}
      <div className="relative mb-3">
        {isFirst && (
          <motion.div
            animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="absolute -top-8 left-1/2 -translate-x-1/2"
          >
            <Crown className="w-8 h-8 text-gold drop-shadow-[0_0_10px_#fbbf24]" />
          </motion.div>
        )}
        <div 
          className="w-16 h-16 rounded-2xl flex items-center justify-center border-2 rotate-45 overflow-hidden bg-[#1a1a1a]"
          style={{ borderColor: color }}
        >
          <div className="-rotate-45 font-black text-xl" style={{ color }}>
            {entry.pi_username.substring(0, 2).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Name & Prize */}
      <div className="text-center mb-4">
        <p className="text-xs font-black text-white truncate w-full px-1 mb-1">{entry.pi_username}</p>
        <p className="text-sm font-black italic tracking-tighter" style={{ color }}>{entry.total_winnings.toFixed(2)} π</p>
      </div>

      {/* Podium Box */}
      <div 
        className={`w-full ${height} rounded-t-2xl relative overflow-hidden flex flex-col items-center justify-center`}
        style={{ 
          background: `linear-gradient(to bottom, ${color}33, transparent)`,
          borderTop: `3px solid ${color}` 
        }}
      >
        <span className="text-4xl font-black opacity-20" style={{ color }}>{rank}</span>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>
    </motion.div>
  );
}
