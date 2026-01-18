import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Scale, AlertCircle, Check } from 'lucide-react';

interface LegalModalProps {
  isOpenExternal?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

export function LegalConsentModal({ isOpenExternal, onClose, onSuccess }: LegalModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // إذا كان هناك أمر فتح خارجي من الأزرار
    if (isOpenExternal) {
      setIsOpen(true);
    } else {
      // الفحص التلقائي العادي عند أول دخول
      const hasConsented = localStorage.getItem('imperial_legal_consent');
      if (!hasConsented) {
        const timer = setTimeout(() => setIsOpen(true), 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [isOpenExternal]);

  const handleAccept = () => {
    localStorage.setItem('imperial_legal_consent', 'true');
    setIsOpen(false);
    if (onSuccess) onSuccess(); // تنفيذ الدخول تلقائياً بعد الضغط على Accept
    if (onClose) onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000001] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            className="relative w-full max-w-md bg-[#0d0d12] border border-gold/30 rounded-[32px] overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.2)]"
          >
            <div className="bg-gradient-to-b from-gold/10 to-transparent p-8 text-center border-b border-white/5">
              <div className="w-16 h-16 bg-gold rounded-2xl flex items-center justify-center text-black mx-auto mb-4">
                <ShieldCheck size={32} strokeWidth={2.5} />
              </div>
              <h2 className="text-xl font-black text-white uppercase italic tracking-tight">Imperial <span className="text-gold">Protocols</span></h2>
              <p className="text-[10px] text-gold/60 font-bold tracking-[2px] uppercase mt-1">Compliance & Safety Review</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex gap-4 items-start bg-white/5 p-4 rounded-2xl border border-white/5">
                <Scale className="text-gold shrink-0" size={20} />
                <p className="text-[11px] text-white/70 leading-relaxed text-left">
                  By proceeding, you acknowledge that you have read and agree to the <span className="text-white font-bold">Terms of Service</span> and <span className="text-white font-bold">Privacy Policy</span>.
                </p>
              </div>
              <div className="flex gap-4 items-start bg-red-500/5 p-4 rounded-2xl border border-red-500/10">
                <AlertCircle className="text-red-500 shrink-0" size={20} />
                <p className="text-[11px] text-red-400/80 leading-relaxed italic uppercase font-bold tracking-tighter text-left">
                  Entertainment only. No guarantee of profit. All outcomes are randomized and final.
                </p>
              </div>
            </div>

            <div className="p-6 pt-0">
              <button onClick={handleAccept} className="w-full py-4 rounded-2xl bg-gradient-to-r from-gold to-[#B8860B] text-black font-black uppercase tracking-[2px] text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 group">
                <span>Accept Imperial Terms</span>
                <Check size={18} strokeWidth={3} />
              </button>
              <p className="text-[8px] text-center text-white/20 mt-4 uppercase tracking-[3px] font-bold">Independent Pi Ecosystem App</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
