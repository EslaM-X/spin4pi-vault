import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PiUser {
  uid: string;
  username: string;
}

export const usePiAuth = () => {
  // 1. استرجاع البيانات المخزنة مسبقاً لمنع تسجيل الخروج عند التنقل
  const [user, setUser] = useState<PiUser | null>(() => {
    const savedUser = localStorage.getItem('pi_user_cache');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('pi_auth_state') === 'true';
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const syncUserWithDatabase = async (piUser: PiUser) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .upsert({
          pi_username: piUser.username,
          wallet_address: piUser.uid, 
          last_login: new Date().toISOString(),
        }, { onConflict: 'pi_username' })
        .select()
        .single();

      if (error) console.error("Database sync error:", error.message);
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

      // 2. حفظ البيانات في التخزين المحلي لضمان الاستمرارية
      localStorage.setItem('pi_user_cache', JSON.stringify(auth.user));
      localStorage.setItem('pi_auth_state', 'true');
      
      setUser(auth.user);
      setIsAuthenticated(true);
      
      await syncUserWithDatabase(auth.user);
      
      toast.success(`Welcome, ${auth.user.username}!`);
      return auth.user;
    } catch (err) {
      console.error("Auth failed:", err);
      // في حال الفشل الحقيقي فقط نمسح الكاش
      logout();
      toast.error("Failed to login with Pi.");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('pi_user_cache');
    localStorage.removeItem('pi_auth_state');
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const canFreeSpin = useCallback(() => isAuthenticated, [isAuthenticated]);

  const getNextFreeSpinTime = useCallback(() => {
    return isAuthenticated ? "Available" : "Login Required";
  }, [isAuthenticated]);

  const refreshProfile = useCallback(async () => {
    if (user) await syncUserWithDatabase(user);
  }, [user]);

  // 3. التحقق من جاهزية الـ SDK دون تصفير الحالة
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
        if (checkPi()) clearInterval(timer);
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
