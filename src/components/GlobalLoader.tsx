import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GlobalLoadingProps {
  isVisible: boolean;
  onComplete?: () => void;
}

const GlobalLoading = ({ isVisible, onComplete }: GlobalLoadingProps) => {
  const [particles, setParticles] = useState<{ x: number; y: number; size: number; color: string }[]>([]);

  useEffect(() => {
    const colors = ['#F5D300', '#00BFA6', '#7B1FA2', '#FF4081']; // ألوان مستوحاة من Pi Network و Spin4Pi
    const newParticles: { x: number; y: number; size: number; color: string }[] = [];
    for (let i = 0; i < 50; i++) {
      newParticles.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    setParticles(newParticles);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 bg-gradient-to-b from-purple-900 via-indigo-900 to-black flex flex-col items-center justify-center overflow-hidden"
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
              className="absolute rounded-full"
              style={{ width: p.size, height: p.size, top: `${p.y}%`, left: `${p.x}%`, backgroundColor: p.color }}
              animate={{ y: [`${p.y}%`, `${p.y + 5}%`, `${p.y}%`] }}
              transition={{ repeat: Infinity, duration: 4 + Math.random() * 3, ease: 'easeInOut' }}
            />
          ))}

          {/* Spin4Pi Logo Spinner */}
          <motion.div
            className="w-32 h-32 rounded-full flex items-center justify-center text-black text-4xl font-black shadow-lg shadow-yellow-400/50 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-400"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          >
            π
          </motion.div>

          {/* Text */}
          <motion.h1
            className="mt-6 text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-400"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            Loading Spin4Pi...
          </motion.h1>

          <motion.p
            className="mt-2 text-lg text-gray-300 animate-pulse"
          >
            Please wait, magic is spinning in the Pi Network!
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalLoading;
