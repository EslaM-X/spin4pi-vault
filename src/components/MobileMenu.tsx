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

  // منع التمرير في الخلفية عند فتح القائمة
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = !isMuted;
    setIsMuted(newState);
    localStorage.setItem('isMuted', String(newState));
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* زر الهامبرجر - تأكد أنه يمتلك Z-index عالي */}
      <button 
        onClick={() => setIsOpen(true)}
        className="relative z-[110] w-10 h-10 rounded-xl border border-white/10 bg-[#13131a] flex flex-col items-center justify-center gap-1 hover:border-gold/50 transition-all active:scale-90"
      >
        <div className="w-5 h-[2px] bg-gold rounded-full" />
        <div className="w-3 h-[2px] bg-gold/60 rounded-full self-end mr-2.5" />
        <div className="w-5 h-[2px] bg-gold rounded-full" />
      </button>

      <AnimatePresence>
        {isOpen && createPortal(
          <div className="fixed inset-0 z-[1000000] flex justify-center items-end md:items-center">
            {/* الخلفية المعتمة */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            
            {/* محتوى القائمة */}
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-[500px] bg-[#0a0a0c] border-t-2 border-gold/20 rounded-t-[40px] p-6 pb-12 shadow-2xl overflow-y-auto max-h-[95vh]"
            >
              {/* زر الإغلاق الصريح (X) */}
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-white/50 hover:text-gold transition-all active:scale-90"
              >
                <X size={24} />
              </button>

              {/* الشعار والاسم الجديد */}
              <div className="text-center mb-8 mt-4">
                <img src={logoIcon} className="w-16 h-16 mx-auto mb-3 drop-shadow-lg" alt="Spin4Pi" />
                <h2 className="text-white text-xl font-black tracking-[0.2em] uppercase italic">
                  SPIN4<span className="text-gold">PI</span>
                </h2>
              </div>

              {/* عرض الرصيد */}
              {isLoggedIn && (
                <div className="bg-[#13131a] border border-gold/20 rounded-3xl p-5 mb-6 flex justify-between items-center shadow-inner">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gold rounded-2xl flex items-center justify-center text-black">
                      <Wallet size={24} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-gold/60 uppercase">Available Pi</span>
                      <div className="text-xl font-black text-white">{balance} <span className="text-xs text-gold">π</span></div>
                    </div>
                  </div>
                </div>
              )}

              {/* أزرار الوصول السريع */}
              <div className="grid grid-cols-4 gap-3 mb-8">
                <QuickAction icon={<LayoutGrid size={20} />} label="Arena" onClick={() => handleNavigation('/')} />
                <QuickAction icon={<Trophy size={20} />} label="Rank" onClick={() => handleNavigation('/leaderboard')} />
                <QuickAction icon={<Crown size={20} />} label="VIP" onClick={() => handleNavigation('/vip-benefits')} />
                <QuickAction icon={<UserCircle size={20} />} label="Account" onClick={() => handleNavigation('/profile')} />
              </div>

              {/* القائمة الطولية */}
              <div className="space-y-2 mb-8">
                <MenuOption icon={<Shield size={18} className="text-gold" />} label="Security & Legal" onClick={() => handleNavigation('/legal')} />
              </div>

              {/* تحكم الصوت */}
              <div 
                onClick={toggleMute}
                className="flex justify-between items-center p-4 bg-white/[0.02] border border-white/5 rounded-2xl cursor-pointer mb-6"
              >
                <div className="flex items-center gap-3">
                  <Volume2 size={20} className={isMuted ? "text-white/20" : "text-gold"} />
                  <span className="text-sm font-bold text-white/70">Atmosphere Music</span>
                </div>
                <div className={`w-10 h-5 rounded-full transition-all relative ${isMuted ? 'bg-white/10' : 'bg-gold'}`}>
                  <div className={`absolute top-1 w-3 h-3 rounded-full bg-black transition-all ${isMuted ? 'left-1' : 'left-6'}`} />
                </div>
              </div>

              {isLoggedIn && (
                <button 
                  onClick={() => { onLogout?.(); setIsOpen(false); }}
                  className="w-full py-4 rounded-2xl border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/5 transition-all"
                >
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

// المكونات الفرعية
function QuickAction({ onClick, icon, label }: any) {
  return (
    <div onClick={onClick} className="bg-white/[0.02] border border-white/5 p-3 rounded-2xl flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-all">
      <div className="text-gold">{icon}</div>
      <span className="text-[8px] font-black text-white/40 uppercase tracking-tighter text-center">{label}</span>
    </div>
  );
}

function MenuOption({ onClick, icon, label }: any) {
  return (
    <div onClick={onClick} className="flex items-center justify-between p-4 bg-white/[0.01] border border-white/[0.03] rounded-xl cursor-pointer active:bg-white/[0.03]">
      <div className="flex items-center gap-4">
        {icon}
        <span className="text-sm font-bold text-white/80">{label}</span>
      </div>
      <ChevronRight size={16} className="text-white/20" />
    </div>
  );
}
