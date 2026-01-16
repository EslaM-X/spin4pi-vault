import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// تعريف واجهة بيانات المستخدم القادمة من Pi SDK
interface PiUser {
  uid: string;
  username: string;
}

export const usePiAuth = () => {
  const [user, setUser] = useState<PiUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // 1. وظيفة تسجيل الدخول والمصادقة
  const authenticate = useCallback(async () => {
    if (!window.Pi) {
      const errorMsg = "Pi SDK not found. Please open in Pi Browser.";
      console.error(errorMsg);
      toast.error(errorMsg);
      return null;
    }

    setIsLoading(true);
    try {
      const scopes = ["username", "payments"];
      
      const auth = await window.Pi.authenticate(scopes, (payment) => {
        console.log("Oncomplete payment callback", payment);
      });

      console.log("Authenticated successfully:", auth.user.username);
      
      setUser(auth.user);
      setIsAuthenticated(true);
      
      // مزامنة صامتة مع قاعدة البيانات
      await syncUserWithDatabase(auth.user);

      return auth.user;
    } catch (err) {
      console.error("Authentication failed:", err);
      toast.error("Failed to authenticate with Pi Network");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 2. مزامنة بيانات المستخدم (تم تعديلها لتكون صامتة وبدون أخطاء مزعجة)
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

      if (error) {
        // تسجيل الخطأ في المطورين فقط وليس للمستخدم
        console.warn("Database sync notice (Non-critical):", error.message);
        return;
      }
      console.log("Profile synced successfully");
    } catch (err) {
      console.error("Silent sync catch:", err);
    }
  };

  // 3. وظيفة تسجيل الخروج
  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // 4. وظائف إضافية خاصة باللعبة
  const canFreeSpin = useCallback(() => {
    return true; 
  }, []);

  const getNextFreeSpinTime = useCallback(() => {
    return "Available";
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await syncUserWithDatabase(user);
    }
  }, [user, syncUserWithDatabase]);

  // تهيئة الـ SDK
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
      
      const timeout = setTimeout(() => {
        clearInterval(timer);
        setIsLoading(false);
      }, 5000);

      return () => {
        clearInterval(timer);
        clearTimeout(timeout);
      };
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
