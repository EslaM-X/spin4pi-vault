import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Clock, Users, Coins, ChevronRight, Medal } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Tournament {
  id: string;
  name: string;
  description: string;
  start_time: string;
  end_time: string;
  prize_pool: number;
  entry_fee: number;
  status: string;
}

interface TournamentEntry {
  id: string;
  profile_id: string;
  total_winnings: number;
  spin_count: number;
  profiles?: {
    pi_username: string;
  };
}

interface TournamentPanelProps {
  profileId: string;
  walletBalance: number;
  onRefresh: () => void;
}

export function TournamentPanel({ profileId, walletBalance, onRefresh }: TournamentPanelProps) {
  const [selectedTournament, setSelectedTournament] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: tournaments } = useQuery({
    queryKey: ['tournaments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .in('status', ['active', 'upcoming'])
        .order('start_time', { ascending: true });
      if (error) throw error;
      return data as Tournament[];
    }
  });

  const { data: myEntries } = useQuery({
    queryKey: ['my-tournament-entries', profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tournament_entries')
        .select('tournament_id')
        .eq('profile_id', profileId);
      if (error) throw error;
      return new Set(data.map(e => e.tournament_id));
    },
    enabled: !!profileId
  });

  const { data: leaderboard } = useQuery({
    queryKey: ['tournament-leaderboard', selectedTournament],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tournament_entries')
        .select(`
          id,
          profile_id,
          total_winnings,
          spin_count,
          profiles:profile_id (pi_username)
        `)
        .eq('tournament_id', selectedTournament!)
        .order('total_winnings', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data as TournamentEntry[];
    },
    enabled: !!selectedTournament
  });

  const joinMutation = useMutation({
    mutationFn: async (tournament: Tournament) => {
      if (walletBalance < tournament.entry_fee) {
        throw new Error('Insufficient balance');
      }

      // Deduct entry fee
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ wallet_balance: walletBalance - tournament.entry_fee })
        .eq('id', profileId);
      
      if (balanceError) throw balanceError;

      // Add to prize pool
      const { error: prizeError } = await supabase
        .from('tournaments')
        .update({ prize_pool: tournament.prize_pool + tournament.entry_fee })
        .eq('id', tournament.id);
      
      if (prizeError) throw prizeError;

      // Create entry
      const { error: entryError } = await supabase
        .from('tournament_entries')
        .insert({
          tournament_id: tournament.id,
          profile_id: profileId
        });
      
      if (entryError) throw entryError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-tournament-entries'] });
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      onRefresh();
      toast.success('Joined tournament!');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const activeTournament = tournaments?.find(t => t.status === 'active');

  return (
    <div className="space-y-4">
      {/* Active Tournament Banner */}
      {activeTournament && (
        <motion.div
          className="p-4 rounded-xl bg-gradient-to-r from-pi-purple to-pi-purple-dark border border-pi-purple/50 relative overflow-hidden"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/20 rounded-full blur-3xl" />
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-gold" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg">{activeTournament.name}</h3>
                <div className="flex items-center gap-3 text-sm text-white/70">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Ends {formatDistanceToNow(new Date(activeTournament.end_time), { addSuffix: true })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Coins className="w-4 h-4" />
                    {activeTournament.prize_pool} π pool
                  </span>
                </div>
              </div>
            </div>
            
            {myEntries?.has(activeTournament.id) ? (
              <Button 
                variant="outline" 
                onClick={() => setSelectedTournament(activeTournament.id)}
                className="border-white/30 text-white hover:bg-white/10"
              >
                View Leaderboard
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button 
                onClick={() => joinMutation.mutate(activeTournament)}
                disabled={joinMutation.isPending}
                className="bg-gold hover:bg-gold-dark text-background"
              >
                Join ({activeTournament.entry_fee} π)
              </Button>
            )}
          </div>
        </motion.div>
      )}

      {/* Tournament Leaderboard Modal */}
      <AnimatePresence>
        {selectedTournament && (
          <motion.div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedTournament(null)}
          >
            <motion.div
              className="w-full max-w-md bg-card border border-border rounded-2xl p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-6">
                <Trophy className="w-8 h-8 text-gold" />
                <div>
                  <h2 className="font-display text-xl font-bold">Tournament Leaderboard</h2>
                  <p className="text-sm text-muted-foreground">Top 10 players</p>
                </div>
              </div>

              <div className="space-y-2">
                {leaderboard?.map((entry, index) => {
                  const isCurrentUser = entry.profile_id === profileId;
                  return (
                    <motion.div
                      key={entry.id}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        isCurrentUser ? 'bg-gold/20 border border-gold/50' : 'bg-muted/50'
                      }`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-gold text-background' :
                        index === 1 ? 'bg-slate-400 text-background' :
                        index === 2 ? 'bg-amber-700 text-white' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {index < 3 ? <Medal className="w-4 h-4" /> : index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">
                          {entry.profiles?.pi_username || 'Unknown'}
                          {isCurrentUser && <span className="text-gold ml-1">(You)</span>}
                        </p>
                        <p className="text-xs text-muted-foreground">{entry.spin_count} spins</p>
                      </div>
                      <div className="text-right">
                        <p className="font-display font-bold text-gold">{entry.total_winnings.toFixed(2)} π</p>
                      </div>
                    </motion.div>
                  );
                })}

                {(!leaderboard || leaderboard.length === 0) && (
                  <p className="text-center text-muted-foreground py-8">No entries yet. Be the first!</p>
                )}
              </div>

              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => setSelectedTournament(null)}
              >
                Close
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upcoming Tournaments */}
      {tournaments?.filter(t => t.status === 'upcoming').map((tournament) => (
        <motion.div
          key={tournament.id}
          className="p-4 rounded-xl bg-card border border-border"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Upcoming</p>
              <h4 className="font-semibold">{tournament.name}</h4>
              <p className="text-sm text-muted-foreground">
                Starts {formatDistanceToNow(new Date(tournament.start_time), { addSuffix: true })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-gold font-bold">{tournament.prize_pool} π</p>
              <p className="text-xs text-muted-foreground">Prize Pool</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
