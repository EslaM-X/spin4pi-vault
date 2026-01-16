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
      // طلبScopes الأساسية من باي: الاسم واسم المستخدم
      const scopes = ["username", "payments"];
      
      // استدعاء نافذة الموافقة الرسمية من متصفح باي
      const auth = await window.Pi.authenticate(scopes, (payment) => {
        console.log("Oncomplete payment callback", payment);
      });

      console.log("Authenticated successfully:", auth.user.username);
      
      // حفظ بيانات المستخدم في حالة الـ Hook
      setUser(auth.user);
      setIsAuthenticated(true);
      
      // مزامنة المستخدم مع قاعدة البيانات (Supabase)
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

  // 2. مزامنة بيانات المستخدم مع السيرفر (Supabase)
  const syncUserWithDatabase = async (piUser: PiUser) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .upsert({
          pi_username: piUser.username,
          wallet_address: piUser.uid, // استخدام الـ UID كعنوان للمحفظة مؤقتاً
          last_login: new Date().toISOString(),
        }, { onConflict: 'pi_username' })
        .select()
        .single();

      if (error) throw error;
      console.log("Profile synced with Supabase:", data);
    } catch (err) {
      console.error("Database sync error:", err);
    }
  };

  // 3. وظيفة تسجيل الخروج
  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("pi_username");
  }, []);

  // 4. وظائف إضافية خاصة باللعبة (اللفات المجانية)
  const canFreeSpin = useCallback(() => {
    // يمكن إضافة منطق هنا للتحقق من الوقت المتبقي للف المجاني
    return true; 
  }, []);

  const getNextFreeSpinTime = useCallback(() => {
    return "Available";
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await syncUserWithDatabase(user);
    }
  }, [user]);

  // تهيئة الـ SDK عند تحميل الـ Hook لأول مرة
  useEffect(() => {
    if (window.Pi) {
      setIsInitialized(true);
      setIsLoading(false);
    } else {
      // محاولة التحقق كل ثانية لو الـ SDK اتأخر في التحميل
      const timer = setTimeout(() => {
        if (window.Pi) setIsInitialized(true);
        setIsLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
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
