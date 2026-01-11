import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '@/assets/spin4pi-logo.png';

interface SplashScreenProps {
  onComplete: () => void;
  minDuration?: number;
}

export function SplashScreen({ onComplete, minDuration = 2500 }: SplashScreenProps) {
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
          setTimeout(onComplete, 500);
        }, 300);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [minDuration, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
        >
          {/* Animated background */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Stars background */}
            <div className="absolute inset-0 bg-stars opacity-50" />
            
            {/* Animated circles */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-primary/20"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.5, opacity: [0, 0.5, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
            />
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-secondary/30"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.5, opacity: [0, 0.5, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
            />
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full border border-primary/40"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.5, opacity: [0, 0.5, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut", delay: 1 }}
            />
            
            {/* Gradient orbs */}
            <motion.div
              className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/30 rounded-full blur-3xl"
              animate={{ 
                x: [0, 50, 0], 
                y: [0, -30, 0],
                scale: [1, 1.2, 1]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-secondary/20 rounded-full blur-3xl"
              animate={{ 
                x: [0, -40, 0], 
                y: [0, 40, 0],
                scale: [1, 1.3, 1]
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Logo with glow effect */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.8, 
                ease: [0.16, 1, 0.3, 1],
                delay: 0.2 
              }}
              className="relative mb-8"
            >
              {/* Glow behind logo */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary/50 to-secondary/50 rounded-full blur-3xl"
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              
              <motion.img
                src={logo}
                alt="Spin4Pi"
                className="relative w-40 h-40 object-contain drop-shadow-2xl"
                animate={{ 
                  rotateY: [0, 360],
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "linear"
                }}
              />
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="font-display text-4xl md:text-5xl font-bold text-gradient-gold mb-2"
            >
              Spin4Pi
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="text-muted-foreground text-lg mb-8"
            >
              Win Real Pi • Play to Earn
            </motion.p>

            {/* Pi Network Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9, duration: 0.4 }}
              className="flex items-center gap-2 px-4 py-2 bg-card/50 backdrop-blur-sm rounded-full border border-border mb-8"
            >
              <span className="text-2xl">π</span>
              <span className="text-sm text-muted-foreground">Powered by Pi Network</span>
            </motion.div>

            {/* Progress bar */}
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 200 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="relative h-1.5 bg-muted rounded-full overflow-hidden"
            >
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-secondary rounded-full"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: [-200, 200] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>

            {/* Loading text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              className="mt-4 text-xs text-muted-foreground"
            >
              {progress < 100 ? 'Loading game...' : 'Ready!'}
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
