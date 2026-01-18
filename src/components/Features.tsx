import { motion } from "framer-motion";
import { Lock, Gift, Trophy, Coins, Sparkles, Shield, Zap, Crown } from "lucide-react";

const features = [
  {
    icon: Gift,
    title: "Daily Tribute",
    description: "Claim your imperial gift every 24 hours. Loyalty is always rewarded.",
    color: "text-emerald-400",
    glow: "shadow-emerald-500/20",
  },
  {
    icon: Trophy,
    title: "The Grand Jackpot",
    description: "5% of every battle contribution flows into the communal treasury.",
    color: "text-gold",
    glow: "shadow-gold/20",
  },
  {
    icon: Sparkles,
    title: "Mystic NFT Wheel",
    description: "Unveil rare artifacts with special powers and high-tier utility.",
    color: "text-pi-purple-glow",
    glow: "shadow-purple-500/20",
  },
  {
    icon: Coins,
    title: "Instant Treasury",
    description: "Winnings are transferred to your vault instantly with zero delay.",
    color: "text-amber-400",
    glow: "shadow-amber-500/20",
  },
  {
    icon: Lock,
    title: "VIP Hegemony",
    description: "Stake S4P tokens to unlock elite odds and secret wheel tiers.",
    color: "text-cyan-400",
    glow: "shadow-cyan-500/20",
  },
  {
    icon: Shield,
    title: "Imperial Security",
    description: "Powered by Pi Network's official SDK for absolute transaction safety.",
    color: "text-violet-400",
    glow: "shadow-violet-500/20",
  },
];

export function Features() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gold/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 container mx-auto px-6">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 bg-gold/10 px-4 py-1.5 rounded-full border border-gold/20 mb-4">
            <Crown className="w-4 h-4 text-gold" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gold">Elite Ecosystem</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter" style={{ fontFamily: 'Cinzel, serif' }}>
            The Pillars of <span className="text-gold">Fortune</span>
          </h2>
          <p className="text-white/40 text-sm max-w-xl mx-auto mt-4 font-medium italic">
            "Where ancient luck meets the modern blockchain empire."
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            
            return (
              <motion.div
                key={feature.title}
                className="group relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Card Main Body */}
                <div className="relative z-10 h-full rounded-[2.5rem] bg-[#0d0d12]/80 border border-white/5 p-8 transition-all duration-500 group-hover:border-gold/40 group-hover:translate-y-[-8px] backdrop-blur-md">
                  
                  {/* Decorative corner accent */}
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Zap className="w-4 h-4 text-gold/30" />
                  </div>

                  <div className={`w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-8 transition-all duration-500 group-hover:rotate-6 group-hover:bg-gold/10 group-hover:border-gold/20 ${feature.glow}`}>
                    <Icon className={`w-8 h-8 ${feature.color} transition-transform group-hover:scale-110`} />
                  </div>
                  
                  <h3 className="text-xl font-black mb-3 text-white uppercase italic tracking-tight group-hover:text-gold transition-colors" style={{ fontFamily: 'Cinzel, serif' }}>
                    {feature.title}
                  </h3>
                  
                  <p className="text-white/40 text-sm leading-relaxed font-medium">
                    {feature.description}
                  </p>

                  {/* Bottom Line Decor */}
                  <div className="mt-6 h-1 w-0 bg-gold/50 transition-all duration-500 group-hover:w-12 rounded-full" />
                </div>

                {/* Hover Shadow Glow */}
                <div className="absolute inset-0 bg-gold/5 blur-2xl rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
