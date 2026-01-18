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

// تعريف القطاعات بهوية ألوان التطبيق (البنفسجي، الذهبي، الملكي)
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
      const finalRotation = rotation + (12 * 360) + (360 - (targetIndex * segmentAngle));
      setRotation(finalRotation);

      let ticks = 0;
      tickIntervalRef.current = setInterval(() => {
        playTickSound();
        ticks++;
        if (ticks > 60) clearInterval(tickIntervalRef.current!);
      }, 70);

      setTimeout(() => {
        if (!targetResult.includes('LOSE')) playWinSound();
        onSpinComplete(targetResult);
        setIsSpinning(false);
      }, 4500);
    }
  }, [isSpinning, targetResult]);

  return (
    <div className="relative flex flex-col items-center py-16">
      {/* Dynamic Background Glow */}
      <div className={`absolute w-[500px] h-[500px] rounded-full bg-pi-purple/20 blur-[120px] transition-all duration-1000 ${isSpinning ? 'opacity-100 scale-125' : 'opacity-40'}`} />

      <div className="relative">
        {/* Imperial Crown Pointer */}
        <div className="absolute -top-14 left-1/2 -translate-x-1/2 z-[100] drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]">
          <motion.div animate={isSpinning ? { rotate: [-5, 5, -5], scale: [1, 1.2, 1] } : {}}>
            <Crown className="w-14 h-14 text-gold fill-gold/20" />
            <div className="w-1.5 h-8 bg-gradient-to-b from-gold to-transparent mx-auto -mt-1 rounded-full" />
          </motion.div>
        </div>

        {/* The Fixed Core */}
        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-[#050507] border-[6px] border-gold shadow-[0_0_50px_rgba(251,191,36,0.5)] flex items-center justify-center relative">
            <div className="absolute inset-0 rounded-full border border-gold/30 animate-ping opacity-20" />
            <span className="text-6xl font-serif text-gold drop-shadow-[0_0_15px_rgba(251,191,36,0.8)] select-none">π</span>
          </div>
        </div>

        {/* The Legendary Wheel Body */}
        <motion.div
          className="relative w-80 h-80 md:w-[520px] md:h-[520px] rounded-full border-[14px] border-[#13111a] shadow-[0_0_80px_rgba(0,0,0,0.9)] overflow-hidden bg-[#13111a]"
          animate={{ rotate: rotation }}
          transition={{ duration: 4.5, ease: [0.2, 0, 0.1, 1] }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full transform-gpu">
            {SEGMENTS.map((segment, index) => {
              const angle = 360 / SEGMENTS.length;
              const startAngle = index * angle - 90;
              const midAngle = startAngle + angle / 2;
              const rad = (midAngle * Math.PI) / 180;
              
              // Coordinates for Paths & Labels
              const x1 = 50 + 50 * Math.cos((startAngle * Math.PI) / 180);
              const y1 = 50 + 50 * Math.sin((startAngle * Math.PI) / 180);
              const x2 = 50 + 50 * Math.cos(((startAngle + angle) * Math.PI) / 180);
              const y2 = 50 + 50 * Math.sin(((startAngle + angle) * Math.PI) / 180);

              const tx = 50 + 28 * Math.cos(rad);
              const ty = 50 + 28 * Math.sin(rad);
              
              const Icon = segment.Icon;

              return (
                <g key={index}>
                  {/* Segment Slice with Inner Gradient Effect */}
                  <path 
                    d={`M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`} 
                    fill={segment.color}
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="0.2"
                  />
                  
                  {/* Content Group (Label + Icon) */}
                  <g transform={`rotate(${midAngle + 90}, ${tx}, ${ty})`}>
                    <text
                      x={tx} y={ty + 8}
                      fill="white"
                      fontSize="3.2"
                      fontWeight="bold"
                      textAnchor="middle"
                      className="tracking-tighter uppercase select-none opacity-90"
                      style={{ fontFamily: 'Cinzel, serif' }}
                    >
                      {segment.label}
                    </text>
                    
                    {/* ForeignObject to render Lucide Icons inside SVG */}
                    <foreignObject x={tx - 4} y={ty - 6} width="8" height="8">
                      <div className="flex items-center justify-center w-full h-full">
                        <Icon 
                          size={24} 
                          strokeWidth={2.5}
                          style={{ 
                            color: segment.glow,
                            filter: `drop-shadow(0 0 5px ${segment.glow})` 
                          }} 
                        />
                      </div>
                    </foreignObject>
                  </g>
                </g>
              );
            })}
          </svg>
        </motion.div>

        {/* Imperial Neon Bulbs */}
        <div className="absolute inset-0 -m-8 pointer-events-none">
          {[...Array(32)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-2.5 h-2.5 rounded-full ${i % 2 === 0 ? 'bg-gold shadow-[0_0_12px_#fbbf24]' : 'bg-pi-purple shadow-[0_0_12px_#7D3CF0]'}`}
              style={{
                top: `${50 + 49.5 * Math.sin((i * 11.25 * Math.PI) / 180)}%`,
                left: `${50 + 49.5 * Math.cos((i * 11.25 * Math.PI) / 180)}%`,
                transform: "translate(-50%, -50%)",
              }}
              animate={isSpinning ? { opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] } : { opacity: 0.8 }}
              transition={{ repeat: Infinity, duration: 0.4, delay: i * 0.03 }}
            />
          ))}
        </div>
      </div>

      {/* Royal Status HUD */}
      <AnimatePresence>
        {isSpinning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="mt-16 flex flex-col items-center gap-2"
          >
            <div className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-pi-purple/20 via-gold/10 to-pi-purple/20 border border-gold/30 rounded-2xl backdrop-blur-md shadow-[0_0_30px_rgba(251,191,36,0.2)]">
              <Sparkles className="w-6 h-6 text-gold animate-pulse" />
              <span className="text-2xl font-black text-gold tracking-[0.3em] uppercase italic drop-shadow-sm">
                Vault Unlocking
              </span>
              <Sparkles className="w-6 h-6 text-gold animate-pulse" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
