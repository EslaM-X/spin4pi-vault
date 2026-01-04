import { motion } from "framer-motion";
import { Lock, Gift, Trophy, Coins, Sparkles, Shield } from "lucide-react";

const features = [
  {
    icon: Gift,
    title: "Daily Free Spin",
    description: "Get one free spin every 24 hours. No Pi required!",
    color: "text-emerald-400",
  },
  {
    icon: Trophy,
    title: "Jackpot Pool",
    description: "5% of every paid spin goes to the jackpot pool.",
    color: "text-gold",
  },
  {
    icon: Sparkles,
    title: "NFT Wheel",
    description: "Exclusive NFT rewards with special utility.",
    color: "text-pi-purple-glow",
  },
  {
    icon: Coins,
    title: "Instant Rewards",
    description: "Win Pi instantly with every spin.",
    color: "text-amber-400",
  },
  {
    icon: Lock,
    title: "VIP Access",
    description: "Stake S4P tokens for better odds.",
    color: "text-cyan-400",
  },
  {
    icon: Shield,
    title: "Pi Network Secure",
    description: "Official Pi SDK integration for safe payments.",
    color: "text-violet-400",
  },
];

export function Features() {
  return (
    <section className="py-16">
      <motion.h2
        className="text-3xl md:text-4xl font-display font-bold text-center mb-12 text-gradient-gold"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        Why Play Spin4Pi?
      </motion.h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          
          return (
            <motion.div
              key={feature.title}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-card to-muted/50 border border-border p-6 hover:border-gold/50 transition-all"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-pi-purple/5 to-gold/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative">
                <div className={`w-14 h-14 rounded-xl bg-muted flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-7 h-7 ${feature.color}`} />
                </div>
                
                <h3 className="text-xl font-display font-bold mb-2 text-foreground group-hover:text-gold transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
