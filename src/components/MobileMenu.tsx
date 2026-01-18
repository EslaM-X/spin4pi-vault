import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, LayoutGrid, UserCircle, Trophy, 
  Volume2, ChevronRight, Crown, Wallet, Shield
} from 'lucide-react';
import logoIcon from "@/assets/spin4pi-logo.png";

export function MobileMenu({ isLoggedIn, onLogout, balance = "0.00" }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(() => localStorage.getItem('isMuted') === 'true');
  const navigate = useNavigate();

  // دالة الفتح والإغلاق مع منع انتشار الحدث لضمان الاستجابة
  const toggleMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(prev => !prev);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = !isMuted;
    setIsMuted(newState);
    localStorage.setItem('isMuted', String(newState));
  };

  return (
    <>
      {/* زر الهامبرجر الرئيسي */}
      <button 
        type="button"
        onClick={toggleMenu}
        style={{ zIndex: 9999 }} // ضمان أن الزر فوق كل شيء في الهيدر
        className="relative w-11 h-11 rounded-2xl border border-white/10 bg-[#13131a] flex flex-col items-center justify-center gap-1 hover:border-gold/50 transition-all active:scale-90 touch-none"
      >
        <div className="w-5 h-[2px] bg-gold rounded-full" />
        <div className="w-4 h-[2px] bg-gold/60 rounded-full" />
        <div className="w-5 h-[2px] bg-gold rounded-full" />
      </button>

      {/* استخدام Portal لضمان خروج القائمة من أي حاوية مقيدة */}
      <AnimatePresence>
        {isOpen && createPortal(
          <div className="fixed inset-0" style={{ zIndex: 1000001 }}>
            
            {/* الخلفية المعتمة (Overlay) */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            
            {/* لوحة القائمة (Drawer) */}
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 w-full max-w-[500px] mx-auto bg-[#0a0a0c] border-t-2 border-gold/30 rounded-t-[40px] p-6 pb-12 shadow-[0_-20px_50px_rgba(0,0,0,0.8)]"
              onClick={(e) => e.stopPropagation()} // منع الإغلاق عند الضغط داخل القائمة
            >
              {/* زر الإغلاق X */}
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-8 right-8 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-white/50 hover:text-gold transition-all"
              >
                <X size={24} />
              </button>

              {/* الشعار والاسم الجديد */}
              <div className="text-center mb-10 pt-4">
                <img src={logoIcon} className="w-20 h-20 mx-auto mb-4" alt="Spin4Pi" />
                <h2 className="text-white text-2xl font-black tracking-[0.4em] uppercase italic">
                  SPIN4<span className="text-gold">PI</span>
                </h2>
              </div>

              {/* الرصيد المباشر */}
              {isLoggedIn && (
                <div className="bg-[#13131a] border border-gold/20 rounded-[30px] p-6 mb-8 flex justify-between items-center shadow-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gold rounded-2xl flex items-center justify-center text-black shadow-lg shadow-gold/20">
                      <Wallet size={28} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-gold/60 uppercase tracking-widest">Available Pi</span>
                      <div className="text-2xl font-black text-white mt-1 leading-none">
                        {balance} <span className="text-sm text-gold">π</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-bold text-emerald-500 uppercase">Secure</span>
                  </div>
                </div>
              )}

              {/* شبكة الأزرار */}
              <div className="grid grid-cols-4 gap-4 mb-10">
                <QuickAction icon={<LayoutGrid size={22} />} label="Arena" onClick={() => { navigate('/'); setIsOpen(false); }} />
                <QuickAction icon={<Trophy size={22} />} label="Rank" onClick={() => { navigate('/leaderboard'); setIsOpen(false); }} />
                <QuickAction icon={<Crown size={22} />} label="VIP" onClick={() => { navigate('/vip-benefits'); setIsOpen(false); }} />
                <QuickAction icon={<UserCircle size={22} />} label="Account" onClick={() => { navigate('/profile'); setIsOpen(false); }} />
              </div>

              {/* زر الموسيقى */}
              <div 
                onClick={toggleMute}
                className="flex justify-between items-center p-5 bg-white/[0.02] border border-white/5 rounded-3xl cursor-pointer mb-8"
              >
                <div className="flex items-center gap-4">
                  <Volume2 size={22} className={isMuted ? "text-white/20" : "text-gold"} />
                  <span className="text-sm font-bold text-white/70">Atmosphere Music</span>
                </div>
                <div className={`w-12 h-6 rounded-full transition-all relative ${isMuted ? 'bg-white/10' : 'bg-gold shadow-lg shadow-gold/20'}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-black transition-all ${isMuted ? 'left-1' : 'left-7'}`} />
                </div>
              </div>

              {isLoggedIn && (
                <button 
                  onClick={() => { onLogout?.(); setIsOpen(false); }}
                  className="w-full py-5 rounded-[24px] border border-red-500/20 text-red-500 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-red-500/5 transition-all active:scale-[0.98]"
                >
                  Terminate Session
                </button>
              )}
            </motion.div>
          </div>,
          document.body // يتم الحقن في الـ body مباشرة لكسر أي قيود تنسيقية
        )}
      </AnimatePresence>
    </>
  );
}

function QuickAction({ onClick, icon, label }: any) {
  return (
    <div 
      onClick={onClick} 
      className="bg-white/[0.03] border border-white/5 p-4 rounded-[24px] flex flex-col items-center gap-3 cursor-pointer hover:border-gold/40 transition-all active:scale-90"
    >
      <div className="text-gold">{icon}</div>
      <span className="text-[9px] font-black text-white/30 uppercase tracking-tighter">{label}</span>
    </div>
  );
}
