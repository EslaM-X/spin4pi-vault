import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Scale, AlertCircle, Check } from 'lucide-react';

interface LegalModalProps {
  isOpenExternal?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

export function LegalConsentModal({ isOpenExternal, onClose, onSuccess }: LegalModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const openSound = useRef<HTMLAudioElement | null>(null);
  const successSound = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // 1. فحص هل المستخدم وافق مسبقاً؟ إذا نعم، لا تفعل شيئاً أبداً
    const hasConsented = localStorage.getItem('imperial_legal_consent');
    if (hasConsented && !isOpenExternal) return;

    // تحميل الأصوات فقط إذا كنا سنعرض المودال
    openSound.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
    successSound.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3');
    if (openSound.current) openSound.current.volume = 0.3;

    if (isOpenExternal) {
      setIsOpen(true);
      openSound.current?.play().catch(() => {});
    } else {
      // ظهور ناعم بعد تأخير بسيط لتقليل الانزعاج
      const timer = setTimeout(() => {
        setIsOpen(true);
        openSound.current?.play().catch(() => {});
      }, 1500); 
      return () => clearTimeout(timer);
    }
  }, [isOpenExternal]);

  const handleAccept = () => {
    successSound.current?.play().catch(() => {});
    localStorage.setItem('imperial_legal_consent', 'true');
    
    // إغلاق ناعم وسريع
    setIsOpen(false);
    setTimeout(() => {
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    }, 200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          {/* Overlay - تعتيم ناعم وليس كلي */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {/* منع الإغلاق عند الضغط في الخارج لضمان الموافقة */}}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm bg-[#0d0d12] border border-gold/20 rounded-[24px] overflow-hidden shadow-2xl"
          >
            {/* الترويسة - فخمة ومختصرة */}
            <div className="bg-gradient-to-b from-gold/10 to-transparent p-6 text-center">
              <div className="w-12 h-12 bg-gold/10 border border-gold/20 rounded-xl flex items-center justify-center text-gold mx-auto mb-3">
                <ShieldCheck size={24} />
              </div>
              <h2 className="text-lg font-black text-white uppercase tracking-tighter italic">Imperial <span className="text-gold">Protocols</span></h2>
            </div>

            {/* المحتوى - مباشر وأيقوني لسهولة القراءة */}
            <div className="px-6 pb-6 space-y-3">
              <div className="flex gap-3 items-start bg-white/[0.03] p-3 rounded-xl border border-white/5">
                <Scale className="text-gold shrink-0 mt-0.5" size={16} />
                <p className="text-[10px] text-white/60 leading-tight">
                  I agree to the <span className="text-gold/80">Terms of Service</span> & <span className="text-gold/80">Privacy Policy</span>.
                </p>
              </div>

              <div className="flex gap-3 items-start bg-red-500/5 p-3 rounded-xl border border-red-500/10">
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
                <p className="text-[9px] text-red-200/50 leading-tight uppercase font-bold tracking-tighter italic">
                  Entertainment only. No guarantee of profit. Outcomes are final.
                </p>
              </div>

              {/* زر الموافقة - كبير وواضح */}
              <button 
                onClick={handleAccept} 
                className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-gold to-[#B8860B] text-black font-black uppercase tracking-[1px] text-[11px] shadow-lg hover:shadow-gold/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                Accept Protocols
                <Check size={16} strokeWidth={3} />
              </button>

              <p className="text-[7px] text-center text-white/20 uppercase tracking-[2px] font-bold">
                Authorized Pi Utility Interface
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
