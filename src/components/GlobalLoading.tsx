import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logoIcon from "@/assets/spin4pi-logo.png";

interface GlobalLoadingProps {
  isVisible: boolean;
  onComplete?: () => void;
}

const GlobalLoading = ({ isVisible, onComplete }: GlobalLoadingProps) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[999999] bg-[#020203] flex flex-col items-center justify-center overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
          onAnimationComplete={() => {
            if (!isVisible && onComplete) onComplete();
          }}
        >
          {/* 1. تأثير التعتيم الجانبي الفخم (Vignette) */}
          <div className="absolute inset-0 z-10 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,1)]" />

          {/* 2. الشبكة المتحركة بعمق (Animated 3D Grid) */}
          <div className="absolute inset-0 opacity-20" 
               style={{
                 backgroundImage: `linear-gradient(rgba(168, 85, 247, 0.3) 1px, transparent 1px), 
                                   linear-gradient(90deg, rgba(168, 85, 247, 0.3) 1px, transparent 1px)`,
                 backgroundSize: '50px 50px',
                 perspective: '500px',
                 transform: 'rotateX(45deg) scale(1.5)',
                 transformOrigin: 'center bottom',
                 maskImage: 'linear-gradient(to bottom, transparent, black 60%)'
               }} 
          />

          <style>{`
            @keyframes orbit {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            @keyframes pulse-ring {
              0% { transform: scale(0.8); opacity: 0.5; }
              50% { transform: scale(1.2); opacity: 0.2; }
              100% { transform: scale(0.8); opacity: 0.5; }
            }
            @keyframes data-flow {
              0% { transform: translateY(0%); opacity: 0; }
              50% { opacity: 0.5; }
              100% { transform: translateY(100%); opacity: 0; }
            }
          `}</style>

          {/* 3. الحلقات الضوئية خلف الشعار (Power Rings) */}
          <div className="absolute z-0 w-[300px] h-[300px] border border-purple-500/20 rounded-full" style={{ animation: 'pulse-ring 4s infinite ease-in-out' }} />
          <div className="absolute z-0 w-[400px] h-[400px] border border-pink-500/10 rounded-full" style={{ animation: 'pulse-ring 6s infinite ease-in-out reverse' }} />

          <div className="relative z-20 flex flex-col items-center">
            {/* 4. الشعار مع توهج طبقي (Layered Glow) */}
            <div className="relative">
                <motion.div 
                  className="absolute inset-0 bg-purple-600/30 blur-[60px] rounded-full"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                />
                <motion.img
                  src={logoIcon}
                  className="relative w-36 h-36 md:w-44 md:h-44 z-30"
                  animate={{ 
                    y: [0, -20, 0],
                    rotateY: [0, 10, -10, 0]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 5, 
                    ease: "easeInOut" 
                  }}
                  style={{ filter: 'drop-shadow(0 0 30px rgba(168, 85, 247, 0.6))' }}
                />
            </div>

            {/* 5. نصوص بتأثير الطباعة الرقمية */}
            <motion.div 
              className="mt-12 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-purple-500" />
                <h1 className="text-white font-black tracking-[0.5em] uppercase text-xs md:text-sm">
                   System <span className="text-purple-500">Authorized</span>
                </h1>
                <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-purple-500" />
              </div>

              <h2 className="text-white/90 text-2xl md:text-3xl font-black mb-6 tracking-tighter">
                SPIN4PI <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">VAULT</span>
              </h2>
              
              {/* شريط التحميل "النيون" */}
              <div className="w-64 h-[2px] bg-white/5 rounded-full overflow-hidden relative border border-white/5">
                <motion.div 
                  className="absolute h-full bg-gradient-to-r from-transparent via-purple-400 to-transparent"
                  animate={{ left: ['-100%', '100%'] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  style={{ width: '100%' }}
                />
              </div>

              <div className="mt-4 flex flex-col gap-1">
                <p className="text-[9px] text-purple-400/60 font-mono tracking-[0.2em] uppercase">
                  Decrypting Assets...
                </p>
                <div className="flex justify-center gap-1">
                    {[1,2,3].map(i => (
                        <motion.div 
                            key={i}
                            className="w-1 h-1 bg-purple-500 rounded-full"
                            animate={{ opacity: [0.2, 1, 0.2] }}
                            transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                        />
                    ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* 6. جزيئات ضوئية متساقطة (Data Particles) */}
          {[...Array(10)].map((_, i) => (
              <div 
                key={i}
                className="absolute w-[1px] h-[50px] bg-gradient-to-b from-purple-500/0 via-purple-500/50 to-transparent"
                style={{
                    left: `${Math.random() * 100}%`,
                    top: `-10%`,
                    animation: `data-flow ${2 + Math.random() * 4}s linear infinite`,
                    animationDelay: `${Math.random() * 5}s`
                }}
              />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalLoading;
