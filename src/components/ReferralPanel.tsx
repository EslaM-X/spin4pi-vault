import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Copy, Check, Share2, Target, Trophy, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ReferralPanelProps {
  referralCode: string;
  referralCount: number;
  referralSpinsEarned: number;
}

export function ReferralPanel({ referralCode, referralCount, referralSpinsEarned }: ReferralPanelProps) {
  const [copied, setCopied] = useState(false);

  const referralLink = `${window.location.origin}?ref=${referralCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Recruitment link secured!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      className="relative bg-[#0d0d12]/90 border-2 border-gold/10 rounded-[2.5rem] p-8 overflow-hidden backdrop-blur-xl group hover:border-gold/30 transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Background Decor */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-gold/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Header Section */}
      <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-gold/10 rounded-2xl border border-gold/20">
            <Users className="w-7 h-7 text-gold" />
          </div>
          <div>
            <h3 className="font-black text-white italic uppercase tracking-widest text-xl" style={{ fontFamily: 'Cinzel, serif' }}>
              Imperial <span className="text-gold">Recruitment</span>
            </h3>
            <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.25em]">Build your loyal legion</p>
          </div>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <div className="p-2 bg-white/5 rounded-full border border-white/10 hover:bg-gold/10 transition-colors">
                <Info className="w-4 h-4 text-gold/60" />
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-black border-gold/20 text-white text-[10px] uppercase font-bold p-3">
              Rewards are granted for active recruits only.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="space-y-8">
        {/* Quality Referral Rules - واضحة وجذابة جداً */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 group/card hover:bg-white/[0.04] transition-all">
            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center font-black text-gold border border-gold/20 shadow-lg shadow-gold/5">1</div>
            <div>
              <p className="text-[11px] font-black text-white uppercase tracking-wider mb-1">Ally Registration</p>
              <p className="text-xs text-white/50 leading-relaxed">+1 Imperial Free Spin</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-gold/[0.03] border border-gold/10 group/card hover:bg-gold/[0.05] transition-all">
            <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center font-black text-gold border border-gold/40 shadow-lg shadow-gold/10">2</div>
            <div>
              <p className="text-[11px] font-black text-gold uppercase tracking-wider mb-1">Engagement Bonus</p>
              <p className="text-xs text-white/50 leading-relaxed">+1 Additional Spin after 10 plays</p>
            </div>
          </div>
        </div>

        {/* Link Box */}
        <div className="space-y-3">
          <div className="flex justify-between items-end px-2">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Unique Recruitment Link</label>
            <Share2 className="w-3 h-3 text-gold/40" />
          </div>
          <div className="relative group/link">
            <div className="bg-black/60 border border-white/10 rounded-2xl p-4 flex items-center gap-4 transition-all group-hover/link:border-gold/40 shadow-inner">
              <code className="flex-1 text-[11px] text-gold font-mono truncate tracking-tight">{referralLink}</code>
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={copyLink}
                className="h-11 w-11 rounded-xl bg-gold/10 hover:bg-gold hover:text-black transition-all shadow-lg"
              >
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <Check className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <Copy className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </div>
          </div>
        </div>

        {/* Real-time Stats */}
        <div className="grid grid-cols-2 gap-6 pt-4">
          <div className="relative group/stat p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] text-center hover:border-white/20 transition-all">
            <div className="text-4xl font-black text-white tracking-tighter mb-2 italic" style={{ fontFamily: 'Cinzel, serif' }}>{referralCount}</div>
            <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
              <Users className="w-3 h-3" />
              Legion
            </div>
          </div>

          <div className="relative group/stat p-6 bg-gold/[0.03] border border-gold/10 rounded-[2rem] text-center hover:border-gold/30 transition-all shadow-[0_10px_30px_rgba(251,191,36,0.05)]">
            <div className="text-4xl font-black text-gold tracking-tighter mb-2 italic" style={{ fontFamily: 'Cinzel, serif' }}>{referralSpinsEarned}</div>
            <div className="text-[10px] font-black text-gold/40 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
              <Target className="w-3 h-3" />
              Tributes
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
