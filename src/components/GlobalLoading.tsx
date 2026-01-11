import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GlobalLoadingProps {
  isVisible: boolean;
  onComplete?: () => void;
}

const GlobalLoading = ({ isVisible, onComplete }: GlobalLoadingProps) => {
  const [particles, setParticles] = useState<{ x: number; y: number; size: number; delay: number }[]>([]);
  const [textParticles, setTextParticles] = useState<{ x: number; y: number; opacity: number; char: string }[]>([]);

  // توليد Particles
  useEffect(() => {
    const newParticles: { x: number; y: number; size: number; delay: number }[] = [];
    for (let i = 0; i < 50; i++) {
      newParticles.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 5 + 2,
        delay: Math.random() * 3,
      });
    }
    setParticles(newParticles);

    // توليد Text Particles صغيرة
    const chars = ['✨', '💫', '🌟', '⚡'];
    const newTextParticles: { x: number; y: number; opacity: number; char: string }[] = [];
    for (let i = 0; i < 30; i++) {
      newTextParticles.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        opacity: Math.random(),
        char: chars[Math.floor(Math.random() * chars.length)],
      });
    }
    setTextParticles(newTextParticles);
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
          {/* Particles العادية */}
          {particles.map((p, idx) => (
            <motion.div
              key={idx}
              className="absolute rounded-full bg-gradient-to-r from-pink-500 to-yellow-400 shadow-xl"
              style={{ width: p.size, height: p.size, top: `${p.y}%`, left: `${p.x}%` }}
              animate={{ y: [`${p.y}%`, `${p.y + 5}%`, `${p.y}%`] }}
              transition={{ repeat: Infinity, duration: 3 + Math.random() * 2, ease: 'easeInOut', delay: p.delay }}
            />
          ))}

          {/* Text Particles */}
          {textParticles.map((tp, idx) => (
            <motion.span
              key={idx}
              className="absolute text-lg md:text-xl"
              style={{ top: `${tp.y}%`, left: `${tp.x}%`, opacity: tp.opacity }}
              animate={{ y: [`${tp.y}%`, `${tp.y - 10}%`, `${tp.y}%`], opacity: [tp.opacity, 0, tp.opacity] }}
              transition={{ repeat: Infinity, duration: 2 + Math.random() * 2, ease: 'easeInOut' }}
            >
              {tp.char}
            </motion.span>
          ))}

          {/* Spinner */}
          <motion.div
            className="w-32 h-32 border-8 border-t-yellow-400 border-b-pink-500 border-l-purple-500 border-r-indigo-500 rounded-full shadow-2xl"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          />

          {/* Text */}
          <motion.h1
            className="mt-8 text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-400"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            Loading...
          </motion.h1>

          <motion.p
            className="mt-2 text-lg text-gray-300 animate-pulse"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
          >
            Please wait, we're preparing something amazing!
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalLoading;
