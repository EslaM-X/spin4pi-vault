import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Crown, Medal, Award, Loader2, RefreshCw, WifiOff } from "lucide-react";
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

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1: return Crown;
    case 2: return Medal;
    case 3: return Award;
    default: return null;
  }
};

// Cache management
const getCachedLeaderboard = (): LeaderboardEntry[] => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      // Cache valid for 5 minutes
      if (Date.now() - timestamp < 5 * 60 * 1000) {
        return data;
      }
    }
  } catch {
    // Ignore cache errors
  }
  return [];
};

const setCachedLeaderboard = (data: LeaderboardEntry[]) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch {
    // Ignore cache errors
  }
};

export function Leaderboard({ entries, isLoading, error, onRetry }: LeaderboardProps) {
  const [cachedEntries, setCachedEntries] = useState<LeaderboardEntry[]>([]);
  const [isRetrying, setIsRetrying] = useState(false);

  // Load cached data on mount
  useEffect(() => {
    const cached = getCachedLeaderboard();
    if (cached.length > 0) {
      setCachedEntries(cached);
    }
  }, []);

  // Update cache when new data arrives
  useEffect(() => {
    if (entries.length > 0 && !error) {
      setCachedLeaderboard(entries);
      setCachedEntries(entries);
    }
  }, [entries, error]);

  const handleRetry = async () => {
    if (onRetry) {
      setIsRetrying(true);
      await onRetry();
      setIsRetrying(false);
    }
  };

  // Use current entries if available, otherwise fall back to cache
  const displayEntries = entries.length > 0 ? entries : cachedEntries;
  const showingCached = entries.length === 0 && cachedEntries.length > 0 && error;

  return (
    <motion.div
      className="w-full max-w-md bg-gradient-to-br from-card via-card to-pi-purple/10 rounded-2xl border border-border p-6"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <h3 className="text-2xl font-display font-bold text-center mb-6 text-gradient-gold">
        🏆 Top Spinners
      </h3>

      {/* Error State with Retry */}
      {error && !isLoading && (
        <motion.div 
          className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-xl"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 text-destructive mb-2">
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">Connection issue</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            {showingCached ? "Showing cached results" : "Failed to load leaderboard"}
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full"
          >
            {isRetrying ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            {isRetrying ? "Retrying..." : "Retry"}
          </Button>
        </motion.div>
      )}

      {/* Cached indicator */}
      {showingCached && (
        <div className="text-xs text-muted-foreground text-center mb-3 flex items-center justify-center gap-1">
          <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
          Showing cached data
        </div>
      )}
      
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      ) : displayEntries.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">No players yet. Be the first!</p>
          {onRetry && (
            <Button variant="ghost" size="sm" onClick={handleRetry}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {displayEntries.slice(0, 5).map((player, index) => {
            const rank = index + 1;
            const Icon = getRankIcon(rank);
            const isTop3 = rank <= 3;
            
            return (
              <motion.div
                key={player.pi_username}
                className={`flex items-center gap-4 p-3 rounded-xl transition-all hover:bg-muted/50 ${
                  isTop3 ? 'bg-gradient-to-r from-gold/10 to-transparent' : ''
                }`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                {/* Rank */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-display font-bold ${
                  rank === 1 ? 'bg-gold text-dark-space' :
                  rank === 2 ? 'bg-gray-400 text-dark-space' :
                  rank === 3 ? 'bg-amber-700 text-foreground' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {Icon ? <Icon className="w-5 h-5" /> : rank}
                </div>
                
                {/* Username */}
                <div className="flex-1">
                  <p className={`font-medium ${isTop3 ? 'text-gold' : 'text-foreground'}`}>
                    {player.pi_username}
                  </p>
                </div>
                
                {/* Wins */}
                <div className="text-right">
                  <p className="font-display font-bold text-pi-purple-glow">{player.total_winnings.toFixed(2)} π</p>
                  <p className="text-xs text-muted-foreground">{player.total_spins} spins</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
