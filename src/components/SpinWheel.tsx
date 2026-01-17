import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { Trophy, Ban, Sparkles, Gift, Zap, Crown, Gem, Coins } from "lucide-react";

interface SpinWheelProps {
  onSpinComplete: (result: string) => void;
  isSpinning: boolean;
  setIsSpinning: (spinning: boolean) => void;
  targetResult?: string | null;
}

const SEGMENTS = [
  { label: "0.01 π", color: "#9B5DE5", prize: "0.01_PI", icon: <Coins size={24} />, index: 0 },
  { label: "LOSE", color: "#1A1528", prize: "LOSE", icon: <Ban size={24} />, index: 1 },
  { label: "FREE", color: "#F5C542", prize: "FREE_SPIN", icon: <Gift size={24} />, index: 2 },
  { label: "LOSE", color: "#1A1528", prize: "LOSE", icon: <Zap size={24} />, index: 3 },
  { label: "0.05 π", color: "#7D3CF0", prize: "0.05_PI", icon: <Sparkles size={24} />, index: 4 },
  { label: "LOSE", color: "#1A1528", prize: "LOSE", icon: <Ban size={24} />, index: 5 },
  { label: "NFT", color: "#3B82F6", prize: "NFT_ENTRY", icon: <Gem size={24} />, index: 6 },
  { label: "JACKPOT", color: "#FBBC05", prize: "JACKPOT_ENTRY", icon: <Crown size={24} />, index: 7 },
];

export function SpinWheel({ onSpinComplete, isSpinning, setIsSpinning, targetResult }: SpinWheelProps) {
  const [rotation, setRotation] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const { playSpinSound, playTickSound, playWinSound } = useSoundEffects();
  const tickIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // تحديث المسار للاسم الجديد
  const LOGO_URL = "/assets/pinetwork.jpg"; 

  useEffect(() => {
    if (isSpinning && targetResult && !isAnimating) {
      setIsAnimating(true);
      playSpinSound();
      
      const targetSegment = SEGMENTS.find(s => s.prize === targetResult);
      const targetIndex = targetSegment?.index ?? 0;
      const segmentAngle = 360 / SEGMENTS.length;
      const targetAngle = targetIndex * segmentAngle;
      
      const spins = 10 + Math.random() * 2; 
      const finalRotation = rotation + (spins * 360) + (360 - targetAngle);
      
      setRotation(finalRotation);
      
      let tickCount = 0;
      tickIntervalRef.current = setInterval(() => {
        tickCount++;
        playTickSound();
        if (tickCount >= 100) clearInterval(tickIntervalRef.current!);
      }, 45);
      
      setTimeout(() => {
        setIsAnimating(false);
        if (targetResult && !targetResult.includes('LOSE')) playWinSound();
        onSpinComplete(targetResult);
        if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
      }, 4500);
    }
  }, [isSpinning, targetResult, isAnimating, onSpinComplete, playSpinSound, playTickSound, playWinSound, rotation]);

  return (
    <div className="relative flex flex-col items-center py-10">
      <style>{`
        .royal-spin-shadow {
          box-shadow: 0 0 60px rgba(168, 85, 247, 0.4), inset 0 0 40px rgba(0,0,0,0.9);
        }
      `}</style>

      {/* الهالة الخلفية */}
      <div className={`absolute inset-0 -m-20 rounded-full bg-gradient-to-tr from-purple-600/20 via-yellow-500/10 to-purple-900/20 blur-[150px] transition-opacity duration-1000 ${
        isSpinning ? 'opacity-100' : 'opacity-40'
      }`} />
      
      <div className="relative">
        {/* المؤشر العلوي */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-40 scale-[1.5]">
          <motion.div 
             animate={isSpinning ? { y: [0, 8, 0], scale: [1, 1.1, 1] } : {}}
             transition={{ duration: 0.15, repeat: Infinity }}
             className="flex flex-col items-center"
          >
            <Crown className="text-[#fbbf24] w-10 h-10 drop-shadow-[0_0_15px_#fbbf24]" />
            <div className="w-1.5 h-5 bg-[#fbbf24] shadow-[0_0_20px_#fbbf24] -mt-1 rounded-full" />
          </motion.div>
        </div>
        
        {/* العجلة */}
        <motion.div
          className="relative w-80 h-80 md:w-[500px] md:h-[500px] rounded-full border-[14px] border-double border-[#fbbf24] royal-spin-shadow bg-[#050507] overflow-hidden"
          animate={{ rotate: rotation }}
          transition={{ duration: 4.5, ease: [0.2, 0, 0.1, 1] }}
        >
          {/* الطبقة المركزية الثابتة - باستخدام عنصر الصورة المباشر */}
          <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
             <div className="w-32 h-32 md:w-44 md:h-44 rounded-full bg-black border-4 border-[#fbbf24] shadow-[0_0_30px_rgba(251,191,36,0.6)] flex items-center justify-center overflow-hidden">
                <img 
                  src={`${LOGO_URL}?v=${Date.now()}`} 
                  alt="Pi" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if(parent) parent.innerHTML = '<span style="color:#fbbf24; font-size: 5rem; font-family: serif; filter: drop-shadow(0 0 10px #fbbf24)">π</span>';
                  }}
                />
             </div>
          </div>

          <svg viewBox="0 0 100 100" className="w-full h-full transform scale-[1.01]">
            {SEGMENTS.map((segment, index) => {
              const angle = 360 / SEGMENTS.length;
              const startAngle = index * angle - 90;
              const endAngle = startAngle + angle;
              const x1 = 50 + 50 * Math.cos((startAngle * Math.PI) / 180);
              const y1 = 50 + 50 * Math.sin((startAngle * Math.PI) / 180);
              const x2 = 50 + 50 * Math.cos((endAngle * Math.PI) / 180);
              const y2 = 50 + 50 * Math.sin((endAngle * Math.PI) / 180);
              
              return (
                <g key={index}>
                  <path d={`M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`} fill={segment.color} stroke="#ffffff10" strokeWidth="0.3" />
                  
                  {(() => {
                    const midAngle = startAngle + angle / 2;
                    const rad = (midAngle * Math.PI) / 180;
                    const tx = 50 + 35 * Math.cos(rad);
                    const ty = 50 + 35 * Math.sin(rad);
                    return (
                      <g transform={`rotate(${midAngle + 90}, ${tx}, ${ty})`}>
                        <text x={tx} y={ty} fill="white" fontSize="3.5" fontWeight="bold" textAnchor="middle" style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.5))' }}>
                          {segment.label}
                        </text>
                      </g>
                    );
                  })()}
                </g>
              );
            })}
          </svg>
        </motion.div>
        
        {/* نظام المصابيح المحيطية */}
        <div className="absolute inset-0 -m-8 pointer-events-none">
          {[...Array(24)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-3 h-3 rounded-full ${i % 3 === 0 ? 'bg-[#fbbf24] shadow-[0_0_15px_#fbbf24]' : 'bg-purple-500 shadow-[0_0_10px_#a855f7]'}`}
              style={{
                top: `${50 + 49.5 * Math.sin((i * 15 * Math.PI) / 180)}%`,
                left: `${50 + 49.5 * Math.cos((i * 15 * Math.PI) / 180)}%`,
                transform: "translate(-50%, -50%)",
              }}
              animate={isSpinning ? { opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] } : {}}
              transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.05 }}
            />
          ))}
        </div>
      </div>

      <div className="mt-16 flex flex-col items-center">
        <p className="text-[11px] text-[#fbbf24]/40 uppercase tracking-[0.5em] font-black text-center">
          Imperial Vault Security System<br/>
          <span className="text-[8px] tracking-[0.2em] opacity-30 mt-2 block italic">Authenticated Pi Community Node</span>
        </p>
      </div>
    </div>
  );
}
