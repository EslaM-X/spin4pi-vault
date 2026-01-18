import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Clock, Users, Coins, ChevronRight, Medal, Star, Flame, Sword } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export function TournamentPanel({ profileId, walletBalance, onRefresh }: any) {
  const [selectedTournament, setSelectedTournament] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // جلب البطولات النشطة والقادمة
  const { data: tournaments } = useQuery({
    queryKey: ['tournaments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .in('status', ['active', 'upcoming'])
        .order('start_time', { ascending: true });
      if (error) throw error;
      return data;
    }
  });

  const activeTournament = tournaments?.find(t => t.status === 'active');

  return (
    <div className="space-y-6">
      {/* Active Arena Section */}
      {activeTournament ? (
        <motion.div
          className="relative p-6 rounded-[2.5rem] bg-[#0d0d12] border-2 border-gold/20 overflow-hidden shadow-2xl group"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {/* خلفية فنية للبطولة */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 blur-[100px] rounded-full pointer-events-none group-hover:bg-gold/20 transition-all duration-700" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold via-amber-500 to-amber-700 p-[1px] shadow-lg shadow-gold/20">
                  <div className="w-full h-full rounded-2xl bg-black flex items-center justify-center">
                    <Trophy className="w-7 h-7 text-gold animate-bounce" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-gold uppercase tracking-[0.3em]">Imperial Arena</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <h3 className="font-black text-xl text-white italic tracking-widest uppercase" style={{ fontFamily: 'Cinzel, serif' }}>
                    {activeTournament.name}
                  </h3>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Total Prize</p>
                <p className="text-2xl font-black text-gold italic tracking-tighter" style={{ fontFamily: 'Cinzel, serif' }}>
                  {activeTournament.prize_pool} <span className="text-xs">π</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex items-center gap-3">
                <Clock className="w-4 h-4 text-gold/60" />
                <div>
                  <p className="text-[8px] font-black text-white/30 uppercase">Ends In</p>
                  <p className="text-[10px] font-bold text-white tracking-wide">
                    {formatDistanceToNow(new Date(activeTournament.end_time))}
                  </p>
                </div>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex items-center gap-3">
                <Users className="w-4 h-4 text-gold/60" />
                <div>
                  <p className="text-[8px] font-black text-white/30 uppercase">Combatants</p>
                  <p className="text-[10px] font-bold text-white tracking-wide">Elite Only</p>
                </div>
              </div>
            </div>

            <Button 
              className="w-full h-14 bg-gold hover:bg-gold/80 text-black font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-gold/10 group overflow-hidden transition-all"
              onClick={() => setSelectedTournament(activeTournament.id)}
            >
              <Sword className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
              Enter The Arena ({activeTournament.entry_fee} π)
            </Button>
          </div>
        </motion.div>
      ) : (
        <div className="p-8 text-center bg-white/5 border border-white/5 rounded-[2.5rem]">
          <Star className="w-8 h-8 text-white/10 mx-auto mb-3" />
          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">No Active Conquests</p>
        </div>
      )}

      {/* Upcoming Battles */}
      <div className="space-y-3">
        <h4 className="px-4 text-[10px] font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-2">
          <Flame className="w-3 h-3" /> Future Conquests
        </h4>
        {tournaments?.filter(t => t.status === 'upcoming').map((t) => (
          <motion.div
            key={t.id}
            className="p-5 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:bg-white/[0.04] transition-all"
            whileHover={{ x: 5 }}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-gold/30 transition-colors">
                <Medal className="w-5 h-5 text-white/20 group-hover:text-gold transition-colors" />
              </div>
              <div>
                <h5 className="font-bold text-sm text-white/80">{t.name}</h5>
                <p className="text-[10px] text-white/30 uppercase font-black">Starts in {formatDistanceToNow(new Date(t.start_time))}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-black text-gold italic">{t.prize_pool} π</p>
              <div className="flex items-center gap-1 justify-end">
                <div className="w-1 h-1 rounded-full bg-gold/50" />
                <span className="text-[8px] font-bold text-white/20 uppercase">Pool</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
