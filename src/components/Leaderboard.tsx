import { motion } from "framer-motion";
import { Crown, Medal, Award } from "lucide-react";

const mockLeaderboard = [
  { rank: 1, username: "PiKing_2025", wins: 1247, icon: Crown },
  { rank: 2, username: "CryptoSpin", wins: 983, icon: Medal },
  { rank: 3, username: "VaultMaster", wins: 876, icon: Award },
  { rank: 4, username: "SpinLegend", wins: 654 },
  { rank: 5, username: "PiWhale", wins: 521 },
];

export function Leaderboard() {
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
      
      <div className="space-y-3">
        {mockLeaderboard.map((player, index) => {
          const Icon = player.icon;
          const isTop3 = player.rank <= 3;
          
          return (
            <motion.div
              key={player.rank}
              className={`flex items-center gap-4 p-3 rounded-xl transition-all hover:bg-muted/50 ${
                isTop3 ? 'bg-gradient-to-r from-gold/10 to-transparent' : ''
              }`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              {/* Rank */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-display font-bold ${
                player.rank === 1 ? 'bg-gold text-dark-space' :
                player.rank === 2 ? 'bg-gray-400 text-dark-space' :
                player.rank === 3 ? 'bg-amber-700 text-foreground' :
                'bg-muted text-muted-foreground'
              }`}>
                {Icon ? <Icon className="w-5 h-5" /> : player.rank}
              </div>
              
              {/* Username */}
              <div className="flex-1">
                <p className={`font-medium ${isTop3 ? 'text-gold' : 'text-foreground'}`}>
                  {player.username}
                </p>
              </div>
              
              {/* Wins */}
              <div className="text-right">
                <p className="font-display font-bold text-pi-purple-glow">{player.wins}</p>
                <p className="text-xs text-muted-foreground">wins</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
