import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PiUser {
  uid: string;
  username: string;
}

export const usePiAuth = () => {
  const [user, setUser] = useState<PiUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const syncUserWithDatabase = async (piUser: PiUser) => {
    try {
      // محاولة تحديث أو إنشاء البروفايل لضمان وجود المستخدم في قاعدة البيانات
      const { data, error } = await supabase
        .from("profiles")
        .upsert({
          pi_username: piUser.username,
          wallet_address: piUser.uid, 
          last_login: new Date().toISOString(),
        }, { onConflict: 'pi_username' })
        .select()
        .single();

      if (error) {
        console.error("Database sync error:", error.message);
        return;
      }
      console.log("Database successfully synced for user:", piUser.username);
    } catch (err) {
      console.error("Critical Auth Sync Error:", err);
    }
  };

  const authenticate = useCallback(async () => {
    if (!window.Pi) {
      toast.error("Please open this app inside Pi Browser.");
      return null;
    }

    setIsLoading(true);
    try {
      const scopes = ["username", "payments"];
      const auth = await window.Pi.authenticate(scopes, (onIncompletePaymentFound) => {
        console.log("Incomplete payment found:", onIncompletePaymentFound);
      });

      console.log("Pi Network Auth Success:", auth.user.username);
      
      setUser(auth.user);
      setIsAuthenticated(true);
      
      // مزامنة فورية مع السيرفر لفتح الميزات
      await syncUserWithDatabase(auth.user);
      
      toast.success(`Welcome, ${auth.user.username}!`);
      return auth.user;
    } catch (err) {
      console.error("Auth failed:", err);
      toast.error("Failed to login with Pi. Try again.");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // تحسين وظيفة التحقق من اللفات المجانية
  const canFreeSpin = useCallback(() => {
    return isAuthenticated; 
  }, [isAuthenticated]);

  const getNextFreeSpinTime = useCallback(() => {
    return isAuthenticated ? "Available" : "Login Required";
  }, [isAuthenticated]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await syncUserWithDatabase(user);
    }
  }, [user]);

  useEffect(() => {
    const checkPi = () => {
      if (window.Pi) {
        setIsInitialized(true);
        setIsLoading(false);
        return true;
      }
      return false;
    };

    if (!checkPi()) {
      const timer = setInterval(() => {
        if (checkPi()) {
          clearInterval(timer);
        }
      }, 500);
      return () => clearInterval(timer);
    }
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    isInitialized,
    authenticate,
    logout,
    refreshProfile,
    canFreeSpin,
    getNextFreeSpinTime
  };
};
