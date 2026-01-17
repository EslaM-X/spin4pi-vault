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
      <style>{`
        @keyframes border-flow {
          0% { border-color: #a855f7; box-shadow: 0 0 20px rgba(168, 85, 247, 0.5); }
          50% { border-color: #fbbf24; box-shadow: 0 0 40px rgba(251, 191, 36, 0.7); }
          100% { border-color: #a855f7; box-shadow: 0 0 20px rgba(168, 85, 247, 0.5); }
        }
        .wheel-container {
          animation: border-flow 4s infinite ease-in-out;
          border-style: double;
        }
      `}</style>

      {/* الهالة الخلفية النابضة */}
      <div className={`absolute inset-0 -m-12 rounded-full bg-purple-600/10 blur-[120px] transition-opacity duration-1000 ${
        isSpinning ? 'opacity-100' : 'opacity-40'
      }`} />
      
      <div className="relative">
        {/* المؤشر الذهبي الفخم */}
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-40">
          <motion.div 
             animate={isSpinning ? { y: [0, 6, 0], scale: [1, 1.1, 1] } : {}}
             transition={{ duration: 0.1, repeat: Infinity }}
          >
            <div className="w-10 h-12 bg-gradient-to-b from-yellow-300 to-gold rounded-b-full shadow-[0_5px_15px_rgba(251,191,36,0.6)] flex items-center justify-center border-x-2 border-yellow-600">
                <div className="w-3 h-3 bg-black rounded-full shadow-inner animate-pulse" />
            </div>
          </motion.div>
        </div>
        
        {/* العجلة الرئيسية */}
        <motion.div
          className="wheel-container relative w-80 h-80 md:w-[450px] md:h-[450px] rounded-full border-[12px] bg-[#050507] overflow-hidden"
          animate={{ rotate: rotation }}
          transition={{ duration: 4.5, ease: [0.15, 0, 0.15, 1] }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full transform scale-[1.01]">
            <defs>
              {/* تدرجات ألوان فخمة للـ Core */}
              <radialGradient id="vault-core-grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FBBC05" />
                <stop offset="40%" stopColor="#D97706" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </radialGradient>
              
              {/* فلتر التوهج للرمز */}
              <filter id="pi-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="1.2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

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
              const iconX = 50 + 35 * Math.cos(textRad);
              const iconY = 50 + 35 * Math.sin(textRad);
              const labelX = 50 + 23 * Math.cos(textRad);
              const labelY = 50 + 23 * Math.sin(textRad);

              return (
                <g key={index}>
                  <path
                    d={pathD}
                    fill={segment.color}
                    className="opacity-95 stroke-black/20"
                    strokeWidth="0.4"
                  />
                  {/* الأيقونات */}
                  <g transform={`translate(${iconX - 4}, ${iconY - 4}) rotate(${midAngle + 90}, 4, 4)`}>
                    <foreignObject width="8" height="8">
                       <div className="text-white/90 flex items-center justify-center drop-shadow-md" style={{ width: '100%', height: '100%', fontSize: '4.5px' }}>
                          {segment.icon}
                       </div>
                    </foreignObject>
                  </g>
                  {/* النصوص */}
                  <text
                    x={labelX}
                    y={labelY}
                    fill="white"
                    fontSize="3.8"
                    fontWeight="900"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${midAngle + 90}, ${labelX}, ${labelY})`}
                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                    className="uppercase tracking-tighter"
                  >
                    {segment.label}
                  </text>
                </g>
              );
            })}
            
            {/* الدائرة المركزية الأسطورية (Vault Core) */}
            <g>
              <circle cx="50" cy="50" r="13" fill="#0f172a" stroke="#FBBC05" strokeWidth="0.5" />
              <circle cx="50" cy="50" r="10.5" fill="url(#vault-core-grad)" className={isSpinning ? "animate-pulse" : ""} />
              
              {/* رسم رمز π بدقة متناهية وفخامة */}
              <g transform="translate(42, 43.5) scale(0.16)" filter="url(#pi-glow)">
                <path 
                  d="M10 20 C10 15, 15 10, 50 10 C85 10, 90 15, 90 20 L90 25 C90 30, 85 32, 50 32 C15 32, 10 30, 10 25 Z" 
                  fill="white" 
                /> {/* Head */}
                <path 
                  d="M25 32 L25 75 C25 85, 20 90, 5 90" 
                  stroke="white" 
                  strokeWidth="14" 
                  fill="none" 
                  strokeLinecap="round" 
                /> {/* Left Leg */}
                <path 
                  d="M70 32 L70 90" 
                  stroke="white" 
                  strokeWidth="14" 
                  fill="none" 
                  strokeLinecap="round" 
                /> {/* Right Leg */}
              </g>

              {/* تأثير الانعكاس الزجاجي العلوي */}
              <ellipse cx="47" cy="46" rx="5" ry="3" fill="white" opacity="0.2" />
            </g>
          </svg>
        </motion.div>
        
        {/* لمبات الـ LED المحيطة بنمط نيون */}
        <div className="absolute inset-0 -m-6 pointer-events-none">
          {[...Array(24)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-2.5 h-2.5 rounded-full ${i % 2 === 0 ? 'bg-gold shadow-[0_0_10px_#fbbf24]' : 'bg-purple-500 shadow-[0_0_10px_#a855f7]'}`}
              style={{
                top: `${50 + 49.5 * Math.sin((i * 15 * Math.PI) / 180)}%`,
                left: `${50 + 49.5 * Math.cos((i * 15 * Math.PI) / 180)}%`,
                transform: "translate(-50%, -50%)",
              }}
              animate={isSpinning ? { 
                opacity: [0.4, 1, 0.4], 
                scale: [0.8, 1.3, 0.8],
                boxShadow: ['0 0 5px currentColor', '0 0 20px currentColor', '0 0 5px currentColor']
              } : {}}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.05 }}
            />
          ))}
        </div>
      </div>

      {/* شريط حالة النظام */}
      <motion.div className="mt-10">
        {isSpinning ? (
          <div className="flex flex-col items-center gap-2">
            <div className="px-8 py-2.5 bg-gradient-to-r from-purple-900/40 via-purple-600/40 to-purple-900/40 border border-purple-500/30 rounded-xl backdrop-blur-xl shadow-2xl">
              <span className="text-white font-black tracking-[0.2em] text-xs animate-pulse uppercase">
                Synchronizing Vault...
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 opacity-60">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
            <p className="text-[10px] text-white/70 uppercase tracking-[0.4em] font-black">
              Security Protocol: Online
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
