import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  error: string | null;
  refreshData: () => Promise<void>;
}

/* ================= CACHE ================= */

const CACHE_KEY = "spin4pi_game_data_cache";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CachedData {
  jackpot: number;
  leaderboard: LeaderboardEntry[];
  timestamp: number;
}

const getCache = (): CachedData | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const data = JSON.parse(cached) as CachedData;
      if (Date.now() - data.timestamp < CACHE_TTL) {
        return data;
      }
    }
  } catch {
    // Ignore
  }
  return null;
};

const setCache = (data: { jackpot: number; leaderboard: LeaderboardEntry[] }) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      ...data,
      timestamp: Date.now(),
    }));
  } catch {
    // Ignore
  }
};

/* ================= HOOK ================= */

export function useGameData(): GameDataResult {
  const [jackpot, setJackpot] = useState<number>(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const retryCount = useRef(0);
  const maxRetries = 3;

  /* ===== Fetch with retry logic ===== */
  const fetchData = useCallback(async (isRetry = false) => {
    if (!isRetry) {
      setError(null);
    }

    try {
      const { data, error: fetchError } = await supabase.functions.invoke("get-leaderboard");

      if (fetchError) {
        console.error("Leaderboard fetch error:", fetchError);
        
        // Auto-retry up to 3 times
        if (retryCount.current < maxRetries) {
          retryCount.current++;
          console.log(`Retrying... attempt ${retryCount.current}/${maxRetries}`);
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount.current));
          return fetchData(true);
        }
        
        setError(fetchError.message || "Failed to load game data");
        
        // Fall back to cache
        const cached = getCache();
        if (cached) {
          setJackpot(cached.jackpot);
          setLeaderboard(cached.leaderboard);
        }
        return;
      }

      if (!data) {
        setError("No data received");
        return;
      }

      // Success - reset retry count
      retryCount.current = 0;
      
      const newJackpot = Number(data.jackpot) || 0;
      const newLeaderboard = Array.isArray(data.leaderboard) ? data.leaderboard : [];
      
      setJackpot(newJackpot);
      setLeaderboard(newLeaderboard);
      setError(null);
      
      // Update cache
      setCache({ jackpot: newJackpot, leaderboard: newLeaderboard });
      
    } catch (err) {
      console.error("Game data fetch failed:", err);
      const errorMessage = err instanceof Error ? err.message : "Game data unavailable";
      setError(errorMessage);
      
      // Fall back to cache
      const cached = getCache();
      if (cached) {
        setJackpot(cached.jackpot);
        setLeaderboard(cached.leaderboard);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  /* ===== Public refresh function (resets retry count) ===== */
  const refreshData = useCallback(async () => {
    retryCount.current = 0;
    setIsLoading(true);
    await fetchData();
  }, [fetchData]);

  /* ===== Initial fetch + load from cache first ===== */
  useEffect(() => {
    // Load cache immediately for instant display
    const cached = getCache();
    if (cached) {
      setJackpot(cached.jackpot);
      setLeaderboard(cached.leaderboard);
      setIsLoading(false);
    }
    
    // Then fetch fresh data
    fetchData();
  }, [fetchData]);

  /* ===== Polling with backoff ===== */
  useEffect(() => {
    // Poll less frequently if there was an error
    const pollInterval = error ? 60_000 : 30_000;
    const interval = setInterval(() => {
      retryCount.current = 0;
      fetchData();
    }, pollInterval);
    
    return () => clearInterval(interval);
  }, [fetchData, error]);

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
    error,
    refreshData,
  };
}
