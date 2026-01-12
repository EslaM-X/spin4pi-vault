import { useState, useCallback, useEffect } from "react";
import PiSDK from "pi-sdk-js";
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
}

export function usePiAuth() {
  const [user, setUser] = useState<PiUser | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // تهيئة Pi SDK عند أول تحميل
  useEffect(() => {
    const initSDK = async () => {
      try {
        // sandbox للـ dev mode
        const sandbox = import.meta.env.DEV;
        await PiSDK.init(sandbox);
        setIsInitialized(true);
      } catch (err) {
        console.error("Pi SDK initialization failed:", err);
        setIsInitialized(false);
        toast.error("Pi SDK not available. Open in Pi Browser.");
      }
    };
    initSDK();
  }, []);

  // دالة لإنهاء أي دفع غير مكتمل
  const handleIncompletePayment = useCallback(async (payment: any) => {
    console.log("Incomplete payment found:", payment);
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

  // جلب أو إنشاء البروفايل في Supabase
  const fetchProfile = useCallback(async (username: string): Promise<ProfileData | null> => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("pi_username", username)
        .maybeSingle();
      if (error) throw error;

      if (data) {
        return {
          id: data.id,
          pi_username: data.pi_username,
          total_spins: data.total_spins || 0,
          total_winnings: data.total_winnings || 0,
          last_free_spin: data.last_free_spin,
        };
      }

      // إنشاء بروفايل جديد لو مش موجود
      const { data: newProfile, error: insertError } = await supabase
        .from("profiles")
        .insert({ pi_username: username })
        .select()
        .single();
      if (insertError) throw insertError;

      return {
        id: newProfile.id,
        pi_username: newProfile.pi_username,
        total_spins: 0,
        total_winnings: 0,
        last_free_spin: null,
      };
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      return null;
    }
  }, []);

  // تسجيل الدخول عبر Pi SDK
  const authenticate = useCallback(async () => {
    if (!isInitialized) {
      toast.error("Pi Network not available. Open in Pi Browser.");
      return null;
    }

    setIsLoading(true);
    try {
      const authResult = await PiSDK.authenticate(handleIncompletePayment);
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

      // جلب أو إنشاء البروفايل
      const profileData = await fetchProfile(piUser.username);
      setProfile(profileData);

      toast.success(`Welcome, ${piUser.username}!`);
      return piUser;
    } catch (err) {
      console.error("Auth error:", err);
      toast.error("Authentication failed");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, handleIncompletePayment, fetchProfile]);

  // تسجيل الخروج
  const logout = useCallback(() => {
    setUser(null);
    setProfile(null);
    toast.info("Logged out");
  }, []);

  // تحديث بيانات البروفايل
  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const profileData = await fetchProfile(user.username);
    setProfile(profileData);
  }, [user, fetchProfile]);

  // التحقق من صلاحية Free Spin
  const canFreeSpin = useCallback(() => {
    if (!profile?.last_free_spin) return true;
    const lastSpin = new Date(profile.last_free_spin);
    const now = new Date();
    const hoursSinceSpin = (now.getTime() - lastSpin.getTime()) / (1000 * 60 * 60);
    return hoursSinceSpin >= 24;
  }, [profile]);

  // الوقت المتبقي لـ Free Spin
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
