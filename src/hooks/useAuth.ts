import { useState, useEffect, useCallback } from "react";
import { piSDK } from "pi-sdk-js";
import { supabase } from "@/integrations/supabase/client";

/* ================= TYPES ================= */

export interface PiUser {
  uid: string;
  username: string;
  walletAddress?: string;
}

interface AuthResult {
  user?: PiUser;
  isAuthenticated: boolean;
  isLoading: boolean;
  authenticate: () => Promise<PiUser | null>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  canFreeSpin: () => boolean;
  getNextFreeSpinTime: () => string;
}

/* ================= HOOK ================= */

export function useAuth(): AuthResult {
  const [user, setUser] = useState<PiUser | undefined>();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastFreeSpin, setLastFreeSpin] = useState<string | null>(null);

  /* ========== INIT AUTH ========== */
  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    if (!piSDK.isAvailable()) {
      setIsLoading(false);
      return;
    }

    try {
      const session = await piSDK.getUser();
      if (session?.uid) {
        await syncProfile(session);
        setUser(session);
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.warn("Pi session not found");
    } finally {
      setIsLoading(false);
    }
  };

  /* ========== LOGIN ========== */
  const authenticate = async (): Promise<PiUser | null> => {
    setIsLoading(true);
    try {
      const piUser = await piSDK.authenticate([
        "username",
        "payments",
        "wallet_address",
      ]);

      if (!piUser?.uid) return null;

      await syncProfile(piUser);

      setUser(piUser);
      setIsAuthenticated(true);
      return piUser;
    } catch (err) {
      console.error("Pi authentication failed", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /* ========== SYNC WITH SUPABASE ========== */
  const syncProfile = async (piUser: PiUser) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("pi_uid", piUser.uid)
      .maybeSingle();

    if (!data) {
      await supabase.from("profiles").insert({
        pi_uid: piUser.uid,
        pi_username: piUser.username,
        wallet_balance: 0,
        total_spins: 0,
        total_winnings: 0,
        referral_code: piUser.username,
      });
      setLastFreeSpin(null);
    } else {
      setLastFreeSpin(data.last_free_spin);
    }

    if (error) console.error(error);
  };

  /* ========== REFRESH PROFILE ========== */
  const refreshProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("last_free_spin")
      .eq("pi_uid", user.uid)
      .single();

    setLastFreeSpin(data?.last_free_spin || null);
  };

  /* ========== FREE SPIN LOGIC ========== */
  const canFreeSpin = () => {
    if (!lastFreeSpin) return true;
    const last = new Date(lastFreeSpin).getTime();
    return Date.now() - last >= 24 * 60 * 60 * 1000;
  };

  const getNextFreeSpinTime = () => {
    if (!lastFreeSpin) return "Available";
    const next =
      new Date(lastFreeSpin).getTime() + 24 * 60 * 60 * 1000;
    const diff = next - Date.now();
    if (diff <= 0) return "Available";

    const h = Math.floor(diff / 3_600_000);
    const m = Math.floor((diff % 3_600_000) / 60_000);
    const s = Math.floor((diff % 60_000) / 1000);

    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  /* ========== LOGOUT ========== */
  const logout = () => {
    setUser(undefined);
    setIsAuthenticated(false);
    setLastFreeSpin(null);
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    authenticate,
    logout,
    refreshProfile,
    canFreeSpin,
    getNextFreeSpinTime,
  };
}
