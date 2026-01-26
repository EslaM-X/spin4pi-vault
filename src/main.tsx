import { createRoot } from "react-dom/client";
import { useState, useEffect } from "react";
import App from "./App.tsx";
import { SplashScreen } from "./components/SplashScreen.tsx";
import "./index.css";

function Root() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const initPi = async () => {
      // مؤقت أمان: لو الـ SDK علق، افتح اللعبة بعد 5 ثوانٍ تلقائياً
      const safetyTimer = setTimeout(() => {
        setShowSplash(false);
      }, 5000);

      try {
        if (window.Pi) {
          await window.Pi.init({ version: "2.0", sandbox: false });
          console.log("Pi SDK Initialized");
        }
      } catch (err) {
        console.error("Pi Init Error:", err);
      } finally {
        clearTimeout(safetyTimer);
        setShowSplash(false);
      }
    };

    initPi();
  }, []);

  return (
    <>
      {showSplash ? <SplashScreen onComplete={() => setShowSplash(false)} /> : <App />}
    </>
  );
}

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<Root />);
}
