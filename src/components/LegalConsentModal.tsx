import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Scale, AlertCircle, Check } from 'lucide-react';

export function LegalConsentModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // التحقق مما إذا كان المستخدم قد وافق مسبقاً
    const hasConsented = localStorage.getItem('imperial_legal_consent');
    if (!hasConsented) {
      const timer = setTimeout(() => setIsOpen(true), 1500); // يظهر بعد ثانية ونصف من الدخول
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('imperial_legal_consent', 'true');
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-[#0d0d12] border border-gold/30 rounded-[32px] overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.15)]"
          >
            {/* Imperial Header */}
            <div className="bg-gradient-to-b from-gold/10 to-transparent p-8 text-center border-b border-white/5">
              <div className="w-16 h-16 bg-gold rounded-2xl flex items-center justify-center text-black mx-auto mb-4 shadow-[0_0_20px_rgba(212,175,55,0.4)]">
                <ShieldCheck size={32} strokeWidth={2.5} />
              </div>
              <h2 className="text-xl font-black text-white uppercase italic tracking-tight">
                Imperial <span className="text-gold">Protocols</span>
              </h2>
              <p className="text-[10px] text-gold/60 font-bold tracking-[2px] uppercase mt-1">Review & Acceptance Required</p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="flex gap-4 items-start bg-white/5 p-4 rounded-2xl border border-white/5">
                <Scale className="text-gold shrink-0" size={20} />
                <p className="text-[11px] text-white/70 leading-relaxed">
                  بمتابعتك، أنت تقر بأنك قرأت وتوافق على <span className="text-white font-bold">شروط الخدمة</span> و <span className="text-white font-bold">سياسة الخصوصية</span> الإمبراطورية.
                </p>
              </div>

              <div className="flex gap-4 items-start bg-red-500/5 p-4 rounded-2xl border border-red-500/10">
                <AlertCircle className="text-red-500 shrink-0" size={20} />
                <p className="text-[11px] text-red-400/80 leading-relaxed italic">
                  أنت تدرك أن هذا التطبيق للأغراض الترفيهية فقط، ولا يوجد ضمان لأي نتائج مادية.
                </p>
              </div>
            </div>

            {/* Action Button */}
            <div className="p-6 pt-0">
              <button
                onClick={handleAccept}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-gold to-[#B8860B] text-black font-black uppercase tracking-[2px] text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 group"
              >
                <span>Accept Imperial Terms</span>
                <Check size={18} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <p className="text-[8px] text-center text-white/20 mt-4 uppercase tracking-widest font-bold">
                Certified Pi Network Ecosystem Participant
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
