import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, User, Music, ChevronRight, LogOut, X } from 'lucide-react';
import logoIcon from "@/assets/spin4pi-logo.png";

export function MobileMenu({ isLoggedIn, onLogout, balance = 0 }: any) {
  const [isOpen, setIsOpen] = useState(false);

  // إغلاق المنيو عند تغيير المسار
  useEffect(() => {
    setIsOpen(false);
  }, [window.location.pathname]);

  return (
    <>
      {/* الزر الأسطوري - تمت إضافة pointer-events-auto و z-index خيالي */}
      <div 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(true);
        }}
        className="relative group flex flex-col gap-1.5 justify-center items-center active:scale-90 transition-all cursor-pointer"
        style={{ 
          zIndex: 9999999, 
          background: 'rgba(168, 85, 247, 0.15)',
          borderRadius: '16px',
          border: '1px solid rgba(168, 85, 247, 0.4)',
          width: '50px',
          height: '50px',
          pointerEvents: 'auto', // قسري
          touchAction: 'manipulation' // تحسين استجابة اللمس
        }}
      >
        <div className="absolute inset-0 bg-purple-500/20 blur-xl group-hover:bg-purple-500/40 transition-all rounded-full" />
        
        <motion.span className="h-[3px] w-6 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
        <motion.span className="h-[3px] w-4 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full self-end mr-3 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
        <motion.span className="h-[3px] w-6 bg-gradient-to-r from-pink-500 to-purple-400 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
      </div>

      <AnimatePresence>
        {isOpen && createPortal(
          <div style={{ 
            position: 'fixed', 
            inset: 0, 
            zIndex: 10000000, // أعلى قيمة ممكنة
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* الخلفية المعتمة */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-[20px]"
            />

            {/* البطاقة العائمة */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-[90%] max-w-[380px] bg-[#080809] border border-purple-500/30 rounded-[40px] p-8 shadow-[0_0_80px_rgba(168,85,247,0.3)] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* زر إغلاق صريح وواضح */}
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-6 right-8 text-white/40 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <img src={logoIcon} className="w-16 mb-4 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
              <h2 className="text-white font-bold tracking-widest text-[10px] uppercase mb-8 opacity-40">System Navigation</h2>

              <div className="w-full space-y-3 mb-8">
                <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center justify-between p-5 bg-white/[0.03] border border-white/[0.05] rounded-3xl hover:bg-purple-500/10 transition-all no-underline group">
                  <div className="flex items-center gap-4">
                    <Home size={20} className="text-purple-400" />
                    <span className="text-white font-bold">The Arena</span>
                  </div>
                  <ChevronRight size={18} className="text-white/20 group-hover:translate-x-1 transition-transform" />
                </Link>

                {isLoggedIn && (
                  <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center justify-between p-5 bg-white/[0.03] border border-white/[0.05] rounded-3xl hover:bg-blue-500/10 transition-all no-underline group">
                    <div className="flex items-center gap-4">
                      <User size={20} className="text-blue-400" />
                      <span className="text-white font-bold">Commander Profile</span>
                    </div>
                    <ChevronRight size={18} className="text-white/20 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
              </div>

              {isLoggedIn && (
                <button 
                  onClick={() => { onLogout?.(); setIsOpen(false); }}
                  className="w-full py-4 bg-gradient-to-r from-red-500/20 to-red-900/40 border border-red-500/30 rounded-2xl text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                >
                  <LogOut size={14} className="inline mr-2" /> Terminate Session
                </button>
              )}

              <div className="mt-8 flex items-center gap-2 opacity-30">
                 <div className="w-1 h-1 rounded-full bg-green-500" />
                 <span className="text-[9px] text-white font-bold uppercase tracking-widest">Active Link</span>
              </div>
            </motion.div>
          </div>,
          document.body
        )}
      </AnimatePresence>
    </>
  );
}
