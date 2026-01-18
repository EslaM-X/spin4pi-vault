import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Flame, Sparkles } from "lucide-react";
import { useEffect, useState, useRef } from "react";

interface JackpotCounterProps {
  amount: number;
}

export function JackpotCounter({ amount }: JackpotCounterProps) {
  const [displayAmount, setDisplayAmount] = useState(amount);
  const prevAmountRef = useRef(amount);

  // أنيميشن لتحديث الرقم بشكل تدريجي (Count Up Effect)
  useEffect(() => {
    const duration = 1000; // مدة الحركة 1 ثانية
    const steps = 60;
    const increment = (amount - prevAmountRef.current) / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      setDisplayAmount((prev) => prev + increment);
      if (currentStep >= steps) {
        setDisplayAmount(amount);
        clearInterval(timer);
      }
    }, duration / steps);

    prevAmountRef.current = amount;
    return () => clearInterval(timer);
  }, [amount]);

  return (
    <motion.div
      className="relative overflow-hidden rounded-[2rem] bg-[#0d0d12] border-2 border-gold/40 p-8 shadow-[0_0_50px_rgba(251,191,36,0.2)]"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* تأثير اللهب الخلفي (Burning Glow) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold/20 via-transparent to-transparent opacity-50 animate-pulse" />
      
      {/* الخطوط المتحركة (Scanning Lines) */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />

      <div className="relative flex flex-col items-center gap-2">
        {/* العناوين مع أيقونات مشتعلة */}
        <div className="flex items-center gap-3 mb-1">
          <motion.div
            animate={{ y: [0, -5, 0], filter: ["drop-shadow(0 0 2px #fbbf24)", "drop-shadow(0 0 10px #fbbf24)", "drop-shadow(0 0 2px #fbbf24)"] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Flame className="w-6 h-6 text-gold fill-gold/20" />
          </motion.div>
          
          <p className="text-xs font-black text-gold/80 uppercase tracking-[0.4em] italic drop-shadow-sm">
            Imperial Grand Jackpot
          </p>

          <motion.div
            animate={{ y: [0, -5, 0], filter: ["drop-shadow(0 0 2px #fbbf24)", "drop-shadow(0 0 10px #fbbf24)", "drop-shadow(0 0 2px #fbbf24)"] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.75 }}
          >
            <Flame className="w-6 h-6 text-gold fill-gold/20" />
          </motion.div>
        </div>
        
        {/* العداد الرقمي الأسطوري */}
        <div className="flex items-center gap-4">
          <Trophy className="w-8 h-8 text-gold/40 hidden md:block" />
          
          <div className="relative">
            {/* انعكاس الضوء على الأرقام */}
            <motion.div 
              className="absolute -inset-2 bg-gold/10 blur-xl rounded-full"
              animate={{ opacity: [0, 0.5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            
            <motion.p
              key={amount} // سيومض الرقم عند كل تحديث
              initial={{ opacity: 0.8, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1.05 }}
              className="text-6xl md:text-7xl font-black text-white tracking-tighter flex items-baseline gap-2"
              style={{ fontFamily: "'Cinzel', serif", filter: "drop-shadow(0 0 15px rgba(251,191,36,0.5))" }}
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-gold to-gold-dark">
                {displayAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-3xl text-gold">π</span>
            </motion.p>
          </div>

          <Trophy className="w-8 h-8 text-gold/40 hidden md:block" />
        </div>

        {/* شريط التقدم السفلي أو الحالة */}
        <div className="mt-4 flex items-center gap-2 px-4 py-1 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
          <Sparkles className="w-3 h-3 text-gold animate-spin-slow" />
          <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">
            Pool increases with every spin
          </span>
        </div>
      </div>
      
      {/* الإطار النبضي المزدوج */}
      <motion.div
        className="absolute inset-0 rounded-[2rem] border-[3px] border-gold/20"
        animate={{ scale: [1, 1.02, 1], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      
      {/* جزيئات ذهبية متطايرة (فقط تأثير بصري CSS) */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gold rounded-full"
            initial={{ y: "100%", x: `${Math.random() * 100}%` }}
            animate={{ y: "-100%", opacity: [0, 1, 0] }}
            transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
          />
        ))}
      </div>
    </motion.div>
  );
}
