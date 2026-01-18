import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
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

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(bgMusic);
      audioRef.current.loop = true;
    }

    if (isLoggedIn && !isMuted) {
      audioRef.current.volume = 0;
      audioRef.current.play().then(() => {
        let vol = 0;
        const fadeIn = setInterval(() => {
          if (vol < 0.25) {
            vol += 0.01;
            if (audioRef.current) audioRef.current.volume = vol;
          } else {
            clearInterval(fadeIn);
          }
        }, 150);
      }).catch(() => console.log("Interaction needed"));
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

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* زر فتح القائمة الأصلي في الهيدر */}
      <button 
        onClick={() => setIsOpen(true)}
        className="w-11 h-11 rounded-2xl border border-white/10 bg-[#13131a] flex flex-col items-center justify-center gap-1 hover:border-gold/50 transition-all"
      >
        <div className="w-5 h-[2px] bg-gold rounded-full" />
        <div className="w-5 h-[2px] bg-gold/60 rounded-full" />
        <div className="w-5 h-[2px] bg-gold rounded-full" />
      </button>

      {isOpen && createPortal(
        <div className="fixed inset-0 z-[1000000] bg-black/90 backdrop-blur-md flex justify-center items-end md:items-center">
          
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            className="relative w-full max-w-[500px] bg-[#0a0a0c] border-t-2 border-gold/20 rounded-t-[40px] p-6 pb-10 shadow-2xl"
          >
            {/* 1. زر الإغلاق الجديد (X) */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-white/50 hover:text-gold hover:border-gold/30 transition-all"
            >
              <X size={20} />
            </button>

            {/* Header Area - تغيير الاسم هنا */}
            <div className="text-center mb-8">
              <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-6" />
              <img src={logoIcon} className="w-16 h-16 mx-auto mb-3" alt="Logo" />
              <h2 className="text-white text-lg font-black tracking-[0.3em] uppercase italic">
                SPIN4<span className="text-gold">PI</span>
              </h2>
            </div>

            {/* Balance Display */}
            {isLoggedIn && (
              <div className="bg-[#13131a] border border-gold/20 rounded-3xl p-5 mb-6 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gold rounded-2xl flex items-center justify-center text-black">
                    <Wallet size={24} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-gold/60 uppercase tracking-widest">Available Pi</span>
                    <div className="text-2xl font-black text-white">{balance} <span className="text-sm text-gold">π</span></div>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[8px] font-bold text-emerald-500 uppercase">Secure</span>
                </div>
              </div>
            )}

            {/* Navigation Grid */}
            <div className="grid grid-cols-4 gap-3 mb-8">
              <QuickAction icon={<LayoutGrid size={22} />} label="Arena" onClick={() => handleNavigation('/')} />
              <QuickAction icon={<Trophy size={22} />} label="Rank" onClick={() => handleNavigation('/leaderboard')} />
              <QuickAction icon={<Crown size={22} />} label="VIP" onClick={() => handleNavigation('/vip-benefits')} />
              <QuickAction icon={<UserCircle size={22} />} label="Account" onClick={() => handleNavigation('/profile')} />
            </div>

            {/* List Options */}
            <div className="space-y-2 mb-8">
              <MenuOption icon={<Medal size={20} className="text-gold" />} label="Imperial Achievements" onClick={() => handleNavigation('/achievements')} />
              <MenuOption icon={<ShoppingCart size={20} className="text-gold" />} label="Marketplace" onClick={() => handleNavigation('/marketplace')} />
              <MenuOption icon={<Shield size={20} className="text-gold" />} label="Security & Legal" onClick={() => handleNavigation('/legal')} />
            </div>

            {/* Audio Toggle */}
            <div 
              onClick={toggleMute}
              className="flex justify-between items-center p-4 bg-white/[0.02] border border-white/5 rounded-2xl cursor-pointer mb-6"
            >
              <div className="flex items-center gap-3">
                <Volume2 size={20} className={isMuted ? "text-white/20" : "text-gold"} />
                <span className="text-sm font-bold text-white/70">Atmosphere Music</span>
              </div>
              <div className={`w-10 h-5 rounded-full transition-colors relative ${isMuted ? 'bg-white/10' : 'bg-gold'}`}>
                <div className={`absolute top-1 w-3 h-3 rounded-full bg-black transition-all ${isMuted ? 'left-1' : 'left-6'}`} />
              </div>
            </div>

            {isLoggedIn && (
              <button 
                onClick={() => { onLogout?.(); setIsOpen(false); }}
                className="w-full py-4 rounded-2xl border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-500/5 transition-all"
              >
                Terminate Session
              </button>
            )}
          </motion.div>
        </div>,
        document.body
      )}
    </>
  );
}

function QuickAction({ onClick, icon, label }: any) {
  return (
    <div 
      onClick={onClick} 
      className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex flex-col items-center gap-2 cursor-pointer hover:border-gold/30 transition-all"
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
      className="flex items-center justify-between p-4 bg-white/[0.01] border border-white/[0.03] rounded-2xl cursor-pointer hover:bg-white/[0.03] transition-all"
    >
      <div className="flex items-center gap-4">
        {icon}
        <span className="text-sm font-bold text-white/80">{label}</span>
      </div>
      <ChevronRight size={16} className="text-white/20" />
    </div>
  );
}
