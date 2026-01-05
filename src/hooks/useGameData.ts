import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LeaderboardEntry {
  pi_username: string;
  total_winnings: number;
  total_spins: number;
}

interface GameData {
  jackpot: number;
  leaderboard: LeaderboardEntry[];
  isLoading: boolean;
  refreshData: () => Promise<void>;
}

export function useGameData(): GameData {
  const [jackpot, setJackpot] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-leaderboard');
      
      if (error) {
        console.error('Error fetching game data:', error);
        return;
      }

      if (data) {
        setJackpot(data.jackpot || 0);
        setLeaderboard(data.leaderboard || []);
      }
    } catch (err) {
      console.error('Error fetching game data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Subscribe to realtime jackpot updates
  useEffect(() => {
    const channel = supabase
      .channel('jackpot-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'jackpot'
        },
        (payload) => {
          if (payload.new && typeof payload.new === 'object' && 'total_pi' in payload.new) {
            setJackpot(payload.new.total_pi as number);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    jackpot,
    leaderboard,
    isLoading,
    refreshData: fetchData,
  };
}
