import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const GlobalLoading = () => {
  const [particles, setParticles] = useState<{ x: number; y: number; size: number }[]>([]);

  // توليد Particles عشوائية
  useEffect(() => {
    const newParticles: { x: number; y: number; size: number }[] = [];
    for (let i = 0; i < 40; i++) {
      newParticles.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
      });
    }
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-purple-900 via-indigo-900 to-black flex flex-col items-center justify-center overflow-hidden">
      {/* Particles */}
      {particles.map((p, idx) => (
        <motion.div
          key={idx}
          className="absolute bg-gradient-to-r from-pink-500 to-yellow-400 rounded-full"
          style={{ width: p.size, height: p.size, top: `${p.y}%`, left: `${p.x}%` }}
          animate={{ y: [`${p.y}%`, `${p.y + 5}%`, `${p.y}%`] }}
          transition={{ repeat: Infinity, duration: 4 + Math.random() * 3, ease: 'easeInOut' }}
        />
      ))}

      {/* Spinner */}
      <motion.div
        className="w-28 h-28 border-8 border-t-yellow-400 border-b-pink-500 border-l-purple-500 border-r-indigo-500 rounded-full"
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

      <motion.p className="mt-2 text-lg text-gray-300 animate-pulse">
        Please wait, we're preparing something amazing!
      </motion.p>
    </div>
  );
};

export default GlobalLoading;
