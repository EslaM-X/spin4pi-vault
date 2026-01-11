import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useSoundEffects } from "@/hooks/useSoundEffects";

interface SpinWheelProps {
  onSpinComplete: (result: string) => void;
  isSpinning: boolean;
  setIsSpinning: (spinning: boolean) => void;
  targetResult?: string | null; // Result from backend to animate to
}

const SEGMENTS = [
  { label: "0.01 π", color: "from-pi-purple to-pi-purple-dark", prize: "0.01_PI", index: 0 },
  { label: "LOSE", color: "from-muted to-card", prize: "LOSE", index: 1 },
  { label: "FREE", color: "from-gold to-gold-dark", prize: "FREE_SPIN", index: 2 },
  { label: "LOSE", color: "from-muted to-card", prize: "LOSE", index: 3 },
  { label: "0.05 π", color: "from-pi-purple-glow to-pi-purple", prize: "0.05_PI", index: 4 },
  { label: "LOSE", color: "from-muted to-card", prize: "LOSE", index: 5 },
  { label: "NFT", color: "from-gold-glow to-gold", prize: "NFT_ENTRY", index: 6 },
  { label: "JACKPOT", color: "from-secondary to-gold-dark", prize: "JACKPOT_ENTRY", index: 7 },
];

export function SpinWheel({ onSpinComplete, isSpinning, setIsSpinning, targetResult }: SpinWheelProps) {
  const [rotation, setRotation] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const { playSpinSound, playTickSound, playWinSound } = useSoundEffects();
  const lastSegmentRef = useRef(0);
  const tickIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Handle the spin animation when we receive a target result from backend
  useEffect(() => {
    if (isSpinning && targetResult && !isAnimating) {
      setIsAnimating(true);
      playSpinSound();
      
      // Find the target segment index
      const targetSegment = SEGMENTS.find(s => s.prize === targetResult);
      const targetIndex = targetSegment?.index ?? 0;
      
      // Calculate rotation to land on target segment
      // Each segment is 45 degrees (360/8)
      const segmentAngle = 360 / SEGMENTS.length;
      // We want the pointer (at top) to point to the middle of the target segment
      // Segments are drawn starting from -90 degrees (top), going clockwise
      const targetAngle = targetIndex * segmentAngle;
      
      // Add multiple full rotations plus the angle to reach target
      // We spin in the opposite direction of segment index (counter-clockwise visually)
      const spins = 6 + Math.random() * 2; // 6-8 full spins
      const finalRotation = rotation + (spins * 360) + (360 - targetAngle);
      
      setRotation(finalRotation);
      
      // Start tick sounds
      let tickCount = 0;
      const maxTicks = 60;
      tickIntervalRef.current = setInterval(() => {
        tickCount++;
        // Slow down tick sounds as we approach the end
        if (tickCount < maxTicks * 0.7) {
          playTickSound();
        } else if (tickCount % 3 === 0) {
          playTickSound();
        }
        
        if (tickCount >= maxTicks) {
          if (tickIntervalRef.current) {
            clearInterval(tickIntervalRef.current);
          }
        }
      }, 60);
      
      // Complete the spin after animation
      setTimeout(() => {
        setIsAnimating(false);
        
        // Play win sound if it's a winning result
        if (targetResult && !targetResult.includes('LOSE')) {
          playWinSound();
        }
        
        onSpinComplete(targetResult);
      }, 4500);
    }
  }, [isSpinning, targetResult, isAnimating, onSpinComplete, playSpinSound, playTickSound, playWinSound, rotation]);

  // Cleanup tick interval
  useEffect(() => {
    return () => {
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center">
      {/* Outer glow ring */}
      <div className={`absolute inset-0 -m-8 rounded-full bg-gradient-to-r from-pi-purple via-gold to-pi-purple blur-xl transition-opacity duration-300 ${
        isSpinning ? 'opacity-60 animate-pulse' : 'opacity-30'
      }`} />
      
      {/* Wheel container */}
      <div className="relative">
        {/* Pointer */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
          <motion.div 
            className="w-0 h-0 border-l-[20px] border-r-[20px] border-t-[30px] border-l-transparent border-r-transparent border-t-gold drop-shadow-lg"
            animate={isSpinning ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.2, repeat: isSpinning ? Infinity : 0 }}
          />
        </div>
        
        {/* Wheel */}
        <motion.div
          className="relative w-72 h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-full border-8 border-gold shadow-2xl overflow-hidden"
          animate={{ rotate: rotation }}
          transition={{ 
            duration: 4.5, 
            ease: [0.2, 0.8, 0.2, 1] // Custom easing for realistic spin
          }}
          style={{ transformOrigin: "center center" }}
        >
          {/* Segments */}
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {SEGMENTS.map((segment, index) => {
              const angle = 360 / SEGMENTS.length;
              const startAngle = index * angle - 90;
              const endAngle = startAngle + angle;
              
              const startRad = (startAngle * Math.PI) / 180;
              const endRad = (endAngle * Math.PI) / 180;
              
              const x1 = 50 + 50 * Math.cos(startRad);
              const y1 = 50 + 50 * Math.sin(startRad);
              const x2 = 50 + 50 * Math.cos(endRad);
              const y2 = 50 + 50 * Math.sin(endRad);
              
              const largeArc = angle > 180 ? 1 : 0;
              
              const pathD = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`;
              
              const midAngle = startAngle + angle / 2;
              const midRad = (midAngle * Math.PI) / 180;
              const textX = 50 + 32 * Math.cos(midRad);
              const textY = 50 + 32 * Math.sin(midRad);
              
              const isGold = segment.prize === "JACKPOT_ENTRY" || segment.prize === "FREE_SPIN" || segment.prize === "NFT_ENTRY";
              const isPurple = segment.prize.includes("PI");
              
              return (
                <g key={index}>
                  <defs>
                    <linearGradient id={`grad-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={isGold ? "#F5C542" : isPurple ? "#9B5DE5" : "#2D2640"} />
                      <stop offset="100%" stopColor={isGold ? "#C9A227" : isPurple ? "#7D3CF0" : "#1A1528"} />
                    </linearGradient>
                  </defs>
                  <path
                    d={pathD}
                    fill={`url(#grad-${index})`}
                    stroke="hsl(var(--gold))"
                    strokeWidth="0.5"
                  />
                  <text
                    x={textX}
                    y={textY}
                    fill={isGold || isPurple ? "#0E0B16" : "#F5F5F5"}
                    fontSize="5"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${midAngle + 90}, ${textX}, ${textY})`}
                    className="font-display"
                  >
                    {segment.label}
                  </text>
                </g>
              );
            })}
            {/* Center circle */}
            <circle cx="50" cy="50" r="12" fill="url(#center-grad)" stroke="#F5C542" strokeWidth="2" />
            <defs>
              <radialGradient id="center-grad">
                <stop offset="0%" stopColor="#7D3CF0" />
                <stop offset="100%" stopColor="#4A1F8C" />
              </radialGradient>
            </defs>
            <text x="50" y="52" fill="#F5C542" fontSize="8" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">π</text>
          </svg>
        </motion.div>
        
        {/* Decorative dots around wheel */}
        <div className="absolute inset-0 -m-4">
          {[...Array(16)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-3 h-3 rounded-full ${isSpinning ? 'bg-gold' : 'bg-gold/70'}`}
              style={{
                top: `${50 + 48 * Math.sin((i * 22.5 * Math.PI) / 180)}%`,
                left: `${50 + 48 * Math.cos((i * 22.5 * Math.PI) / 180)}%`,
                transform: "translate(-50%, -50%)",
              }}
              animate={isSpinning ? { 
                scale: [1, 1.3, 1],
                opacity: [0.7, 1, 0.7]
              } : {}}
              transition={{
                duration: 0.5,
                repeat: isSpinning ? Infinity : 0,
                delay: i * 0.05,
              }}
            />
          ))}
        </div>
      </div>

      {/* Status indicator */}
      <motion.div
        className="mt-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {isSpinning ? (
          <motion.p 
            className="text-lg font-display font-bold text-gold"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            Spinning...
          </motion.p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Select a spin type below to play
          </p>
        )}
      </motion.div>
    </div>
  );
}
