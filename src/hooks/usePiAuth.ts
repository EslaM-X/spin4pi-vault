// src/hooks/usePiAuth.ts - Unified Pi Authentication Hook
import { useState, useCallback, useEffect } from "react";
import { piSDK } from "@/lib/pi-sdk";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PiUser {
  uid: string;
  username: string;
  accessToken: string;
}

interface ProfileData {
  id: string;
  pi_username: string;
  total_spins: number;
  total_winnings: number;
  last_free_spin: string | null;
  referral_code?: string;
  wallet_balance?: number;
}

function usePiAuthUnified() {
  const [user, setUser] = useState<PiUser | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // ===== Initialize Pi SDK =====
  useEffect(() => {
    const initSDK = async () => {
      try {
        await piSDK.init(import.meta.env.DEV);
        setIsInitialized(true);
      } catch (err) {
        console.error("Pi SDK initialization failed:", err);
        toast.error("Pi SDK not available. Open in Pi Browser.");
        setIsInitialized(false);
      }
    };
    initSDK();
  }, []);

  // ===== Handle incomplete payments =====
  const handleIncompletePayment = useCallback(async (payment: any) => {
    console.log("Incomplete payment detected:", payment);
    try {
      await supabase.functions.invoke("complete-payment", {
        body: {
          payment_id: payment.identifier,
          txid: payment.transaction?.txid,
        },
      });
    } catch (err) {
      console.error("Failed to complete payment:", err);
    }
  }, []);

  // ===== Fetch or create profile in Supabase =====
  const fetchProfile = useCallback(async (username: string): Promise<ProfileData | null> => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("pi_username", username)
        .maybeSingle();

      if (error) throw error;

      if (data) return data;

      // Create new profile if not exists
      const { data: newProfile, error: insertError } = await supabase
        .from("profiles")
        .insert({ pi_username: username })
        .select()
        .single();

      if (insertError) throw insertError;
      return newProfile;
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      return null;
    }
  }, []);

  // ===== Authenticate user =====
  const authenticate = useCallback(async () => {
    if (!isInitialized) {
      toast.error("Pi Network not available. Open in Pi Browser.");
      return null;
    }

    setIsLoading(true);
    try {
      const authResult = await piSDK.authenticate(handleIncompletePayment);

      if (!authResult) {
        toast.error("Authentication failed");
        return null;
      }

      const piUser: PiUser = {
        uid: authResult.user.uid,
        username: authResult.user.username,
        accessToken: authResult.accessToken,
      };

      setUser(piUser);

      // Fetch or create profile
      const profileData = await fetchProfile(piUser.username);
      setProfile(profileData);

      toast.success(`Welcome, ${piUser.username}!`);
      return piUser;
    } catch (err) {
      console.error("Authentication error:", err);
      toast.error("Authentication failed");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, handleIncompletePayment, fetchProfile]);

  // ===== Logout =====
  const logout = useCallback(() => {
    setUser(null);
    setProfile(null);
    toast.info("Logged out");
  }, []);

  // ===== Refresh profile =====
  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const profileData = await fetchProfile(user.username);
    setProfile(profileData);
  }, [user, fetchProfile]);

  // ===== Free Spin check =====
  const canFreeSpin = useCallback(() => {
    if (!profile?.last_free_spin) return true;
    const lastSpin = new Date(profile.last_free_spin);
    const now = new Date();
    const hoursSinceSpin = (now.getTime() - lastSpin.getTime()) / (1000 * 60 * 60);
    return hoursSinceSpin >= 24;
  }, [profile]);

  const getNextFreeSpinTime = useCallback(() => {
    if (!profile?.last_free_spin) return "Available!";
    const lastSpin = new Date(profile.last_free_spin);
    const nextSpin = new Date(lastSpin.getTime() + 24 * 60 * 60 * 1000);
    const now = new Date();
    if (now >= nextSpin) return "Available!";
    const diff = nextSpin.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }, [profile]);

  return {
    user,
    profile,
    isLoading,
    isInitialized,
    authenticate,
    logout,
    refreshProfile,
    canFreeSpin,
    getNextFreeSpinTime,
    isAuthenticated: !!user,
  };
}

// Export both the function and as named export
export { usePiAuthUnified };
export const usePiAuth = usePiAuthUnified;
export default usePiAuthUnified;
