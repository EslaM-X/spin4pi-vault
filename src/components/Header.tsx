import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, User, Music, ChevronRight, Wallet, LogOut } from 'lucide-react';
import logoIcon from "@/assets/spin4pi-logo.png";

export function MobileMenu({ isLoggedIn, onLogout, balance = 0 }: any) {
  const [isOpen, setIsOpen] = useState(false);

  // دالة الفتح القسرية لضمان العمل على كل الأجهزة
  const toggleMenu = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* الزر الأسطوري والمبتكر */}
      <button 
        onClick={toggleMenu}
        onTouchStart={toggleMenu}
        className="relative group p-3 flex flex-col gap-1.5 justify-center items-center transition-all duration-500 active:scale-90"
        style={{ 
          zIndex: 99999, 
          background: 'rgba(168, 85, 247, 0.1)',
          borderRadius: '16px',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          width: '50px',
          height: '50px',
          cursor: 'pointer',
          pointerEvents: 'auto'
        }}
      >
        {/* توهج خلفي (Glow Effect) */}
        <div className="absolute inset-0 bg-purple-500/20 blur-xl group-hover:bg-purple-500/40 transition-all duration-500 rounded-full" />
        
        {/* خطوط الهامبرجر المتحركة */}
        <motion.span 
          animate={isOpen ? { rotate: 45, y: 8, width: '28px' } : { rotate: 0, y: 0, width: '24px' }}
          className="h-[3px] bg-gradient-to-r from-purple-400 to-pink-500 rounded-full block shadow-[0_0_8px_rgba(168,85,247,0.8)]"
        />
        <motion.span 
          animate={isOpen ? { opacity: 0, x: -20 } : { opacity: 1, x: 0, width: '18px' }}
          className="h-[3px] bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full block self-end shadow-[0_0_8px_rgba(168,85,247,0.8)]"
        />
        <motion.span 
          animate={isOpen ? { rotate: -45, y: -8, width: '28px' } : { rotate: 0, y: 0, width: '24px' }}
          className="h-[3px] bg-gradient-to-r from-pink-500 to-purple-400 rounded-full block shadow-[0_0_8px_rgba(168,85,247,0.8)]"
        />
      </button>

      <AnimatePresence>
        {isOpen && createPortal(
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000000 }}>
            {/* خلفية زجاجية معتمة فخمة */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-[20px]"
            />

            {/* البطاقة العائمة في المنتصف - تصميم فضائي */}
            <div className="h-full w-full flex items-center justify-center p-6">
              <motion.div 
                initial={{ scale: 0.8, y: 50, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.8, y: 50, opacity: 0 }}
                className="relative w-full max-w-[380px] bg-[#050505] border-[1px] border-purple-500/40 rounded-[50px] p-10 shadow-[0_0_100px_rgba(168,85,247,0.25)] flex flex-col items-center overflow-hidden"
              >
                {/* تأثير الإضاءة العلوية داخل الكارد */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />

                <img src={logoIcon} className="w-20 h-20 mb-6 drop-shadow-[0_0_20px_rgba(168,85,247,0.6)]" />
                
                <h2 className="text-white font-black tracking-[0.3em] text-xs uppercase mb-8 opacity-50">Main Protocol</h2>

                {/* الروابط بتصميم بطاقات صغيرة */}
                <div className="w-full space-y-4 mb-10">
                  <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center justify-between p-5 bg-white/[0.03] border border-white/[0.05] rounded-3xl hover:bg-purple-500/10 transition-all group no-underline">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-purple-500/20 rounded-2xl group-hover:scale-110 transition-transform">
                        <Home size={22} className="text-purple-400" />
                      </div>
                      <span className="text-white font-bold tracking-wide">The Arena</span>
                    </div>
                    <ChevronRight size={20} className="text-white/20 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                  </Link>

                  {isLoggedIn && (
                    <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center justify-between p-5 bg-white/[0.03] border border-white/[0.05] rounded-3xl hover:bg-blue-500/10 transition-all group no-underline">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/20 rounded-2xl group-hover:scale-110 transition-transform">
                          <User size={22} className="text-blue-400" />
                        </div>
                        <span className="text-white font-bold tracking-wide">Commander Profile</span>
                      </div>
                      <ChevronRight size={20} className="text-white/20 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                    </Link>
                  )}
                </div>

                {/* زر الخروج بتصميم متميز */}
                {isLoggedIn && (
                  <button 
                    onClick={() => { onLogout?.(); setIsOpen(false); }}
                    className="w-full flex items-center justify-center gap-3 py-5 bg-gradient-to-r from-red-500/10 to-red-900/20 border border-red-500/30 rounded-3xl text-red-500 font-black tracking-widest text-xs uppercase hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/5"
                  >
                    <LogOut size={16} /> Terminate Session
                  </button>
                )}

                <div className="mt-8 flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                   <span className="text-[10px] text-white/20 font-bold uppercase tracking-[0.2em]">Secure Link Established</span>
                </div>
              </motion.div>
            </div>
          </div>,
          document.body
        )}
      </AnimatePresence>
    </>
  );
}
