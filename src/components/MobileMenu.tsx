import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
  X, Home, User, Trophy, Wallet, LogOut, ChevronRight, 
  ShoppingBag, LayoutDashboard, Music, Menu, Zap
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';

// استيراد الشعارات الأصلية
import logoIcon from "@/assets/spin4pi-logo.png";
import logoText from "@/assets/spin4pi-text-logo.png";

export function MobileMenu({ isLoggedIn, onLogout, isAdmin = false, balance = 0 }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAudioSlider, setShowAudioSlider] = useState(false);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  
  const bgMusic = useRef<HTMLAudioElement | null>(null);
  const audioTimerRef = useRef<NodeJS.Timeout | null>(null);
  const location = useLocation();

  // 1. نظام الصوت الحماسي - يعمل عند أول نقرة في الموقع لضمان تخطي حظر المتصفح
  useEffect(() => {
    const audio = new Audio("https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3");
    audio.loop = true;
    audio.volume = volume / 100;
    bgMusic.current = audio;

    const enableAudio = () => {
      audio.play().catch(() => console.log("Audio waiting for user..."));
      window.removeEventListener('click', enableAudio);
      window.removeEventListener('touchstart', enableAudio);
    };

    window.addEventListener('click', enableAudio);
    window.addEventListener('touchstart', enableAudio);

    return () => {
      audio.pause();
      if (audioTimerRef.current) clearTimeout(audioTimerRef.current);
    };
  }, []);

  // تحديث الصوت عند تغيير الـ Slider
  useEffect(() => {
    if (bgMusic.current) {
      bgMusic.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  // 2. وظيفة الإغلاق التلقائي لإعدادات الصوت بعد 6 ثوانٍ
  const resetAudioTimer = () => {
    if (audioTimerRef.current) clearTimeout(audioTimerRef.current);
    audioTimerRef.current = setTimeout(() => {
      setShowAudioSlider(false);
    }, 6000); // 6 ثوانٍ كما طلبت
  };

  const handleToggleAudio = () => {
    setShowAudioSlider(!showAudioSlider);
    if (!showAudioSlider) resetAudioTimer();
  };

  const fadeOutAndLogout = () => {
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
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-xl" 
          />

          <motion.div
            initial={{ scale: 0.7, opacity: 0, x: "-50%", y: "-50%" }}
            animate={{ scale: 1, opacity: 1, x: "-50%", y: "-50%" }}
            exit={{ scale: 0.7, opacity: 0, x: "-50%", y: "-50%" }}
            className="fixed top-1/2 left-1/2 z-[100000] w-[92%] max-w-[380px] 
                       bg-[#080809] border-[3px] border-purple-600/50 rounded-[50px] 
                       shadow-[0_0_80px_rgba(168,85,247,0.4)] flex flex-col p-8 overflow-hidden"
          >
            {/* الجزء العلوي - الشعار */}
            <div className="relative flex flex-col items-center mb-6">
              <button onClick={() => setIsOpen(false)} className="absolute -top-2 -right-2 p-2 text-white/40">
                <X size={24} />
              </button>
              
              <div className="relative mb-3">
                <div className="absolute inset-0 bg-yellow-500/20 blur-2xl rounded-full" />
                <img src={logoIcon} className="w-16 h-16 relative z-10 drop-shadow-[0_0_15px_rgba(234,179,8,0.7)]" />
              </div>
              <img src={logoText} className="h-6 w-auto mb-2" />
              <div className="px-5 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-[10px] text-purple-400 font-black uppercase tracking-[0.3em]">
                Elite Interface
              </div>
            </div>

            {/* روابط التنقل بستايل الألعاب */}
            <div className="space-y-3 mb-6">
              <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-purple-600/20 hover:border-purple-500/50 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-purple-600/20 rounded-xl text-purple-400 group-hover:scale-110 transition-transform"><Home size={20} /></div>
                  <span className="text-sm font-black text-white/90 uppercase">The Arena</span>
                </div>
                <ChevronRight size={18} className="text-white/20 group-hover:text-purple-400" />
              </Link>

              {isLoggedIn && (
                <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-blue-600/20 hover:border-blue-500/50 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-600/20 rounded-xl text-blue-400"><User size={20} /></div>
                    <span className="text-sm font-black text-white/90 uppercase">My Profile</span>
                  </div>
                  <ChevronRight size={18} className="text-white/20 group-hover:text-blue-400" />
                </Link>
              )}
            </div>

            {/* التحكم بالصوت الذكي - يغلق بعد 6 ثوانٍ */}
            <div className="relative flex flex-col items-center mb-8 px-4 py-3 bg-white/[0.02] rounded-3xl border border-white/5">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${!isMuted ? 'bg-green-500/20 text-green-500 animate-pulse' : 'bg-red-500/20 text-red-500'}`}>
                    <Music size={16} />
                  </div>
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Audio System</span>
                </div>
                <button onClick={handleToggleAudio} className="p-2 bg-purple-600/20 rounded-xl text-purple-400 hover:bg-purple-600/40 transition-colors">
                  <Zap size={18} />
                </button>
              </div>

              <AnimatePresence>
                {showAudioSlider && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="w-full pt-4 overflow-hidden"
                  >
                    <div className="flex items-center gap-4 bg-black/40 p-3 rounded-xl border border-white/5">
                      <Slider 
                        value={[volume]} 
                        max={100} 
                        onValueChange={(v) => { setVolume(v[0]); resetAudioTimer(); }} 
                        className="flex-1 cursor-pointer"
                      />
                      <span className="text-[10px] font-black text-purple-400 w-8 text-right">{volume}%</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* زر الخروج - Terminate Session */}
            <div className="mt-auto">
              <button 
                onClick={fadeOutAndLogout}
                className="w-full py-4.5 bg-gradient-to-r from-red-600 to-red-900 rounded-[22px] text-white font-black text-[11px] uppercase tracking-[0.3em] shadow-[0_15px_30px_rgba(220,38,38,0.3)] hover:brightness-125 active:scale-95 transition-all"
              >
                Terminate Session
              </button>
              <div className="flex justify-center items-center gap-2 mt-5 opacity-20">
                <div className="h-[1px] w-8 bg-white" />
                <p className="text-[8px] text-white font-bold tracking-[0.4em] uppercase text-center">Protocol v.2.0.6</p>
                <div className="h-[1px] w-8 bg-white" />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="fixed top-5 right-5 z-[50] p-3 bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl text-purple-400 hover:text-white transition-all shadow-xl"
      >
        <Menu size={32} />
      </button>
      {createPortal(MenuContent, document.body)}
    </>
  );
}
