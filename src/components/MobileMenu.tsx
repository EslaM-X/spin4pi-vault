import { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
  X, Home, User, Trophy, Wallet, LogOut, ChevronRight, 
  ShoppingBag, LayoutDashboard, Gem, Music, Sparkles, Zap, Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

// استيراد الشعارات الأصلية الخاصة بك
import logoIcon from "@/assets/spin4pi-logo.png";
import logoText from "@/assets/spin4pi-text-logo.png";

// =========================================================
// ************ نظام الصوت الحماسي المدمج ************
// =========================================================
const GlobalSoundEngine = forwardRef((props: any, ref) => {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(70);
  const [showSlider, setShowSlider] = useState(false);
  const bgMusic = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // موسيقى تقنية حماسية وفخمة
    const audio = new Audio("https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3");
    audio.loop = true;
    audio.volume = volume / 100;
    bgMusic.current = audio;

    const startAudio = () => {
      audio.play().catch(() => console.log("بانتظار تفاعل المستخدم لبدء الموسيقى..."));
    };

    window.addEventListener('click', startAudio, { once: true });
    return () => {
      audio.pause();
      window.removeEventListener('click', startAudio);
    };
  }, []);

  useEffect(() => {
    if (bgMusic.current) {
      bgMusic.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  useImperativeHandle(ref, () => ({
    fadeOut: () => {
      const interval = setInterval(() => {
        if (bgMusic.current && bgMusic.current.volume > 0.05) {
          bgMusic.current.volume -= 0.1;
        } else {
          bgMusic.current?.pause();
          clearInterval(interval);
        }
      }, 100);
    }
  }));

  return (
    <div className="relative flex items-center gap-2">
      <AnimatePresence>
        {showSlider && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
            className="absolute right-full mr-4 bg-black/80 border border-purple-500/30 p-3 rounded-xl backdrop-blur-md flex items-center gap-3">
            <Slider value={[volume]} max={100} onValueChange={(v) => setVolume(v[0])} className="w-20" />
          </motion.div>
        )}
      </AnimatePresence>
      <Button variant="ghost" size="icon" onClick={() => setShowSlider(!showSlider)} className="text-purple-400">
        <Music size={18} className={!isMuted ? "animate-pulse" : ""} />
      </Button>
    </div>
  );
});

// =========================================================
// ************ المنيو الذكي (نفس شكل الصورة تماماً) ************
// =========================================================
export function MobileMenu({ isLoggedIn, onLogout, isAdmin = false, balance = 0 }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const soundRef = useRef<any>(null);

  const toggleMenu = () => setIsOpen(!isOpen);

  const MenuContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm" />

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100000] w-[90%] max-w-[360px] 
                       bg-[#0d0d0d]/90 border-[2px] border-purple-500/50 rounded-[40px] shadow-[0_0_50px_rgba(168,85,247,0.4)]
                       flex flex-col overflow-hidden p-6 text-center"
          >
            {/* الشعار الأصلي - نفس وضعية الصورة */}
            <div className="flex justify-between items-center mb-4 px-2">
               <div className="w-10" /> {/* موازن */}
               <div className="flex flex-col items-center gap-1">
                  <img src={logoIcon} className="w-14 h-14 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                  <img src={logoText} className="h-5 w-auto" />
                  <div className="bg-white/5 border border-white/10 px-3 py-0.5 rounded-full text-[9px] text-white/40 uppercase tracking-widest mt-1">
                    Verified Ecosystem
                  </div>
               </div>
               <button onClick={() => setIsOpen(false)} className="bg-white/5 p-2 rounded-full text-white/40 hover:text-white">
                  <X size={18} />
               </button>
            </div>

            <div className="text-left mb-4">
               <p className="text-[12px] font-bold text-white/80 px-2">Player Profile</p>
            </div>

            {/* الروابط بنفس ستايل الصورة */}
            <nav className="space-y-3 mb-6">
              <MenuLink to="/" icon={<Home size={18}/>} label="The Arena" active={location.pathname === '/'} />
              {isLoggedIn && (
                <>
                  <MenuLink to="/profile" icon={<User size={18}/>} label="My Account" active={location.pathname === '/profile'} />
                  <MenuLink to="/achievements" icon={<Trophy size={18}/>} label="Rankings" active={location.pathname === '/achievements'} />
                  <MenuLink to="/withdrawals" icon={<Wallet size={18}/>} label="Spin Log" active={location.pathname === '/withdrawals'} />
                  <MenuLink to="/marketplace" icon={<ShoppingBag size={18}/>} label="Marketplace" active={location.pathname === '/marketplace'} />
                </>
              )}
              {isAdmin && (
                <MenuLink to="/admin" icon={<LayoutDashboard size={18}/>} label="Admin Dashboard" active={location.pathname === '/admin'} color="text-purple-400" />
              )}
            </nav>

            {/* زر الصوت المدمج */}
            <div className="flex justify-center mb-6">
               <GlobalSoundEngine ref={soundRef} />
            </div>

            {/* زر الخروج - أحمر ونفس شكل الصورة */}
            <div className="mt-auto flex flex-col items-center gap-2">
              {isLoggedIn && (
                <button 
                  onClick={() => { 
                    soundRef.current?.fadeOut();
                    setTimeout(() => { onLogout?.(); setIsOpen(false); }, 1500);
                  }}
                  className="w-full py-3.5 bg-gradient-to-r from-[#e11d48] to-[#9f1239] rounded-2xl text-white font-bold text-sm shadow-[0_4px_15px_rgba(225,29,72,0.3)] transition-transform active:scale-95"
                >
                  Terminate Session
                </button>
              )}
              <p className="text-[9px] text-white/20 font-bold tracking-widest uppercase">Piest Protocol v.1.2</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button onClick={toggleMenu} className="p-2 text-white/80 hover:text-purple-400">
        <Menu size={36} />
      </button>
      {createPortal(MenuContent, document.body)}
    </>
  );
}

function MenuLink({ to, icon, label, active, color = "text-white" }: any) {
  return (
    <Link to={to} className="block group">
      <div className={`flex items-center justify-between p-3.5 rounded-2xl transition-all border 
        ${active ? 'bg-white/10 border-purple-500/40' : 'bg-white/[0.03] border-white/5 hover:bg-white/5'}`}>
        <div className="flex items-center gap-4">
          <div className={`${active ? 'text-purple-400' : 'text-purple-500/60'}`}>{icon}</div>
          <span className={`text-[13px] font-bold ${active ? 'text-white' : 'text-white/60'}`}>{label}</span>
        </div>
        <ChevronRight size={14} className="text-white/20 group-hover:text-purple-400 transition-colors" />
      </div>
    </Link>
  );
}
