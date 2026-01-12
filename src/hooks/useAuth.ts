import { useState, useEffect } from "react";

interface AuthResult {
  user?: { username: string };
  isAuthenticated: boolean;
  isLoading: boolean;
  authenticate: () => Promise<{ username: string } | null>;
  logout: () => void;
  refreshProfile: () => void;
  canFreeSpin: () => boolean;
  getNextFreeSpinTime: () => string;
}

export function useAuth(): AuthResult {
  const [user, setUser] = useState<{ username: string } | undefined>(undefined);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // ممكن تتحقق من الـ localStorage أو الـ Pi SDK هنا مستقبلاً
    const savedUsername = localStorage.getItem("pi_username");
    if (savedUsername) {
      setUser({ username: savedUsername });
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const authenticate = async () => {
    setIsLoading(true);
    // placeholder مؤقت للـ login
    const fakeUser = { username: "DemoUser" };
    setUser(fakeUser);
    setIsAuthenticated(true);
    setIsLoading(false);
    return fakeUser;
  };

  const logout = () => {
    setUser(undefined);
    setIsAuthenticated(false);
    localStorage.removeItem("pi_username");
  };

  const refreshProfile = () => {
    // placeholder لتحديث البروفايل
  };

  const canFreeSpin = () => true; // مؤقت
  const getNextFreeSpinTime = () => "Available"; // مؤقت

  return { user, isAuthenticated, isLoading, authenticate, logout, refreshProfile, canFreeSpin, getNextFreeSpinTime };
}
