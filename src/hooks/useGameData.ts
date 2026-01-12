import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/* ================= TYPES ================= */

interface LeaderboardEntry {
  pi_username: string;
  total_winnings: number;
  total_spins: number;
}

interface GameDataResult {
  jackpot: number;
  leaderboard: LeaderboardEntry[];
  isLoading: boolean;
  refreshData: () => Promise<void>;
}

/* ================= HOOK ================= */

export function useGameData(): GameDataResult {
  const [jackpot, setJackpot] = useState<number>(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /* ===== Fetch leaderboard + jackpot ===== */
  const fetchData = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke("get-leaderboard");

      if (error) {
        console.error("Leaderboard fetch error:", error);
        toast.error("Failed to load game data");
        return;
      }

      if (!data) return;

      setJackpot(Number(data.jackpot) || 0);
      setLeaderboard(Array.isArray(data.leaderboard) ? data.leaderboard : []);
    } catch (err) {
      console.error("Game data fetch failed:", err);
      toast.error("Game data unavailable");
    } finally {
      setIsLoading(false);
    }
  }, []);

  /* ===== Initial fetch + polling ===== */
  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, 30_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  /* ===== Realtime jackpot updates ===== */
  useEffect(() => {
    const channel = supabase
      .channel("jackpot-realtime")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "jackpot",
        },
        (payload) => {
          const updated = payload.new as { total_pi?: number };
          if (typeof updated?.total_pi === "number") {
            setJackpot(updated.total_pi);
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
