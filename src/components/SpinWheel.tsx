import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SpinWheelProps {
  onSpinComplete: (result: string) => void;
  isSpinning: boolean;
  setIsSpinning: (spinning: boolean) => void;
}

const SEGMENTS = [
  { label: "0.01 π", color: "from-pi-purple to-pi-purple-dark", prize: "0.01_PI" },
  { label: "LOSE", color: "from-muted to-card", prize: "LOSE" },
  { label: "FREE", color: "from-gold to-gold-dark", prize: "FREE_SPIN" },
  { label: "LOSE", color: "from-muted to-card", prize: "LOSE" },
  { label: "0.05 π", color: "from-pi-purple-glow to-pi-purple", prize: "0.05_PI" },
  { label: "LOSE", color: "from-muted to-card", prize: "LOSE" },
  { label: "NFT", color: "from-gold-glow to-gold", prize: "NFT_ENTRY" },
  { label: "JACKPOT", color: "from-secondary to-gold-dark", prize: "JACKPOT_ENTRY" },
];

export function SpinWheel({ onSpinComplete, isSpinning, setIsSpinning }: SpinWheelProps) {
  const [rotation, setRotation] = useState(0);

  const handleSpin = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    
    // Random rotation between 5-10 full spins + random segment
    const spins = 5 + Math.random() * 5;
    const segmentAngle = 360 / SEGMENTS.length;
    const randomSegment = Math.floor(Math.random() * SEGMENTS.length);
    const finalRotation = rotation + (spins * 360) + (randomSegment * segmentAngle);
    
    setRotation(finalRotation);
    
    setTimeout(() => {
      const result = SEGMENTS[randomSegment];
      onSpinComplete(result.prize);
      setIsSpinning(false);
    }, 4000);
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Outer glow ring */}
      <div className="absolute inset-0 -m-8 rounded-full bg-gradient-to-r from-pi-purple via-gold to-pi-purple opacity-30 blur-xl animate-pulse-glow" />
      
      {/* Wheel container */}
      <div className="relative">
        {/* Pointer */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
          <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-t-[30px] border-l-transparent border-r-transparent border-t-gold drop-shadow-lg" />
        </div>
        
        {/* Wheel */}
        <motion.div
          className="relative w-72 h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-full border-8 border-gold shadow-2xl overflow-hidden"
          animate={{ rotate: rotation }}
          transition={{ duration: 4, ease: [0.17, 0.67, 0.12, 0.99] }}
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
            <div
              key={i}
              className="absolute w-3 h-3 rounded-full bg-gold animate-pulse"
              style={{
                top: `${50 + 48 * Math.sin((i * 22.5 * Math.PI) / 180)}%`,
                left: `${50 + 48 * Math.cos((i * 22.5 * Math.PI) / 180)}%`,
                transform: "translate(-50%, -50%)",
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Spin button */}
      <motion.button
        onClick={handleSpin}
        disabled={isSpinning}
        className="mt-8 px-12 py-4 bg-gradient-to-r from-gold to-gold-dark text-dark-space font-display font-bold text-xl rounded-full shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        whileHover={{ scale: isSpinning ? 1 : 1.05 }}
        whileTap={{ scale: isSpinning ? 1 : 0.95 }}
      >
        {isSpinning ? "SPINNING..." : "SPIN NOW!"}
      </motion.button>
    </div>
  );
}
