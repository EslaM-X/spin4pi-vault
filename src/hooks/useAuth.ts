import { useState, useEffect } from "react";

// Type المستخدم
interface User {
  username: string;
  piAddress?: string;
}

// نتيجة الهُوية
interface AuthResult {
  user?: User;
  isAuthenticated: boolean;
  isLoading: boolean;
  authenticate: () => Promise<User | null>;
  logout: () => void;
  refreshProfile: () => void;
  canFreeSpin: () => boolean;
  getNextFreeSpinTime: () => string;
}

export function useAuth(): AuthResult {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // عند تحميل التطبيق
  useEffect(() => {
    const savedUsername = localStorage.getItem("pi_username");
    if (savedUsername) {
      setUser({ username: savedUsername });
      setIsAuthenticated(true);
    } else {
      // لو مفيش بيانات محفوظة ممكن نسأل Pi SDK مباشرة
      checkPiAuth();
    }
    setIsLoading(false);
  }, []);

  // دالة تسجيل الدخول باستخدام Pi SDK
  const authenticate = async (): Promise<User | null> => {
    setIsLoading(true);
    try {
      // مثال على استخدام Pi SDK: 
      // const piUser = await PiSDK.login(); 
      // return { username: piUser.username, piAddress: piUser.address }

      // مؤقت لحين ربطه بـ Pi SDK
      const piUser = { username: "DemoUser", piAddress: "PiAddress123" };
      setUser(piUser);
      setIsAuthenticated(true);
      localStorage.setItem("pi_username", piUser.username);
      return piUser;
    } catch (err) {
      console.error("Pi Auth failed", err);
      setIsAuthenticated(false);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // دالة التحقق عند بداية التحميل
  const checkPiAuth = async () => {
    // مثال: لو Pi SDK يوفر session
    // const session = await PiSDK.getSession();
    // if(session) { ... }
  };

  const logout = () => {
    setUser(undefined);
    setIsAuthenticated(false);
    localStorage.removeItem("pi_username");
    // لو Pi SDK فيه logout
    // PiSDK.logout();
  };

  const refreshProfile = () => {
    // ممكن تحدث بيانات المستخدم من Pi SDK
    // مثال: const updated = await PiSDK.getProfile(user?.username);
  };

  const canFreeSpin = () => true; // مؤقت، بعدين نربطه بـ wallet و cooldown
  const getNextFreeSpinTime = () => "Available"; // مؤقت، بعدين نربطه بـ wallet و cooldown

  return { user, isAuthenticated, isLoading, authenticate, logout, refreshProfile, canFreeSpin, getNextFreeSpinTime };
}
