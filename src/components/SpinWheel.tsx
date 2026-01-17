import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { Crown } from "lucide-react";

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
      // حساب الزاوية النهائية: دورات عشوائية + تعويض الزاوية للوقوف على القطاع الصحيح
      const finalAngle = rotation + (10 * 360) + (360 - (targetIndex * segmentAngle));
      
      setRotation(finalAngle);

      // تأثير صوت التكتكة أثناء الدوران
      let ticks = 0;
      tickIntervalRef.current = setInterval(() => {
        playTickSound();
        if (++ticks >= 60) clearInterval(tickIntervalRef.current!);
      }, 70);

      setTimeout(() => {
        if (!targetResult.includes('LOSE')) playWinSound();
        onSpinComplete(targetResult);
        setIsSpinning(false);
        if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
      }, 4500);
    }
  }, [isSpinning, targetResult]);

  return (
    <div className="relative flex flex-col items-center py-10">
      <style>{`.royal-shadow { box-shadow: 0 0 50px rgba(168, 85, 247, 0.3); }`}</style>

      <div className="relative">
        {/* المؤشر العلوي */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-50">
          <Crown className="text-[#fbbf24] w-10 h-10 drop-shadow-[0_0_10px_#fbbf24]" />
        </div>
        
        {/* الشعار المركزي الثابت (يقرأ من public مباشرة) */}
        <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
          <div className="w-24 h-24 md:w-36 md:h-36 rounded-full bg-black border-4 border-[#fbbf24] shadow-[0_0_20px_rgba(251,191,36,0.5)] flex items-center justify-center overflow-hidden">
            <img 
              src="/pinetwork.jpg" 
              alt="Pi" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const p = e.currentTarget.parentElement;
                if(p) p.innerHTML = '<span class="text-[#fbbf24] text-5xl font-serif">π</span>';
              }}
            />
          </div>
        </div>

        {/* العجلة الدوارة */}
        <motion.div
          className="relative w-80 h-80 md:w-[500px] md:h-[500px] rounded-full border-[10px] border-[#fbbf24] royal-shadow overflow-hidden bg-[#050507]"
          animate={{ rotate: rotation }}
          transition={{ duration: 4.5, ease: [0.15, 0, 0.15, 1] }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {SEGMENTS.map((s, i) => {
              const angle = 360 / SEGMENTS.length;
              const start = (i * angle - 90) * (Math.PI / 180);
              const end = ((i + 1) * angle - 90) * (Math.PI / 180);
              const x1 = 50 + 50 * Math.cos(start);
              const y1 = 50 + 50 * Math.sin(start);
              const x2 = 50 + 50 * Math.cos(end);
              const y2 = 50 + 50 * Math.sin(end);

              return (
                <g key={i}>
                  <path d={`M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`} fill={s.color} stroke="#00000020" strokeWidth="0.2" />
                  <text
                    x="75" y="50"
                    transform={`rotate(${i * angle + angle / 2 - 90} 50 50)`}
                    fill="white" fontSize="3.5" fontWeight="bold" textAnchor="middle"
                    className="select-none"
                  >
                    {s.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </motion.div>

        {/* مصابيح الزينة المحيطة */}
        <div className="absolute inset-0 -m-6 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-[#fbbf24] shadow-[0_0_10px_#fbbf24]"
              style={{
                top: `${50 + 48 * Math.sin((i * 30 * Math.PI) / 180)}%`,
                left: `${50 + 48 * Math.cos((i * 30 * Math.PI) / 180)}%`,
                transform: "translate(-50%, -50%)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
