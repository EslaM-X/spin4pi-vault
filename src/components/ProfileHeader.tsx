import { motion } from "framer-motion";
import { User, Crown, Shield, Wallet, Star } from "lucide-react";

interface ProfileHeaderProps {
  piUsername: string | null;
  balance: number;
  rank?: string;
}

export function ProfileHeader({ piUsername, balance, rank = "Imperial Spinner" }: ProfileHeaderProps) {
  return (
    <motion.div 
      className="relative w-full mb-8"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Container الرئيسي بتأثير زجاجي فخم */}
      <div className="relative overflow-hidden bg-[#0d0d12]/80 backdrop-blur-2xl border-2 border-gold/20 rounded-[2.5rem] p-6 shadow-2xl">
        
        {/* إضاءة خلفية خافتة */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-gold/5 blur-[50px] rounded-full -translate-x-10 -translate-y-10" />

        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          
          {/* صورة المستخدم / Avatar الملكي */}
          <div className="relative group">
            <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-[#1a1a1a] to-black border-2 border-gold/40 flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform duration-500 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
              <User className="w-12 h-12 text-gold/80" />
            </div>
            {/* أيقونة التاج فوق الأفاتار */}
            <motion.div 
              className="absolute -top-3 -right-3 bg-gold p-1.5 rounded-xl shadow-lg"
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              <Crown className="w-5 h-5 text-black" strokeWidth={2.5} />
            </motion.div>
          </div>

          {/* معلومات المستخدم */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight" style={{ fontFamily: 'Cinzel, serif' }}>
                {piUsername || "Noble Guest"}
              </h2>
              <Shield className="w-4 h-4 text-gold fill-gold/10" />
            </div>
            
            <div className="flex items-center justify-center md:justify-start gap-3">
              <span className="bg-white/5 border border-white/10 px-3 py-0.5 rounded-full text-[10px] font-black text-gold uppercase tracking-widest">
                {rank}
              </span>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3 h-3 ${i < 4 ? 'text-gold fill-gold' : 'text-white/10'}`} />
                ))}
              </div>
            </div>
          </div>

          {/* محفظة الرصيد (Wallet) */}
          <div className="w-full md:w-auto mt-4 md:mt-0">
            <div className="bg-gradient-to-r from-gold/10 to-transparent border-l-4 border-gold p-4 rounded-2xl backdrop-blur-md">
              <div className="flex items-center gap-3 mb-1">
                <Wallet className="w-4 h-4 text-gold" />
                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Imperial Balance</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-gold tracking-tighter italic">
                  {balance.toFixed(4)}
                </span>
                <span className="text-lg font-black text-gold/60 italic">π</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
