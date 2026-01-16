import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, Home, User, Trophy, Wallet, ChevronRight, Music, Menu, ShieldCheck } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

// استيراد الشعارات مع معالجة الخطأ
import logoIcon from "@/assets/spin4pi-logo.png";

export function MobileMenu({ isLoggedIn, onLogout, isAdmin = false, balance = 0 }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAudioSlider, setShowAudioSlider] = useState(false);
  const [volume, setVolume] = useState(70);
  const bgMusic = useRef<HTMLAudioElement | null>(null);
  const audioTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. نظام تشغيل الصوت الذكي
  useEffect(() => {
    const audio = new Audio("https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3");
    audio.loop = true;
    bgMusic.current = audio;

    const enableAudio = () => {
      audio.play().catch(() => {});
      window.removeEventListener('touchstart', enableAudio);
      window.removeEventListener('click', enableAudio);
    };
    window.addEventListener('touchstart', enableAudio);
    window.addEventListener('click', enableAudio);

    return () => {
      audio.pause();
      if (audioTimerRef.current) clearTimeout(audioTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (bgMusic.current) bgMusic.current.volume = volume / 100;
  }, [volume]);

  // 2. مؤقت الإغلاق التلقائي (6 ثوانٍ)
  const startTimer = () => {
    if (audioTimerRef.current) clearTimeout(audioTimerRef.current);
    audioTimerRef.current = setTimeout(() => {
      setShowAudioSlider(false);
    }, 6000);
  };

  const toggleAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowAudioSlider(!showAudioSlider);
    if (!showAudioSlider) startTimer();
  };

  return (
    <>
      {/* زر الهامبرجر الموجود في الـ Header */}
      <button 
        onClick={() => setIsOpen(true)} 
        className="p-2 ml-2 hover:bg-white/5 rounded-xl transition-colors text-purple-400"
      >
        <Menu size={28} />
      </button>

      <AnimatePresence>
        {isOpen && createPortal(
          <div style={{ position: 'fixed', inset: 0, zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            
            {/* الخلفية المعتمة */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />

            {/* البطاقة العائمة الأسطورية */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              className="relative w-[92%] max-w-[380px] bg-[#0a0a0b] border-2 border-purple-500/50 rounded-[45px] p-8 shadow-[0_0_70px_rgba(168,85,247,0.3)] flex flex-col items-center"
            >
              <button onClick={() => setIsOpen(false)} className="absolute top-6 right-8 text-white/20 hover:text-white">
                <X size={24} />
              </button>

              {/* الشعار والبيانات */}
              <img src={logoIcon} className="w-16 h-16 mb-4 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
              
              {isLoggedIn && (
                <div className="mb-6 flex flex-col items-center">
                  <div className="flex items-center gap-2 px-4 py-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded-full mb-2">
                    <Wallet size={14} className="text-yellow-500" />
                    <span className="text-yellow-500 font-black text-sm">{balance.toFixed(2)} π</span>
                  </div>
                  {isAdmin && (
                    <span className="text-[10px] text-blue-400 font-bold tracking-widest uppercase flex items-center gap-1">
                      <ShieldCheck size={12} /> Administrator
                    </span>
                  )}
                </div>
              )}

              {/* الروابط */}
              <div className="w-full space-y-3 mb-8">
                <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:border-purple-500/50 transition-all group">
                  <div className="flex items-center gap-4">
                    <Home size={20} className="text-purple-400" />
                    <span className="text-sm font-bold text-white">The Arena</span>
                  </div>
                  <ChevronRight size={18} className="opacity-20 group-hover:opacity-100" />
                </Link>

                {isLoggedIn && (
                  <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:border-blue-500/50 transition-all group">
                    <div className="flex items-center gap-4">
                      <User size={20} className="text-blue-400" />
                      <span className="text-sm font-bold text-white">My Profile</span>
                    </div>
                    <ChevronRight size={18} className="opacity-20 group-hover:opacity-100" />
                  </Link>
                )}
              </div>

              {/* تحكم الصوت - يغلق بعد 6 ثوانٍ */}
              <div className="w-full mb-8">
                <button onClick={toggleAudio} className="flex items-center gap-2 mx-auto text-purple-400 hover:text-purple-300 transition-colors">
                  <Music size={18} className={!showAudioSlider ? "animate-pulse" : ""} />
                  <span className="text-[10px] font-black tracking-widest uppercase">System Audio</span>
                </button>
                
                <AnimatePresence>
                  {showAudioSlider && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="pt-4 overflow-hidden">
                      <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                        <Slider 
                          value={[volume]} 
                          max={100} 
                          onValueChange={(v) => { setVolume(v[0]); startTimer(); }} 
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* زر تسجيل الخروج */}
              {isLoggedIn && (
                <button 
                  onClick={() => { onLogout?.(); setIsOpen(false); }}
                  className="w-full py-4 bg-gradient-to-r from-red-600 to-red-900 rounded-2xl text-white font-black text-xs tracking-widest uppercase shadow-lg shadow-red-900/20 active:scale-95 transition-all"
                >
                  Terminate Session
                </button>
              )}
              
              <p className="mt-6 text-[8px] text-white/10 font-bold tracking-[0.5em] uppercase">Protocol v.2.0.6</p>
            </motion.div>
          </div>,
          document.body
        )}
      </AnimatePresence>
    </>
  );
}
