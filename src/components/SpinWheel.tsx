import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { 
  Crown, Sparkles, Ghost, Coins, 
  Gift, Gem, Trophy, Star, Zap 
} from "lucide-react";

interface SpinWheelProps {
  onSpinComplete: (result: string) => void;
  isSpinning: boolean;
  setIsSpinning: (spinning: boolean) => void;
  targetResult?: string | null;
}

const SEGMENTS = [
  { label: "0.01 π", color: "#7D3CF0", prize: "0.01_PI", index: 0, Icon: Coins, glow: "#9B5DE5" },
  { label: "LOSE", color: "#1A1528", prize: "LOSE", index: 1, Icon: Ghost, glow: "#332a4d" },
  { label: "FREE", color: "#F5C542", prize: "FREE_SPIN", index: 2, Icon: Gift, glow: "#fbbf24" },
  { label: "LOSE", color: "#1A1528", prize: "LOSE", index: 3, Icon: Zap, glow: "#332a4d" },
  { label: "0.05 π", color: "#4A1F8C", prize: "0.05_PI", index: 4, Icon: Gem, glow: "#7D3CF0" },
  { label: "LOSE", color: "#1A1528", prize: "LOSE", index: 5, Icon: Ghost, glow: "#332a4d" },
  { label: "NFT", color: "#3B82F6", prize: "NFT_ENTRY", index: 6, Icon: Star, glow: "#60a5fa" },
  { label: "JACKPOT", color: "#FBBC05", prize: "JACKPOT_ENTRY", index: 7, Icon: Trophy, glow: "#fde047" },
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
      
      // حساب الدوران النهائي (10 لفات كاملة + زاوية الجائزة)
      // طرحنا نصف زاوية القطاع لضمان التوقف في المنتصف تماماً
      const finalRotation = rotation + (10 * 360) + (360 - (targetIndex * segmentAngle));
      setRotation(finalRotation);

      // نظام أصوات التكتكة أثناء الدوران
      let ticks = 0;
      if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
      tickIntervalRef.current = setInterval(() => {
        playTickSound();
        ticks++;
        if (ticks > 50) {
            if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
        }
      }, 80);

      // إنهاء الدوران بعد 4.5 ثانية (مطابق لزاوية الأنيميشن)
      const timer = setTimeout(() => {
        if (!targetResult.includes('LOSE')) {
          playWinSound();
        }
        onSpinComplete(targetResult);
        setIsSpinning(false);
        if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
      }, 4500);

      return () => {
        clearTimeout(timer);
        if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
      };
    }
  }, [isSpinning, targetResult]);

  return (
    <div className="relative flex flex-col items-center py-10">
      {/* Background Glow Effect */}
      <div className={`absolute w-[400px] md:w-[600px] h-[400px] md:h-[600px] rounded-full bg-gold/10 blur-[120px] transition-all duration-1000 ${isSpinning ? 'opacity-100 scale-110' : 'opacity-30'}`} />

      <div className="relative">
        {/* Pointer (Crown) */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-[100]">
          <motion.div animate={isSpinning ? { y: [0, 5, 0], rotate: [-2, 2, -2] } : {}}>
            <Crown className="w-12 h-12 text-gold fill-gold/20 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]" />
          </motion.div>
        </div>

        {/* Center Logo */}
        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-[#09090b] border-4 border-gold shadow-[0_0_40px_rgba(251,191,36,0.4)] flex items-center justify-center">
            <span className="text-5xl font-serif text-gold drop-shadow-[0_0_10px_#fbbf24]">π</span>
          </div>
        </div>

        {/* Wheel Body */}
        <motion.div
          className="relative w-72 h-72 md:w-[500px] md:h-[500px] rounded-full border-[12px] border-[#1a1a1e] shadow-2xl overflow-hidden"
          animate={{ rotate: rotation }}
          transition={{ duration: 4.5, ease: [0.15, 0, 0.1, 1] }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {SEGMENTS.map((segment, index) => {
              const angle = 360 / SEGMENTS.length;
              const startAngle = index * angle - 90;
              const midAngle = startAngle + angle / 2;
              const rad = (midAngle * Math.PI) / 180;
              
              const x1 = 50 + 50 * Math.cos((startAngle * Math.PI) / 180);
              const y1 = 50 + 50 * Math.sin((startAngle * Math.PI) / 180);
              const x2 = 50 + 50 * Math.cos(((startAngle + angle) * Math.PI) / 180);
              const y2 = 50 + 50 * Math.sin(((startAngle + angle) * Math.PI) / 180);

              const tx = 50 + 32 * Math.cos(rad);
              const ty = 50 + 32 * Math.sin(rad);
              
              const Icon = segment.Icon;

              return (
                <g key={index}>
                  <path 
                    d={`M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`} 
                    fill={segment.color}
                    className="stroke-[#ffffff05] stroke-[0.2]"
                  />
                  
                  <g transform={`rotate(${midAngle + 90}, ${tx}, ${ty})`}>
                    <text
                      x={tx} y={ty + 8}
                      fill="white" fontSize="3" fontWeight="900"
                      textAnchor="middle" className="uppercase select-none opacity-80"
                    >
                      {segment.label}
                    </text>
                    <foreignObject x={tx - 4} y={ty - 6} width="8" height="8">
                      <div className="flex items-center justify-center w-full h-full">
                        <Icon size={20} style={{ color: segment.glow, filter: `drop-shadow(0 0 5px ${segment.glow})` }} />
                      </div>
                    </foreignObject>
                  </g>
                </g>
              );
            })}
          </svg>
        </motion.div>

        {/* Lights Effect */}
        <div className="absolute inset-0 -m-4 pointer-events-none">
          {[...Array(24)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-2 h-2 rounded-full ${i % 2 === 0 ? 'bg-gold shadow-[0_0_10px_#fbbf24]' : 'bg-white/20'}`}
              style={{
                top: `${50 + 51 * Math.sin((i * 15 * Math.PI) / 180)}%`,
                left: `${50 + 51 * Math.cos((i * 15 * Math.PI) / 180)}%`,
                transform: "translate(-50%, -50%)",
              }}
              animate={isSpinning ? { opacity: [0.3, 1, 0.3] } : { opacity: 0.6 }}
              transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.05 }}
            />
          ))}
        </div>
      </div>

      {/* Spinning Status */}
      <AnimatePresence>
        {isSpinning && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="mt-12 flex flex-col items-center"
          >
            <div className="flex items-center gap-2 px-6 py-2 bg-gold/10 border border-gold/30 rounded-full">
              <Sparkles className="w-4 h-4 text-gold animate-spin" />
              <span className="text-xs font-black text-gold uppercase tracking-[0.3em]">Imperial Luck is Spinning</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
