import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, Home, User, LogOut, ChevronRight, Music, ShieldCheck } from 'lucide-react';
import logoIcon from "@/assets/spin4pi-logo.png";

export function MobileMenu({ isLoggedIn, onLogout, balance = 0 }: any) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* الزر الأسطوري الذي تم استعادته وتطويره */}
      <div 
        onClick={() => setIsOpen(true)}
        className="relative flex flex-col gap-1 justify-center items-center active:scale-90 transition-all cursor-pointer"
        style={{ 
          width: '46px', height: '46px',
          background: 'rgba(168, 85, 247, 0.1)',
          border: '1.5px solid rgba(168, 85, 247, 0.4)',
          borderRadius: '14px',
          boxShadow: '0 0 15px rgba(168, 85, 247, 0.2)'
        }}
      >
        {/* تأثير التوهج الصغير خلف الزر */}
        <div className="absolute inset-0 bg-purple-500/10 blur-lg rounded-full pointer-events-none" />
        
        {/* الخطوط الأسطورية المتدرجة */}
        <span className="h-[2.5px] w-5 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full" />
        <span className="h-[2.5px] w-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full self-end mr-3" />
        <span className="h-[2.5px] w-5 bg-gradient-to-r from-pink-500 to-purple-400 rounded-full" />
      </div>

      <AnimatePresence>
        {isOpen && createPortal(
          <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 999999 }}>
            
            {/* خلفية زجاجية فخمة جداً */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-[15px]"
            />

            {/* البطاقة العائمة (The Portal Card) */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="relative w-[88%] max-w-[370px] bg-[#080809] border border-purple-500/30 rounded-[45px] p-8 flex flex-col items-center overflow-hidden shadow-[0_0_80px_rgba(168,85,247,0.2)]"
            >
              {/* شعاع ضوء علوي فخم */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

              {/* زر الإغلاق العصري */}
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-6 right-8 text-white/30 hover:text-white"
              >
                <X size={24} />
              </button>

              <img src={logoIcon} className="w-16 h-16 mb-4 drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]" />
              
              <div className="flex items-center gap-2 mb-8">
                <ShieldCheck size={12} className="text-purple-500" />
                <span className="text-[10px] text-white/40 font-black uppercase tracking-[0.3em]">Secure Terminal</span>
              </div>

              {/* الروابط بتصميم البطاقات الزجاجية */}
              <div className="w-full space-y-4 mb-8">
                <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center justify-between p-5 bg-white/[0.03] border border-white/[0.05] rounded-[24px] hover:bg-purple-500/10 transition-all no-underline group">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-purple-500/20 rounded-xl"><Home size={20} className="text-purple-400" /></div>
                    <span className="text-white font-bold text-sm tracking-wide">The Arena</span>
                  </div>
                  <ChevronRight size={18} className="text-white/20 group-hover:translate-x-1 transition-transform" />
                </Link>

                {isLoggedIn && (
                  <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center justify-between p-5 bg-white/[0.03] border border-white/[0.05] rounded-[24px] hover:bg-blue-500/10 transition-all no-underline group">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-blue-500/20 rounded-xl"><User size={20} className="text-blue-400" /></div>
                      <span className="text-white font-bold text-sm tracking-wide">Commander Vault</span>
                    </div>
                    <ChevronRight size={18} className="text-white/20 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
              </div>

              {/* قسم التحكم بالصوت (المميزة التي طلبتها) */}
              <div className="w-full mb-8 p-4 bg-white/[0.02] border border-white/[0.05] rounded-[24px] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Music size={18} className="text-pink-500" />
                  <span className="text-[11px] text-white font-medium">System Audio</span>
                </div>
                <div className="flex gap-1">
                  {[1,2,3].map(i => <div key={i} className="w-1 h-3 bg-purple-500/40 rounded-full animate-pulse" style={{ animationDelay: `${i*0.2}s` }} />)}
                </div>
              </div>

              {isLoggedIn && (
                <button 
                  onClick={() => { onLogout?.(); setIsOpen(false); }}
                  className="w-full py-4.5 bg-gradient-to-r from-red-500/20 to-red-800/20 border border-red-500/30 rounded-[22px] text-red-500 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/5"
                >
                  Terminate Link
                </button>
              )}

              <div className="mt-8 flex items-center gap-2">
                 <div className="w-1 h-1 rounded-full bg-green-500 animate-ping" />
                 <span className="text-[9px] text-white/20 font-bold uppercase tracking-widest">Connection Stable</span>
              </div>
            </motion.div>
          </div>,
          document.body
        )}
      </AnimatePresence>
    </>
  );
}
