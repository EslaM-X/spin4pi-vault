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

// مكون منفصل لرمز Pi لضمان الرندر الصحيح
const PiIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    <path d="M4 7h16" />
    <path d="M9 7v10c0 1.5-1 2.5-2.5 2.5" />
    <path d="M15 7v10" />
  </svg>
);

export function SpinWheel({ onSpinComplete, isSpinning, setIsSpinning, targetResult }: SpinWheelProps) {
  const [rotation, setRotation] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const { playSpinSound, playTickSound, playWinSound } = useSoundEffects();
  const tickIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isSpinning && targetResult && !isAnimating) {
      setIsAnimating(true);
      playSpinSound();
      const targetSegment = SEGMENTS.find(s => s.prize === targetResult);
      const targetIndex = targetSegment?.index ?? 0;
      const segmentAngle = 360 / SEGMENTS.length;
      const targetAngle = targetIndex * segmentAngle;
      const spins = 8 + Math.random() * 2; 
      const finalRotation = rotation + (spins * 360) + (360 - targetAngle);
      setRotation(finalRotation);
      
      let tickCount = 0;
      tickIntervalRef.current = setInterval(() => {
        tickCount++;
        playTickSound();
        if (tickCount >= 80) clearInterval(tickIntervalRef.current!);
      }, 50);

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
      <div className="relative">
        {/* المؤشر العلوي */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-40">
          <Crown className="text-yellow-500 w-8 h-8 drop-shadow-[0_0_10px_#fbbf24]" />
        </div>
        
        {/* العجلة */}
        <motion.div
          className="relative w-80 h-80 md:w-[450px] md:h-[450px] rounded-full border-[10px] border-[#fbbf24]/30 bg-[#050507] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]"
          animate={{ rotate: rotation }}
          transition={{ duration: 4.5, ease: [0.15, 0, 0.15, 1] }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full transform scale-[1.01]">
            {SEGMENTS.map((segment, index) => {
              const angle = 360 / SEGMENTS.length;
              const startAngle = index * angle - 90;
              const endAngle = startAngle + angle;
              const x1 = 50 + 50 * Math.cos((startAngle * Math.PI) / 180);
              const y1 = 50 + 50 * Math.sin((startAngle * Math.PI) / 180);
              const x2 = 50 + 50 * Math.cos((endAngle * Math.PI) / 180);
              const y2 = 50 + 50 * Math.sin((endAngle * Math.PI) / 180);
              const pathD = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;
              const midAngle = startAngle + angle / 2;
              const textRad = (midAngle * Math.PI) / 180;
              const labelX = 50 + 30 * Math.cos(textRad);
              const labelY = 50 + 30 * Math.sin(textRad);

              return (
                <g key={index}>
                  <path d={pathD} fill={segment.color} stroke="#00000020" strokeWidth="0.5" />
                  <text
                    x={labelX} y={labelY} fill="white" fontSize="4" fontWeight="bold" textAnchor="middle" dominantBaseline="middle"
                    transform={`rotate(${midAngle + 90}, ${labelX}, ${labelY})`}
                  >
                    {segment.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* الدائرة المركزية الثابتة مع الرمز */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-[#1e1b4b] border-4 border-[#fbbf24] shadow-[0_0_20px_#fbbf24] flex items-center justify-center">
                <div className="w-10 h-10 md:w-14 md:h-14 text-[#fbbf24]">
                   <PiIcon />
                </div>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
