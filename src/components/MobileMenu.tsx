import { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
  X, Home, User, Trophy, Wallet, LogOut, ChevronRight, 
  ShoppingBag, LayoutDashboard, Music, Menu
} from 'lucide-react';

// استيراد الشعارات الأصلية
import logoIcon from "@/assets/spin4pi-logo.png";
import logoText from "@/assets/spin4pi-text-logo.png";

export function MobileMenu({ isLoggedIn, onLogout, isAdmin = false, balance = 0 }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAudioStarted, setIsAudioStarted] = useState(false);
  const bgMusic = useRef<HTMLAudioElement | null>(null);
  const location = useLocation();

  // نظام الصوت - التأكد من المسار والتشغيل
  useEffect(() => {
    const audio = new Audio("https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3");
    audio.loop = true;
    audio.volume = 0.5;
    bgMusic.current = audio;

    return () => {
      audio.pause();
    };
  }, []);

  const handleStartAudio = () => {
    bgMusic.current?.play().then(() => {
      setIsAudioStarted(true);
    }).catch(e => console.error("Audio error:", e));
  };

  const fadeOutAndClose = () => {
    if (bgMusic.current) {
      const interval = setInterval(() => {
        if (bgMusic.current!.volume > 0.05) {
          bgMusic.current!.volume -= 0.1;
        } else {
          bgMusic.current!.pause();
          clearInterval(interval);
          onLogout?.();
          setIsOpen(false);
        }
      }, 100);
    }
  };

  const MenuContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* خلفية معتمة جداً بتركيز على المنتصف */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md" 
          />

          {/* تصميم البطاقة العائمة - مطابق للصورة تماماً */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, x: "-50%", y: "-50%" }}
            animate={{ scale: 1, opacity: 1, x: "-50%", y: "-50%" }}
            exit={{ scale: 0.8, opacity: 0, x: "-50%", y: "-50%" }}
            className="fixed top-1/2 left-1/2 z-[100000] w-[90%] max-w-[380px] 
                       bg-[#0a0a0b] border-[2px] border-purple-500/40 rounded-[45px] 
                       shadow-[0_0_60px_rgba(168,85,247,0.3)] flex flex-col p-8 overflow-hidden"
          >
            {/* Header القائمة */}
            <div className="relative flex flex-col items-center mb-6">
              <button onClick={() => setIsOpen(false)} className="absolute -top-2 -right-2 p-2 text-white/20 hover:text-white">
                <X size={20} />
              </button>
              
              <motion.img 
                animate={{ y: [0, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}
                src={logoIcon} className="w-16 h-16 mb-2 drop-shadow-[0_0_15px_rgba(234,179,8,0.6)]" 
              />
              <img src={logoText} className="h-6 w-auto mb-2" />
              <div className="px-4 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] text-white/40 uppercase tracking-[0.2em]">
                Verified Ecosystem
              </div>
            </div>

            {/* الروابط - ستايل الـ Premium Slots */}
            <div className="space-y-3 mb-8">
              <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest ml-2 mb-2">Navigation</p>
              
              <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/10 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-purple-500/20 rounded-xl text-purple-400"><Home size={20} /></div>
                  <span className="text-sm font-bold text-white">The Arena</span>
                </div>
                <ChevronRight size={16} className="text-white/20 group-hover:text-purple-400" />
              </Link>

              {isLoggedIn && (
                <>
                  <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/10 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-500/20 rounded-xl text-blue-400"><User size={20} /></div>
                      <span className="text-sm font-bold text-white">My Account</span>
                    </div>
                    <ChevronRight size={16} className="text-white/20 group-hover:text-blue-400" />
                  </Link>

                  <Link to="/achievements" onClick={() => setIsOpen(false)} className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/10 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-yellow-500/20 rounded-xl text-yellow-400"><Trophy size={20} /></div>
                      <span className="text-sm font-bold text-white">Leaderboard</span>
                    </div>
                    <ChevronRight size={16} className="text-white/20 group-hover:text-yellow-400" />
                  </Link>
                </>
              )}
            </div>

            {/* التحكم بالصوت داخل المنيو */}
            {!isAudioStarted ? (
              <button 
                onClick={handleStartAudio}
                className="mb-6 py-3 px-6 bg-purple-600/20 border border-purple-500/50 rounded-2xl text-purple-400 text-xs font-bold animate-pulse"
              >
                Click to Enable Epic Sound
              </button>
            ) : (
              <div className="mb-6 flex items-center justify-center gap-4 text-purple-400">
                <Music size={16} className="animate-spin-slow" />
                <span className="text-[10px] font-black uppercase tracking-widest">System Audio Active</span>
              </div>
            )}

            {/* زر الخروج Terminal */}
            <div className="mt-auto">
              <button 
                onClick={fadeOutAndClose}
                className="w-full py-4 bg-gradient-to-r from-red-600 to-red-800 rounded-2xl text-white font-black text-xs uppercase tracking-[0.2em] shadow-[0_10px_20px_rgba(220,38,38,0.2)] active:scale-95 transition-all"
              >
                Terminate Session
              </button>
              <p className="text-center text-[8px] text-white/10 mt-4 font-bold tracking-[0.3em] uppercase">Piest Protocol v.2.0</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="p-2 text-white/80 hover:text-purple-400">
        <Menu size={36} />
      </button>
      {createPortal(MenuContent, document.body)}
    </>
  );
}
