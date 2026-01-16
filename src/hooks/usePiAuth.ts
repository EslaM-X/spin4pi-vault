import { createRoot } from "react-dom/client";
import { useState, useEffect, useCallback } from "react";
import App from "./App.tsx";
import { SplashScreen } from "./components/SplashScreen.tsx";
import { usePiAuth } from "./hooks/usePiAuth.ts";
import "./index.css";

function Root() {
  const [showSplash, setShowSplash] = useState(true);
  const { isInitialized, authenticate, user } = usePiAuth();

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  // 1. تهيئة الـ SDK فور تشغيل التطبيق
  useEffect(() => {
    const initPi = async () => {
      try {
        // التأكد من أن الـ SDK متاح عالمياً من ملف index.html
        if (window.Pi) {
          await window.Pi.init({ version: "2.0", sandbox: false });
          console.log("Pi SDK initialized successfully via main.tsx");
        }
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        // تأخير بسيط لضمان ظهور الـ Splash Screen بشكل جميل
        setTimeout(() => setShowSplash(false), 2000);
      }
    };
    initPi();
  }, []);

  // 2. محاولة التعرف على المستخدم المسجل سابقاً فقط
  useEffect(() => {
    if (isInitialized && !user) {
      const savedUser = localStorage.getItem("pi_username");
      if (savedUser) {
        // إذا كان هناك مستخدم سابق، نحاول استعادة جلسته بهدوء
        authenticate().catch(() => console.log("Silent auth failed"));
      }
    }
  }, [isInitialized, user, authenticate]);

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      {!showSplash && <App />}
    </>
  );
}

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<Root />);
}
