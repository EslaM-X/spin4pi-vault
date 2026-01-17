import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { Trophy, Ban, Sparkles, Gift, Zap, Crown, Gem, Coins } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";

interface SpinWheelProps {
  onSpinComplete: (result: string) => void;
  isSpinning: boolean;
  setIsSpinning: (spinning: boolean) => void;
  targetResult?: string | null;
}

// تعريف القطاعات مع الأيقونات والهوية البصرية الجديدة
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
  }, [isSpinning, targetResult]);

  return (
    <div className="relative flex flex-col items-center py-10">
      <style>{`
        @keyframes border-flow {
          0% { border-color: #a855f7; box-shadow: 0 0 20px #a855f7; }
          50% { border-color: #fbbf24; box-shadow: 0 0 40px #fbbf24; }
          100% { border-color: #a855f7; box-shadow: 0 0 20px #a855f7; }
        }
        .wheel-container {
          animation: border-flow 4s infinite ease-in-out;
        }
      `}</style>

      {/* الهالة الخلفية */}
      <div className={`absolute inset-0 -m-12 rounded-full bg-purple-600/20 blur-[100px] transition-opacity duration-1000 ${
        isSpinning ? 'opacity-100' : 'opacity-40'
      }`} />
      
      <div className="relative">
        {/* مؤشر العجلة الأسطوري */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-30">
          <motion.div 
             className="relative"
             animate={isSpinning ? { y: [0, 5, 0] } : {}}
             transition={{ duration: 0.1, repeat: Infinity }}
          >
            <div className="w-8 h-10 bg-gold rounded-b-full shadow-[0_0_20px_#fbbf24] flex items-center justify-center">
                <div className="w-2 h-2 bg-black rounded-full animate-pulse" />
            </div>
          </motion.div>
        </div>
        
        {/* العجلة الرئيسية */}
        <motion.div
          className="wheel-container relative w-72 h-72 md:w-96 md:h-96 rounded-full border-[10px] border-gold bg-[#0a0a0b] overflow-hidden"
          animate={{ rotate: rotation }}
          transition={{ duration: 4.5, ease: [0.15, 0, 0.15, 1] }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
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
              const iconX = 50 + 34 * Math.cos(textRad);
              const iconY = 50 + 34 * Math.sin(textRad);
              const labelX = 50 + 22 * Math.cos(textRad);
              const labelY = 50 + 22 * Math.sin(textRad);

              return (
                <g key={index}>
                  <path
                    d={pathD}
                    fill={segment.color}
                    className="opacity-90 stroke-white/5"
                    strokeWidth="0.2"
                  />
                  {/* أيقونات الخيارات */}
                  <g transform={`translate(${iconX - 4}, ${iconY - 4}) rotate(${midAngle + 90}, 4, 4)`}>
                    <foreignObject width="8" height="8">
                       <div className="text-white flex items-center justify-center" style={{ width: '100%', height: '100%', fontSize: '4px' }}>
                          {segment.icon}
                       </div>
                    </foreignObject>
                  </g>
                  {/* نصوص الجوائز */}
                  <text
                    x={labelX}
                    y={labelY}
                    fill="white"
                    fontSize="3.5"
                    fontWeight="900"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${midAngle + 90}, ${labelX}, ${labelY})`}
                    className="uppercase tracking-tighter pointer-events-none shadow-sm"
                  >
                    {segment.label}
                  </text>
                </g>
              );
            })}
            
            {/* الدائرة المركزية (The Vault Core) */}
            <circle cx="50" cy="50" r="10" fill="#000" stroke="#fbbf24" strokeWidth="1" />
            <circle cx="50" cy="50" r="8" fill="url(#core-grad)" className="animate-pulse" />
            <defs>
              <radialGradient id="core-grad">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#a855f7" />
              </radialGradient>
            </defs>
            <text x="50" y="52" fill="#fff" fontSize="7" fontWeight="black" textAnchor="middle" dominantBaseline="middle">π</text>
          </svg>
        </motion.div>
        
        {/* لمبات النيون المحيطة */}
        <div className="absolute inset-0 -m-5 pointer-events-none">
          {[...Array(24)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-2 h-2 rounded-full ${i % 2 === 0 ? 'bg-gold' : 'bg-purple-500'}`}
              style={{
                top: `${50 + 49 * Math.sin((i * 15 * Math.PI) / 180)}%`,
                left: `${50 + 49 * Math.cos((i * 15 * Math.PI) / 180)}%`,
                transform: "translate(-50%, -50%)",
                boxShadow: isSpinning ? '0 0 10px #fbbf24' : 'none'
              }}
              animate={isSpinning ? { opacity: [0.3, 1, 0.3], scale: [1, 1.5, 1] } : {}}
              transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.05 }}
            />
          ))}
        </div>
      </div>

      <motion.div className="mt-8">
        {isSpinning ? (
          <div className="px-6 py-2 bg-purple-900/40 border border-purple-500/50 rounded-full backdrop-blur-md">
            <span className="text-purple-400 font-black tracking-widest text-sm animate-pulse uppercase">
              Vault System Processing...
            </span>
          </div>
        ) : (
          <p className="text-xs text-white/40 uppercase tracking-[0.3em] font-bold">
            Secure Spin Interface Active
          </p>
        )}
      </motion.div>
    </div>
  );
}
