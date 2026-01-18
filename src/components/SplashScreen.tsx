import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '@/assets/spin4pi-logo.png';

interface SplashScreenProps {
  onComplete: () => void;
  minDuration?: number;
}

export function SplashScreen({ onComplete, minDuration = 3000 }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / minDuration) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsVisible(false);
          // تأخير بسيط لإعطاء فرصة لأنميشن الخروج (Exit Animation)
          setTimeout(onComplete, 500);
        }, 500);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [minDuration, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-[#050505]"
        >
          {/* خلفية فخمة خافتة (Ambient Glow) */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(251,191,36,0.05)_0%,_transparent_70%)]" />
          
          <div className="relative flex flex-col items-center">
            {/* Logo مع تأثير نبض ذهبي */}
            <div className="relative mb-8">
              <motion.div
                className="absolute inset-0 bg-gold/20 blur-[50px] rounded-full"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.img
                src={logo}
                alt="Spin4Pi Empire"
                className="w-48 h-48 md:w-56 md:h-56 relative z-10 drop-shadow-[0_0_30px_rgba(251,191,36,0.3)]"
                initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>

            {/* العنوان الإمبراطوري */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-center"
            >
              <h1 
                className="text-5xl md:text-6xl font-black tracking-[0.2em] uppercase italic text-transparent bg-clip-text bg-gradient-to-b from-gold via-amber-500 to-amber-800"
                style={{ fontFamily: 'Cinzel, serif' }}
              >
                Spin4Pi
              </h1>
              <div className="flex items-center justify-center gap-4 mt-2">
                <div className="h-[1px] w-12 bg-gold/30" />
                <p className="text-[10px] font-black text-gold/60 uppercase tracking-[0.4em]">
                  The Imperial Games
                </p>
                <div className="h-[1px] w-12 bg-gold/30" />
              </div>
            </motion.div>

            {/* شريط التحميل (The Golden Path) */}
            <div className="mt-12 flex flex-col items-center gap-4">
              <div className="w-64 h-[2px] bg-white/5 rounded-full overflow-hidden relative border border-white/5">
                <motion.div
                  className="absolute h-full bg-gradient-to-r from-amber-900 via-gold to-amber-900 shadow-[0_0_15px_rgba(251,191,36,0.5)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
              
              <motion.div 
                className="flex items-center gap-2"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">
                  {progress < 100 ? "Syncing with Pi Mainnet..." : "Access Granted"}
                </span>
              </motion.div>
            </div>
          </div>

          {/* تذييل الشاشة */}
          <div className="absolute bottom-10">
            <p className="text-[8px] font-bold text-white/10 uppercase tracking-[0.3em]">
              Authorized Imperial Connection
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
