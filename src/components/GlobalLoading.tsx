import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface GlobalLoadingProps {
  isVisible: boolean;
  onComplete?: () => void;
}

const GlobalLoading = ({ isVisible, onComplete }: GlobalLoadingProps) => {
  const [particles, setParticles] = useState<{ x: number; y: number; size: number; delay: number }[]>([]);

  useEffect(() => {
    const newParticles: { x: number; y: number; size: number; delay: number }[] = [];
    for (let i = 0; i < 50; i++) {
      newParticles.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 6 + 2,
        delay: Math.random() * 2,
      });
    }
    setParticles(newParticles);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 bg-gradient-to-b from-purple-950 via-indigo-900 to-black flex flex-col items-center justify-center overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onAnimationComplete={() => {
            if (!isVisible && onComplete) onComplete();
          }}
        >
          {/* Particles */}
          {particles.map((p, idx) => (
            <motion.div
              key={idx}
              className="absolute rounded-full bg-gradient-to-r from-pink-500 via-yellow-400 to-purple-400 opacity-70"
              style={{ width: p.size, height: p.size, top: `${p.y}%`, left: `${p.x}%` }}
              animate={{
                y: [`${p.y}%`, `${p.y + 8}%`, `${p.y}%`],
                x: [`${p.x}%`, `${p.x + 5}%`, `${p.x}%`],
              }}
              transition={{ repeat: Infinity, duration: 3 + Math.random() * 2, ease: "easeInOut", delay: p.delay }}
            />
          ))}

          {/* Spinner */}
          <motion.div
            className="w-32 h-32 border-8 border-t-yellow-400 border-b-pink-500 border-l-purple-500 border-r-indigo-500 rounded-full shadow-xl"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          />

          {/* Text */}
          <motion.h1
            className="mt-10 text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-400 drop-shadow-lg"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            Loading...
          </motion.h1>

          <motion.p
            className="mt-3 text-lg text-gray-300 animate-pulse"
          >
            Preparing the magic for you!
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalLoading;
