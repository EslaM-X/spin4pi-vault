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
          className="fixed inset-0 z-[999999] bg-[#050507] flex flex-col items-center justify-center overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onAnimationComplete={() => {
            if (!isVisible && onComplete) onComplete();
          }}
        >
          {/* خلفية الشبكة التقنية (Grid Background) */}
          <div className="absolute inset-0 opacity-10" 
               style={{
                 backgroundImage: `linear-gradient(rgba(168, 85, 247, 0.2) 1px, transparent 1px), 
                                   linear-gradient(90deg, rgba(168, 85, 247, 0.2) 1px, transparent 1px)`,
                 backgroundSize: '40px 40px',
                 maskImage: 'radial-gradient(ellipse at center, black, transparent 80%)'
               }} 
          />

          <style>{`
            @keyframes scan-line {
              0% { top: -10%; }
              100% { top: 110%; }
            }
          `}</style>

          {/* خط المسح الضوئي (Security Scan Line) */}
          <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent shadow-[0_0_15px_#a855f7] z-10"
               style={{ animation: 'scan-line 3s linear infinite' }} 
          />

          <div className="relative z-20 flex flex-col items-center">
            {/* الشعار مع تأثير النبض العائم */}
            <motion.img
              src={logoIcon}
              className="w-32 h-32 md:w-40 md:h-40 mb-8"
              animate={{ 
                y: [0, -15, 0],
                filter: [
                  'drop-shadow(0 0 20px rgba(168, 85, 247, 0.4))',
                  'drop-shadow(0 0 40px rgba(168, 85, 247, 0.7))',
                  'drop-shadow(0 0 20px rgba(168, 85, 247, 0.4))'
                ]
              }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            />

            {/* نصوص تقنية احترافية */}
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-white font-black tracking-[0.3em] uppercase text-sm md:text-lg mb-2">
                Initializing <span className="text-purple-500">Vault</span> System
              </h1>
              
              {/* شريط التحميل التقني (Minimalist Progress) */}
              <div className="w-48 h-[3px] bg-white/5 rounded-full overflow-hidden relative border border-white/10">
                <motion.div 
                  className="absolute h-full bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600"
                  animate={{ left: ['-100%', '100%'] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  style={{ width: '50%' }}
                />
              </div>

              <p className="mt-4 text-[10px] text-white/40 font-mono tracking-widest uppercase animate-pulse">
                Establishing Secure PI Connection...
              </p>
            </motion.div>
          </div>

          {/* توهج سفلي فخم */}
          <div className="absolute bottom-[-150px] w-[500px] h-[300px] bg-purple-900/20 blur-[120px] rounded-full pointer-events-none" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalLoading;
