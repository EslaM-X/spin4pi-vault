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
          {/* 1. تأثير التعتيم الجانبي (Imperial Vignette) */}
          <div className="absolute inset-0 z-10 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,1)]" />

          {/* 2. الشبكة الذهبية ثلاثية الأبعاد (Imperial 3D Grid) */}
          <div className="absolute inset-0 opacity-10" 
               style={{
                 backgroundImage: `linear-gradient(rgba(212, 175, 55, 0.2) 1px, transparent 1px), 
                                   linear-gradient(90deg, rgba(212, 175, 55, 0.2) 1px, transparent 1px)`,
                 backgroundSize: '40px 40px',
                 perspective: '600px',
                 transform: 'rotateX(60deg) scale(2)',
                 transformOrigin: 'center bottom',
                 maskImage: 'linear-gradient(to bottom, transparent, black 70%)'
               }} 
          />

          <style>{`
            @keyframes orbit-gold {
              from { transform: rotate(0deg) translateX(150px) rotate(0deg); }
              to { transform: rotate(360deg) translateX(150px) rotate(-360deg); }
            }
            @keyframes pulse-ring-gold {
              0% { transform: scale(0.7); opacity: 0.4; border-color: #fbbf24; }
              50% { transform: scale(1.1); opacity: 0.1; border-color: #d4af37; }
              100% { transform: scale(0.7); opacity: 0.4; border-color: #fbbf24; }
            }
            @keyframes gold-flow {
              0% { transform: translateY(-100%); opacity: 0; }
              50% { opacity: 0.3; }
              100% { transform: translateY(1000%); opacity: 0; }
            }
          `}</style>

          {/* 3. حلقات الطاقة الذهبية (Imperial Power Rings) */}
          <div className="absolute z-0 w-[350px] h-[350px] border border-gold/20 rounded-full" style={{ animation: 'pulse-ring-gold 4s infinite ease-in-out' }} />
          <div className="absolute z-0 w-[450px] h-[450px] border border-amber-600/10 rounded-full" style={{ animation: 'pulse-ring-gold 6s infinite ease-in-out reverse' }} />

          <div className="relative z-20 flex flex-col items-center">
            {/* 4. الشعار مع توهج ذهبي طبقي */}
            <div className="relative">
                <motion.div 
                  className="absolute inset-0 bg-gold/20 blur-[80px] rounded-full"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ repeat: Infinity, duration: 4 }}
                />
                <motion.img
                  src={logoIcon}
                  className="relative w-40 h-40 md:w-48 md:h-48 z-30 drop-shadow-[0_0_35px_rgba(212,175,55,0.4)]"
                  animate={{ 
                    y: [0, -15, 0],
                    filter: ['drop-shadow(0 0 20px rgba(212,175,55,0.3))', 'drop-shadow(0 0 40px rgba(212,175,55,0.6))', 'drop-shadow(0 0 20px rgba(212,175,55,0.3))']
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 4, 
                    ease: "easeInOut" 
                  }}
                />
            </div>

            {/* 5. نصوص الإمبراطورية */}
            <motion.div 
              className="mt-12 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="h-[1px] w-10 bg-gradient-to-r from-transparent to-gold" />
                <h1 className="text-gold font-black tracking-[0.6em] uppercase text-[10px] md:text-xs italic" style={{ fontFamily: 'Cinzel, serif' }}>
                   Imperial Protocol <span className="text-white/50">Active</span>
                </h1>
                <div className="h-[1px] w-10 bg-gradient-to-l from-transparent to-gold" />
              </div>

              <h2 className="text-white text-3xl md:text-4xl font-black mb-6 tracking-widest italic" style={{ fontFamily: 'Cinzel, serif' }}>
                SPIN4PI <span className="text-gold">EMPIRE</span>
              </h2>
              
              {/* شريط التحميل الذهبي (The Golden Bar) */}
              <div className="w-72 h-[3px] bg-white/5 rounded-full overflow-hidden relative border border-white/5 p-[1px]">
                <motion.div 
                  className="absolute h-full bg-gradient-to-r from-transparent via-gold to-transparent"
                  animate={{ left: ['-100%', '100%'] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                  style={{ width: '100%' }}
                />
              </div>

              <div className="mt-5 flex flex-col gap-2">
                <p className="text-[10px] text-white/30 font-black tracking-[0.3em] uppercase italic">
                  Synchronizing Vault Assets...
                </p>
                <div className="flex justify-center gap-1.5">
                    {[1,2,3,4,5].map(i => (
                        <motion.div 
                            key={i}
                            className="w-1 h-1 bg-gold rounded-full"
                            animate={{ 
                              scale: [1, 1.5, 1],
                              opacity: [0.2, 1, 0.2] 
                            }}
                            transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.15 }}
                        />
                    ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* 6. جزيئات "ذهب" متساقطة (Gold Dust Particles) */}
          {[...Array(15)].map((_, i) => (
              <div 
                key={i}
                className="absolute w-[1px] h-[60px] bg-gradient-to-b from-gold/0 via-gold/40 to-transparent"
                style={{
                    left: `${Math.random() * 100}%`,
                    top: `-20%`,
                    animation: `gold-flow ${3 + Math.random() * 5}s linear infinite`,
                    animationDelay: `${Math.random() * 5}s`
                }}
              />
          ))}

          {/* Footer Info */}
          <div className="absolute bottom-10 left-0 right-0 text-center z-20">
             <p className="text-[8px] font-black text-white/10 uppercase tracking-[0.5em]">
               Powered by Pi Mainnet Bridge Technology
             </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalLoading;
