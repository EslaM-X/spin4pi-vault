import { motion } from "framer-motion";
import { Crown, Medal, Award, Loader2 } from "lucide-react";

interface LeaderboardEntry {
  pi_username: string;
  total_winnings: number;
  total_spins: number;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  isLoading?: boolean;
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1: return Crown;
    case 2: return Medal;
    case 3: return Award;
    default: return null;
  }
};

export function Leaderboard({ entries, isLoading }: LeaderboardProps) {
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
      
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No players yet. Be the first!
        </div>
      ) : (
        <div className="space-y-3">
          {entries.slice(0, 5).map((player, index) => {
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
