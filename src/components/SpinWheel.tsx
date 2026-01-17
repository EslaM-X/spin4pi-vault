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
        @keyframes crown-glow {
          0%, 100% { filter: drop-shadow(0 0 10px #fbbf24); }
          50% { filter: drop-shadow(0 0 25px #fbbf24); }
        }
        .royal-spin-shadow {
          box-shadow: 0 0 50px rgba(168, 85, 247, 0.3), inset 0 0 30px rgba(0,0,0,0.8);
        }
      `}</style>

      {/* الهالة الملكية الكبرى */}
      <div className={`absolute inset-0 -m-20 rounded-full bg-gradient-to-tr from-purple-600/10 via-yellow-500/5 to-purple-900/10 blur-[150px] transition-opacity duration-1000 ${
        isSpinning ? 'opacity-100' : 'opacity-40'
      }`} />
      
      <div className="relative">
        {/* مؤشر "تاج الخزنة" */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-40 scale-125">
          <motion.div 
             animate={isSpinning ? { scale: [1, 1.2, 1], y: [0, 5, 0] } : {}}
             transition={{ duration: 0.1, repeat: Infinity }}
             className="flex flex-col items-center"
          >
            <Crown className="text-gold w-8 h-8 drop-shadow-[0_0_10px_#fbbf24]" />
            <div className="w-1 h-4 bg-gold shadow-[0_0_15px_#fbbf24] -mt-1" />
          </motion.div>
        </div>
        
        {/* العجلة الرئيسية */}
        <motion.div
          className="relative w-80 h-80 md:w-[480px] md:h-[480px] rounded-full border-[12px] border-double border-gold/50 royal-spin-shadow bg-[#050507] overflow-hidden"
          animate={{ rotate: rotation }}
          transition={{ duration: 4.5, ease: [0.15, 0, 0.15, 1] }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full transform scale-[1.02]">
            <defs>
              {/* تدرج ملكي محفور لرمز Pi */}
              <linearGradient id="pi-metal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="50%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>

              {/* تدرج لعمق قلب الخزنة */}
              <radialGradient id="royal-core-bg" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#2e1065" />
                <stop offset="70%" stopColor="#000000" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </radialGradient>

              <filter id="inner-glow">
                <feGaussianBlur stdDeviation="1" result="blur" />
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
              const iconX = 50 + 36 * Math.cos(textRad);
              const iconY = 50 + 36 * Math.sin(textRad);
              const labelX = 50 + 24 * Math.cos(textRad);
              const labelY = 50 + 24 * Math.sin(textRad);

              return (
                <g key={index} className="transition-all duration-500 hover:brightness-125">
                  <path
                    d={pathD}
                    fill={segment.color}
                    className="opacity-95"
                    stroke="#ffffff10"
                    strokeWidth="0.3"
                  />
                  {/* أيقونات الخيارات */}
                  <g transform={`translate(${iconX - 4}, ${iconY - 4}) rotate(${midAngle + 90}, 4, 4)`}>
                    <foreignObject width="8" height="8">
                       <div className="text-white flex items-center justify-center filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" style={{ width: '100%', height: '100%', fontSize: '4.5px' }}>
                          {segment.icon}
                       </div>
                    </foreignObject>
                  </g>
                  {/* نصوص الجوائز */}
                  <text
                    x={labelX}
                    y={labelY}
                    fill="white"
                    fontSize="3.8"
                    fontWeight="900"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${midAngle + 90}, ${labelX}, ${labelY})`}
                    className="uppercase tracking-[0.1em] pointer-events-none"
                    style={{ filter: 'drop-shadow(0 1px 2px black)' }}
                  >
                    {segment.label}
                  </text>
                </g>
              );
            })}
            
            {/* الدائرة المركزية (The Imperial Vault Core) */}
            <g className="filter drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]">
              <circle cx="50" cy="50" r="14" fill="url(#royal-core-bg)" stroke="#fbbf24" strokeWidth="1" />
              <circle cx="50" cy="50" r="12" fill="transparent" stroke="#fbbf24" strokeWidth="0.2" strokeDasharray="2,2" className="animate-[spin_10s_linear_infinite]" />
              
              {/* رمز Pi الملكي (Icon Style) */}
              <g transform="translate(42, 42) scale(0.16)" filter="url(#inner-glow)">
                <path 
                  d="M10 20 Q 50 10 90 20 L 90 30 Q 50 20 10 30 Z" 
                  fill="url(#pi-metal-grad)" 
                />
                <path 
                  d="M30 30 L 30 80 Q 30 90 10 90" 
                  stroke="url(#pi-metal-grad)" 
                  strokeWidth="12" 
                  fill="none" 
                  strokeLinecap="round" 
                />
                <path 
                  d="M70 30 L 70 90" 
                  stroke="url(#pi-metal-grad)" 
                  strokeWidth="12" 
                  fill="none" 
                  strokeLinecap="round" 
                />
              </g>

              {/* تأثير الزجاج العاكس */}
              <circle cx="46" cy="46" r="6" fill="white" opacity="0.1" />
            </g>
          </svg>
        </motion.div>
        
        {/* نظام الإضاءة الياقوتي والذهبي */}
        <div className="absolute inset-0 -m-6 pointer-events-none">
          {[...Array(24)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-3 h-3 rounded-full ${i % 3 === 0 ? 'bg-gold shadow-[0_0_15px_#fbbf24]' : 'bg-purple-500 shadow-[0_0_10px_#a855f7]'}`}
              style={{
                top: `${50 + 49.5 * Math.sin((i * 15 * Math.PI) / 180)}%`,
                left: `${50 + 49.5 * Math.cos((i * 15 * Math.PI) / 180)}%`,
                transform: "translate(-50%, -50%)",
              }}
              animate={isSpinning ? { 
                scale: [0.8, 1.2, 0.8],
                opacity: [0.5, 1, 0.5],
                boxShadow: ['0 0 5px currentColor', '0 0 20px currentColor', '0 0 5px currentColor']
              } : {}}
              transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.05 }}
            />
          ))}
        </div>
      </div>

      {/* الحالة السفلية */}
      <motion.div className="mt-12 flex flex-col items-center">
        <div className="w-40 h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent mb-4" />
        {isSpinning ? (
          <motion.div 
            className="flex items-center gap-3"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            <Sparkles className="text-gold w-4 h-4" />
            <span className="text-gold font-black tracking-[0.3em] uppercase text-xs">
               Opening Vault...
            </span>
            <Sparkles className="text-gold w-4 h-4" />
          </motion.div>
        ) : (
          <p className="text-[10px] text-white/30 uppercase tracking-[0.5em] font-bold">
            Imperial Security Connection Active
          </p>
        )}
      </motion.div>
    </div>
  );
}
