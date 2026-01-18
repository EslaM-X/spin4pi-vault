import { motion, AnimatePresence } from "framer-motion";
import { Coins, Flame, TrendingUp, ShieldCheck, Zap, ArrowUpRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface S4PTokenDisplayProps {
  balance: number;
  isBurning?: boolean; // خاصية تفعيل أنميشن الحرق عند الشراء
}

export function S4PTokenDisplay({ balance, isBurning = false }: S4PTokenDisplayProps) {
  return (
    <div className="flex items-center gap-3 bg-black/60 border border-gold/20 rounded-full pl-1 pr-4 py-1.5 backdrop-blur-md relative overflow-hidden group">
      {/* تأثير الحرق (Burn Animation) */}
      <AnimatePresence>
        {isBurning && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: -20 }}
            exit={{ opacity: 0 }}
            className="absolute right-4 top-0 pointer-events-none"
          >
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-bounce" />
            <span className="text-[8px] font-black text-orange-500">-10% BURN</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* العملة المعدنية الدائرية */}
      <div className="relative group">
        <div className="w-10 h-10 rounded-full bg-gradient-to-b from-[#FFE38E] via-[#EAB308] to-[#854D0E] p-[1.5px] shadow-[0_0_15px_rgba(234,179,8,0.2)] group-hover:shadow-gold/40 transition-all duration-500">
          <div className="w-full h-full rounded-full bg-[#0d0d12] flex items-center justify-center overflow-hidden relative border border-black/20">
            {/* الشعار - سيتم استبداله بشعار تطبيقك دائرياً */}
            <div className="w-7 h-7 bg-gold/10 rounded-full flex items-center justify-center border border-gold/20 z-10">
               <span className="text-[8px] font-black text-gold tracking-tighter">S4P</span>
            </div>
            {/* لمعة العملة المعدنية */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent rotate-12 group-hover:translate-x-full transition-transform duration-1000" />
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-1.5">
          <AnimatePresence mode="wait">
            <motion.span
              key={balance}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-black text-white text-base leading-none tracking-tight italic"
              style={{ fontFamily: 'Cinzel, serif' }}
            >
              {balance.toLocaleString()}
            </motion.span>
          </AnimatePresence>
          <span className="text-[10px] font-black text-gold/80 uppercase tracking-tighter">S4P</span>
        </div>
        <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
          <TrendingUp className="w-2 h-2 text-emerald-500" />
          <span className="text-[7px] font-black text-white uppercase tracking-[0.2em]">Imperial Value</span>
        </div>
      </div>
    </div>
  );
}

export function S4PTokenInfo({ className }: { className?: string }) {
  const mechanisms = [
    { 
      icon: Zap, 
      title: "Utility", 
      desc: "Buy extra spins & premium perks", 
      color: "text-amber-400" 
    },
    { 
      icon: Flame, 
      title: "Deflationary", 
      desc: "10% of tokens used are permanently burned", 
      color: "text-orange-500" 
    },
    { 
      icon: ShieldCheck, 
      title: "Governance", 
      desc: "Vote on future jackpot pools", 
      color: "text-blue-400" 
    }
  ];

  return (
    <div className={`relative bg-[#0d0d12]/95 border-2 border-gold/10 rounded-[2.5rem] p-7 overflow-hidden backdrop-blur-2xl shadow-2xl ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h3 className="font-black text-xl text-white italic tracking-widest uppercase" style={{ fontFamily: 'Cinzel, serif' }}>
            Token <span className="text-gold">Economy</span>
          </h3>
          <p className="text-[9px] text-gold/40 font-bold uppercase tracking-[0.3em] mt-1">Sustainable Web3 Model</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-gold/5 border border-gold/20 flex items-center justify-center">
           <Coins className="w-6 h-6 text-gold animate-pulse" />
        </div>
      </div>
      
      {/* Mechanisms List */}
      <div className="space-y-4 relative z-10">
        {mechanisms.map((m, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-gold/20 transition-all group">
            <div className={`p-2.5 rounded-xl bg-black border border-white/5 ${m.color} group-hover:scale-110 transition-transform`}>
              <m.icon className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-black text-white uppercase tracking-wider">{m.title}</span>
              <span className="text-[10px] text-white/40 font-medium">{m.desc}</span>
            </div>
          </div>
        ))}
      </div>

      

      {/* Burn Stats Footnote */}
      <div className="mt-8 pt-6 border-t border-white/5 relative z-10">
        <div className="bg-orange-500/5 border border-orange-500/10 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
            <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest">Deflation Protocol Active</span>
          </div>
          <ArrowUpRight className="w-3 h-3 text-orange-500" />
        </div>
        <p className="text-[8px] text-center text-white/20 italic mt-4">
          Token burn mechanism verified for Pi Network App-Token Compliance.
        </p>
      </div>
    </div>
  );
}
