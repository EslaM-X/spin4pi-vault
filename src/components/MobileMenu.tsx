import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, LayoutGrid, UserCircle, Trophy, 
  Volume2, ChevronRight, Sparkles,
  ShoppingCart, Info, Medal, Wallet, Crown, Shield
} from 'lucide-react';
import logoIcon from "@/assets/spin4pi-logo.png";
import bgMusic from "@/assets/sounds/bg-music.mp3";

export function MobileMenu({ isLoggedIn, onLogout, isAdmin, balance = "0.00" }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(() => localStorage.getItem('isMuted') === 'true');
  const navigate = useNavigate();
  const location = useLocation();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // إدارة الموسيقى الخلفية
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(bgMusic);
      audioRef.current.loop = true;
    }

    if (isLoggedIn && !isMuted) {
      audioRef.current.play().catch(() => console.log("Interaction needed"));
    } else {
      audioRef.current.pause();
    }
    return () => audioRef.current?.pause();
  }, [isLoggedIn, isMuted]);

  const toggleMute = () => {
    const newState = !isMuted;
    setIsMuted(newState);
    localStorage.setItem('isMuted', String(newState));
  };

  useEffect(() => setIsOpen(false), [location.pathname]);

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* زر الهامبرجر لفتح القائمة */}
      <button 
        onClick={() => setIsOpen(true)}
        className="w-12 h-12 rounded-2xl border border-white/10 bg-[#13131a] flex flex-col items-center justify-center gap-1.5 hover:border-gold/50 transition-all shadow-lg shadow-purple-500/10"
      >
        <div className="w-6 h-[2px] bg-gold rounded-full" />
        <div className="w-4 h-[2px] bg-gold/60 rounded-full self-end mr-3" />
        <div className="w-6 h-[2px] bg-gold rounded-full" />
      </button>

      <AnimatePresence>
        {isOpen && createPortal(
          <div className="fixed inset-0 z-[1000000] bg-black/90 backdrop-blur-xl flex justify-center items-end">
            
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-[500px] bg-[#0a0a0c] border-t-2 border-gold/20 rounded-t-[40px] p-6 pb-12 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
            >
              {/* 1. زر الإغلاق الجديد (X) لضمان سهولة العودة */}
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-8 right-8 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-white/50 hover:text-gold hover:border-gold/30 transition-all active:scale-90"
              >
                <X size={22} />
              </button>

              {/* 2. تغيير الاسم إلى Spin4Pi كما هو موضح في الهوية البصرية */}
              <div className="text-center mb-8">
                <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8 opacity-20" />
                <img src={logoIcon} className="w-20 h-20 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(251,191,36,0.2)]" alt="Spin4Pi Logo" />
                <h2 className="text-white text-2xl font-black tracking-[0.3em] uppercase italic">
                  SPIN4<span className="text-gold">PI</span>
                </h2>
              </div>

              {/* عرض الرصيد والبيانات الحالية */}
              {isLoggedIn && (
                <div className="bg-[#13131a] border border-gold/20 rounded-[32px] p-6 mb-8 flex justify-between items-center shadow-inner">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-gold rounded-2xl flex items-center justify-center text-black shadow-lg shadow-gold/20">
                      <Wallet size={28} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-gold/60 uppercase tracking-widest">Available Pi</span>
                      <div className="text-2xl font-black text-white leading-none mt-1">
                        {balance} <span className="text-sm text-gold">π</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-tighter">Secure</span>
                  </div>
                </div>
              )}

              {/* شبكة الوصول السريع */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                <QuickAction icon={<LayoutGrid size={22} />} label="Arena" onClick={() => handleNavigation('/')} />
                <QuickAction icon={<Trophy size={22} />} label="Rank" onClick={() => handleNavigation('/leaderboard')} />
                <QuickAction icon={<Crown size={22} />} label="VIP" onClick={() => handleNavigation('/vip-benefits')} />
                <QuickAction icon={<UserCircle size={22} />} label="Account" onClick={() => handleNavigation('/profile')} />
              </div>

              {/* خيارات النظام والموسيقى */}
              <div 
                onClick={toggleMute}
                className="flex justify-between items-center p-5 bg-white/[0.02] border border-white/5 rounded-3xl cursor-pointer mb-8 hover:bg-white/[0.04] transition-all"
              >
                <div className="flex items-center gap-4">
                  <Volume2 size={22} className={isMuted ? "text-white/20" : "text-gold"} />
                  <span className="text-sm font-bold text-white/70">Atmosphere Music</span>
                </div>
                <div className={`w-12 h-6 rounded-full transition-all duration-300 relative ${isMuted ? 'bg-white/10' : 'bg-gold shadow-[0_0_10px_rgba(251,191,36,0.3)]'}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-black transition-all duration-300 ${isMuted ? 'left-1' : 'left-7'}`} />
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
          document.body
        )}
      </AnimatePresence>
    </>
  );
}

// مكونات فرعية مساعدة
function QuickAction({ onClick, icon, label }: any) {
  return (
    <div 
      onClick={onClick} 
      className="bg-white/[0.02] border border-white/5 p-4 rounded-[24px] flex flex-col items-center gap-3 cursor-pointer hover:border-gold/30 hover:bg-white/[0.04] transition-all"
    >
      <div className="text-gold">{icon}</div>
      <span className="text-[9px] font-black text-white/40 uppercase tracking-tighter">{label}</span>
    </div>
  );
}

function MenuOption({ onClick, icon, label }: any) {
  return (
    <div 
      onClick={onClick}
      className="flex items-center justify-between p-5 bg-white/[0.01] border border-white/[0.03] rounded-2xl cursor-pointer hover:bg-white/[0.03] transition-all"
    >
      <div className="flex items-center gap-4">
        {icon}
        <span className="text-sm font-bold text-white/80">{label}</span>
      </div>
      <ChevronRight size={18} className="text-white/20" />
    </div>
  );
}
