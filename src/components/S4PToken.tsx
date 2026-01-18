import { motion, AnimatePresence } from "framer-motion";
import { Coins, Sparkles, TrendingUp, ShieldCheck, Zap, Gem, ArrowLeftRight, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface S4PTokenDisplayProps {
  balance: number;
  showAnimation?: boolean;
}

export function S4PTokenDisplay({ balance, showAnimation = false }: S4PTokenDisplayProps) {
  return (
    <motion.div
      className="group relative flex items-center gap-3 bg-black/40 border border-gold/20 rounded-2xl px-4 py-2 hover:border-gold/50 transition-all duration-500 overflow-hidden backdrop-blur-md"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-gold/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* S4P Token Branding */}
      <div className="relative">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold via-amber-400 to-amber-700 flex items-center justify-center shadow-lg border border-white/10 transform transition-transform group-hover:scale-110">
          <span className="text-[10px] font-black text-black italic">S4P</span>
        </div>
        {showAnimation && (
          <motion.div
            className="absolute inset-0 rounded-xl bg-gold/40"
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </div>
      
      <div className="flex flex-col">
        <span className="text-[8px] font-black text-gold/40 uppercase tracking-[0.25em] leading-none mb-1">In-App Token Balance</span>
        <AnimatePresence mode="wait">
          <motion.div
            key={balance}
            className="flex items-baseline gap-1"
            initial={{ y: -5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <span className="font-black text-white text-xl tracking-tight italic" style={{ fontFamily: 'Cinzel, serif' }}>
              {balance.toLocaleString()}
            </span>
            <span className="text-[10px] font-bold text-gold/60 uppercase">S4P</span>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function S4PTokenInfo({ className }: { className?: string }) {
  const handleBridge = () => {
    toast.info("Connecting to Pi Wallet via SDK...", {
      description: "Preparing P2S Token Transaction",
      icon: <Wallet className="w-4 h-4 text-gold" />
    });
  };

  const features = [
    { icon: ArrowLeftRight, text: "Swap S4P to Pi via App DEX", color: "text-amber-400" },
    { icon: Gem, text: "Exclusive NFT Minting Access", color: "text-emerald-400" },
    { icon: ShieldCheck, text: "Stake for Pi Network Governance", color: "text-blue-400" },
  ];

  return (
    <div className={`relative bg-[#0d0d12]/95 border-2 border-gold/15 rounded-[2.5rem] p-7 overflow-hidden backdrop-blur-2xl shadow-2xl ${className}`}>
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-[60px] rounded-full" />
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center border border-gold/30">
             <Coins className="w-7 h-7 text-gold animate-pulse" />
          </div>
          <div>
            <h3 className="font-black text-lg text-white italic tracking-widest uppercase" style={{ fontFamily: 'Cinzel, serif' }}>
              S4P <span className="text-gold">Protocol</span>
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[9px] text-emerald-500/80 font-black uppercase tracking-widest">Mainnet Bridge Active</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-4 relative z-10">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-gold/20 transition-all group">
            <div className={`p-2 rounded-lg bg-white/5 ${feature.color}`}>
              <feature.icon className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-white/50 group-hover:text-white transition-colors">{feature.text}</span>
          </div>
        ))}
      </div>
      
      {/* Pi SDK Action Button */}
      <div className="mt-8 space-y-3 relative z-10">
        <Button 
          onClick={handleBridge}
          className="w-full h-12 bg-gold hover:bg-gold/80 text-black font-black uppercase tracking-[0.15em] rounded-xl shadow-lg shadow-gold/10 gap-2"
        >
          <ArrowLeftRight className="w-4 h-4" />
          Wallet Bridge (P2S)
        </Button>
        
        <div className="pt-4 border-t border-white/5 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest opacity-30">
            <span>Blockchain Standard</span>
            <span>Pi App-Token (PAT-1)</span>
          </div>
          <p className="text-[8px] text-center text-white/20 italic">
            Compliant with Pi Platform Document Section: App Tokens SDK v2
          </p>
        </div>
      </div>
    </div>
  );
}
