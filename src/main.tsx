import { createRoot } from "react-dom/client";
import { useState, useEffect, useCallback } from "react";
import App from "./App.tsx";
import { SplashScreen } from "./components/SplashScreen.tsx";
import { usePiAuth } from "./hooks/usePiAuth.ts";
import "./index.css";

function Root() {
  const [showSplash, setShowSplash] = useState(true);
  const { isInitialized, isLoading, authenticate, user } = usePiAuth();

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  // انتظار الـ Pi SDK initialization + authentication
  useEffect(() => {
    const init = async () => {
      // لو الـ SDK جاهز بالفعل اعمل authentication
      if (!isInitialized) return;

      if (!user) {
        await authenticate().catch(() => null);
      }

      // بعد ما يخلص كل حاجة، شيل الـ Splash
      setShowSplash(false);
    };
    init();
  }, [isInitialized, authenticate, user]);

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      {!showSplash && <App />}
    </>
  );
}

createRoot(document.getElementById("root")!).render(<Root />);
