import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, User, ChevronRight, LogOut, X } from 'lucide-react';
import logoIcon from "@/assets/spin4pi-logo.png";

export function MobileMenu({ isLoggedIn, onLogout }: any) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        // استخدام onClick مباشرة مع التأكد من أنه زر حقيقي
        onClick={() => setIsOpen(true)}
        className="relative group flex flex-col gap-1.5 justify-center items-center active:scale-90 transition-all cursor-pointer shadow-2xl"
        style={{ 
          background: '#1a1a1b',
          borderRadius: '16px',
          border: '2px solid #a855f7',
          width: '48px',
          height: '48px',
          padding: '0',
          display: 'flex'
        }}
      >
        <motion.span className="h-[3px] w-6 bg-purple-400 rounded-full" />
        <motion.span className="h-[3px] w-4 bg-purple-500 rounded-full self-end mr-2" />
        <motion.span className="h-[3px] w-6 bg-pink-500 rounded-full" />
      </button>

      <AnimatePresence>
        {isOpen && createPortal(
          <div style={{ position: 'fixed', inset: 0, zIndex: 10000000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            />

            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-[90%] max-w-[360px] bg-[#0a0a0b] border-2 border-purple-500/50 rounded-[40px] p-8 flex flex-col items-center"
            >
              <button onClick={() => setIsOpen(false)} className="absolute top-6 right-8 text-white/50"><X size={24} /></button>
              <img src={logoIcon} className="w-16 mb-6" />
              
              <div className="w-full space-y-4 mb-8">
                <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center justify-between p-5 bg-white/5 rounded-3xl text-white no-underline font-bold">
                  <span>The Arena</span> <ChevronRight size={18} />
                </Link>
                {isLoggedIn && (
                  <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center justify-between p-5 bg-white/5 rounded-3xl text-white no-underline font-bold">
                    <span>Commander Profile</span> <ChevronRight size={18} />
                  </Link>
                )}
              </div>

              {isLoggedIn && (
                <button onClick={() => { onLogout?.(); setIsOpen(false); }} className="w-full py-5 bg-red-600 rounded-2xl text-white font-black uppercase tracking-widest text-[10px]">
                  Terminate Session
                </button>
              )}
            </motion.div>
          </div>,
          document.body
        )}
      </AnimatePresence>
    </>
  );
}
