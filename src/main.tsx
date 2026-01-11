import { createRoot } from "react-dom/client";
import { useState, useEffect, useCallback } from "react";
import App from "./App.tsx";
import { SplashScreen } from "./components/SplashScreen.tsx";
import { usePiAuth } from "./hooks/usePiAuth.ts";
import "./index.css";

function Root() {
  const [showSplash, setShowSplash] = useState(true);
  const { isLoading: isAuthLoading, authenticate } = usePiAuth();

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  // نعمل انتظار لبيانات Pi قبل إزالة الـ Splash
  useEffect(() => {
    const init = async () => {
      // لو عايز تعمل login تلقائي أو check للـ localStorage
      await authenticate().catch(() => null); 
      setShowSplash(false);
    };
    init();
  }, [authenticate]);

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      {!showSplash && <App />}
    </>
  );
}

createRoot(document.getElementById("root")!).render(<Root />);
