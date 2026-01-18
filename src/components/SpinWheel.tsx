import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { Crown, Sparkles } from "lucide-react";

interface SpinWheelProps {
  onSpinComplete: (result: string) => void;
  isSpinning: boolean;
  setIsSpinning: (spinning: boolean) => void;
  targetResult?: string | null;
}

const SEGMENTS = [
  { label: "0.01 π", color: "#9B5DE5", prize: "0.01_PI", index: 0 },
  { label: "LOSE", color: "#1A1528", prize: "LOSE", index: 1 },
  { label: "FREE", color: "#F5C542", prize: "FREE_SPIN", index: 2 },
  { label: "LOSE", color: "#1A1528", prize: "LOSE", index: 3 },
  { label: "0.05 π", color: "#7D3CF0", prize: "0.05_PI", index: 4 },
  { label: "LOSE", color: "#1A1528", prize: "LOSE", index: 5 },
  { label: "NFT", color: "#3B82F6", prize: "NFT_ENTRY", index: 6 },
  { label: "JACKPOT", color: "#FBBC05", prize: "JACKPOT_ENTRY", index: 7 },
];

export function SpinWheel({ onSpinComplete, isSpinning, setIsSpinning, targetResult }: SpinWheelProps) {
  const [rotation, setRotation] = useState(0);
  const { playSpinSound, playTickSound, playWinSound } = useSoundEffects();
  const tickIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isSpinning && targetResult) {
      playSpinSound();
      
      const targetIndex = SEGMENTS.find(s => s.prize === targetResult)?.index ?? 0;
      const segmentAngle = 360 / SEGMENTS.length;
      
      // زيادة عدد اللفات لتبدو أكثر إثارة (10 لفات كاملة)
      const finalRotation = rotation + (10 * 360) + (360 - (targetIndex * segmentAngle));
      setRotation(finalRotation);

      // تأثير صوت التكتكة مع التباطؤ التدريجي
      let ticks = 0;
      tickIntervalRef.current = setInterval(() => {
        playTickSound();
        ticks++;
        if (ticks > 50) clearInterval(tickIntervalRef.current!);
      }, 80);

      setTimeout(() => {
        if (!targetResult.includes('LOSE')) playWinSound();
        onSpinComplete(targetResult);
        setIsSpinning(false);
        if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
      }, 4500);
    }
  }, [isSpinning, targetResult]);

  return (
    <div className="relative flex flex-col items-center py-12">
      {/* تأثير الهالة الخلفية (Ambient Glow) */}
      <div className={`absolute w-[400px] h-[400px] rounded-full bg-purple-600/20 blur-[100px] transition-all duration-1000 ${isSpinning ? 'scale-150 opacity-100' : 'scale-100 opacity-50'}`} />

      <div className="relative">
        {/* المؤشر الأسطوري (التاج) */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-[100]">
          <motion.div 
            animate={isSpinning ? { y: [0, 5, 0], scale: [1, 1.1, 1] } : {}}
            transition={{ repeat: Infinity, duration: 0.2 }}
            className="flex flex-col items-center"
          >
            <Crown className="w-12 h-12 text-[#fbbf24] filter drop-shadow-[0_0_15px_#fbbf24]" />
            <div className="w-1 h-6 bg-gradient-to-b from-[#fbbf24] to-transparent shadow-[0_0_10px_#fbbf24]" />
          </motion.div>
        </div>

        {/* المركز الثابت (شعار الإمبراطورية) */}
        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-[#0a0a0c] border-[6px] border-[#fbbf24] shadow-[0_0_40px_rgba(251,191,36,0.6)] flex items-center justify-center">
             <div className="relative">
                <span className="text-5xl md:text-6xl font-serif text-[#fbbf24] drop-shadow-[0_0_10px_rgba(251,191,36,1)]">π</span>
                {isSpinning && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute -inset-4 border-2 border-dashed border-purple-500/50 rounded-full"
                  />
                )}
             </div>
          </div>
        </div>

        {/* جسم العجلة */}
        <motion.div
          className="relative w-80 h-80 md:w-[500px] md:h-[500px] rounded-full border-[12px] border-[#1a1a1a] shadow-[0_0_60px_rgba(0,0,0,1)] overflow-hidden"
          animate={{ rotate: rotation }}
          transition={{ duration: 4.5, ease: [0.15, 0, 0.15, 1] }}
        >
          {/* طبقة الإطار الذهبي الداخلي */}
          <div className="absolute inset-0 border-[4px] border-[#fbbf24]/30 rounded-full z-10 pointer-events-none" />
          
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {SEGMENTS.map((segment, index) => {
              const angle = 360 / SEGMENTS.length;
              const startAngle = index * angle - 90;
              const endAngle = startAngle + angle;
              const x1 = 50 + 50 * Math.cos((startAngle * Math.PI) / 180);
              const y1 = 50 + 50 * Math.sin((startAngle * Math.PI) / 180);
              const x2 = 50 + 50 * Math.cos((endAngle * Math.PI) / 180);
              const y2 = 50 + 50 * Math.sin((endAngle * Math.PI) / 180);

              const midAngle = startAngle + angle / 2;
              const tx = 50 + 36 * Math.cos((midAngle * Math.PI) / 180);
              const ty = 50 + 36 * Math.sin((midAngle * Math.PI) / 180);

              return (
                <g key={index} className="transition-opacity duration-500">
                  <path 
                    d={`M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`} 
                    fill={segment.color}
                    stroke="#ffffff10"
                    strokeWidth="0.2"
                  />
                  <g transform={`rotate(${midAngle + 90}, ${tx}, ${ty})`}>
                    <text
                      x={tx} y={ty}
                      fill="white"
                      fontSize="3.8"
                      fontWeight="900"
                      textAnchor="middle"
                      className="drop-shadow-md select-none"
                      style={{ fontFamily: 'Cinzel, serif' }}
                    >
                      {segment.label}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>
        </motion.div>

        {/* مصابيح النيون المحيطة (Outer Bulbs) */}
        <div className="absolute inset-0 -m-6 pointer-events-none">
          {[...Array(24)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-3 h-3 rounded-full ${i % 2 === 0 ? 'bg-[#fbbf24]' : 'bg-purple-500'} shadow-[0_0_15px_currentColor]`}
              style={{
                top: `${50 + 49 * Math.sin((i * 15 * Math.PI) / 180)}%`,
                left: `${50 + 49 * Math.cos((i * 15 * Math.PI) / 180)}%`,
                transform: "translate(-50%, -50%)",
              }}
              animate={isSpinning ? { opacity: [0.3, 1, 0.3] } : { opacity: 1 }}
              transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.05 }}
            />
          ))}
        </div>
      </div>

      {/* لوحة الحالة */}
      <AnimatePresence>
        {isSpinning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-12 flex items-center gap-2 px-6 py-2 bg-[#fbbf24]/10 border border-[#fbbf24]/20 rounded-full"
          >
            <Sparkles className="w-5 h-5 text-[#fbbf24] animate-spin" />
            <span className="text-xl font-bold text-[#fbbf24] tracking-widest uppercase">Invoking the Luck...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
