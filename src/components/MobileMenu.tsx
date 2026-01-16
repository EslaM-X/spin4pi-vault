import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, X, Home, User, Trophy, Wallet, LogOut, ChevronRight, 
  Crown, ShieldCheck, History, ShoppingBag, Scale, LayoutDashboard, Gem,
  Music, Sparkles, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
// تأكد من أن مسار SoundControls صحيح
import { SoundControls } from './SoundControls'; 

// تأكد من وجود هذين الملفين في مسار assets
import logoText from "@/assets/spin4pi-text-logo.png"; 
import logoIcon from "@/assets/spin4pi-logo.png";

// =========================================================
// ************ مكون SoundControls المعدل  ************
// =========================================================
// هذا الكود هو نفسه الذي تم تزويدك به سابقاً مع التعديلات
// على خاصية التلاشي، وهو جاهز للعمل.
// فقط تأكد أنه محفوظ في ملف SoundControls.tsx
// =========================================================
export const SoundControlsComponent = forwardRef((props, ref) => {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(70);
  const [showSlider, setShowSlider] = useState(false);
  
  const bgMusic = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fadeOutAndPause = () => {
    if (!bgMusic.current) return;
    
    const fadeInterval = setInterval(() => {
      if (bgMusic.current && bgMusic.current.volume > 0.05) {
        bgMusic.current.volume -= 0.05;
      } else {
        if (bgMusic.current) {
          bgMusic.current.pause();
          bgMusic.current.volume = volume / 100;
        }
        clearInterval(fadeInterval);
      }
    }, 100);
  };

  useImperativeHandle(ref, () => ({
    fadeOut: fadeOutAndPause
  }));

  useEffect(() => {
    const musicUrl = "https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3";
    bgMusic.current = new Audio(musicUrl);
    bgMusic.current.loop = true;
    bgMusic.current.volume = volume / 100;

    const playMusic = () => {
      if (!isMuted && bgMusic.current) {
        bgMusic.current.play().catch(() => {});
      }
    };

    document.addEventListener('click', playMusic, { once: true });
    
    return () => {
      bgMusic.current?.pause();
      document.removeEventListener('click', playMusic);
    };
  }, []);

  useEffect(() => {
    if (bgMusic.current) {
      bgMusic.current.volume = isMuted ? 0 : volume / 100;
      if (isMuted) bgMusic.current.pause();
      else bgMusic.current.play().catch(() => {});
    }
  }, [volume, isMuted]);

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShowSlider(false), 10000);
  };

  return (
    <div className="relative flex items-center gap-2">
      <AnimatePresence>
        {showSlider && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute right-full mr-4 flex items-center gap-3 bg-black/90 backdrop-blur-2xl border border-purple-500/30 p-3 rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.3)]"
          >
            <Zap size={14} className="text-yellow-500 animate-pulse" />
            <Slider
              value={[isMuted ? 0 : volume]}
              max={100}
              onValueChange={(val) => { setVolume(val[0]); setIsMuted(val[0] === 0); resetTimer(); }}
              className="w-24 cursor-pointer"
            />
            <span className="text-[10px] font-black text-purple-400 w-8">{isMuted ? 0 : volume}%</span>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => { setShowSlider(!showSlider); if(!showSlider) resetTimer(); }}
        className={`h-10 w-10 rounded-xl transition-all ${
          showSlider ? 'bg-purple-600 text-white shadow-lg' : 'bg-white/5 text-purple-400 hover:bg-white/10'
        }`}
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} className="animate-pulse" />}
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => { setIsMuted(!isMuted); resetTimer(); }}
        className={`h-10 w-10 rounded-xl border transition-all ${
          isMuted ? 'border-red-500/40 bg-red-500/10 text-red-500' : 'border-white/5 text-white/20 hover:text-white'
        }`}
      >
        <Music size={16} className={!isMuted ? "animate-spin-slow" : ""} />
      </Button>
    </div>
  );
});

// =========================================================
// ************ مكون MobileMenu النهائي  ************
// =========================================================

export function MobileMenu({ isLoggedIn, onLogout, isAdmin = false, balance = 0 }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const soundRef = useRef<any>(null); // Ref للتحكم في الصوت

  const playSound = useCallback((type: 'open' | 'click') => {
    try {
      const audio = new Audio(
        type === 'open' 
          ? 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3' 
          : 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'
      );
      audio.volume = 0.1;
      audio.play().catch(() => {});
    } catch (e) { console.error("Audio play failed"); }
  }, []);

  useEffect(() => { setIsOpen(false); }, [location.pathname]);

  const handleToggle = () => {
    if (!isOpen) playSound('open');
    setIsOpen(!isOpen);
  };

  const MenuContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            style={{ 
              position: 'fixed', inset: 0, zIndex: 99999, 
              background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)' 
            }}
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{ 
              position: 'fixed', top: 0, right: 0, height: '100%', width: '320px', 
              zIndex: 100000, backgroundColor: '#050608', 
              borderLeft: '1px solid rgba(168, 85, 247, 0.2)',
              display: 'flex', flexDirection: 'column', overflow: 'hidden' // مهم للـ particles
            }}
          >
            {/* الخلفية الديناميكية (الرادار) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 z-0">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-32 bg-gradient-to-b from-transparent via-purple-500 to-transparent"
                  initial={{ top: "-100%", left: `${i * 15}%`, filter: `blur(${Math.random() * 2}px)` }}
                  animate={{ top: "100%" }}
                  transition={{ duration: Math.random() * 2 + 2, repeat: Infinity, ease: "linear", delay: Math.random() * 1 }}
                />
              ))}
            </div>

            {/* رأس القائمة مع الشعار الكامل (أيقونة + نص) */}
            <div className="relative p-8 pt-12 flex flex-col items-center border-b border-white/5 z-10">
              <div className="relative flex items-center gap-3 mb-6">
                <motion.img 
                  animate={{ y: [0, -3, 0] }} 
                  transition={{ duration: 3, repeat: Infinity }} 
                  src={logoIcon} 
                  className="w-12 h-12 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" 
                />
                <img src={logoText} alt="Spin4Pi" className="h-8 w-auto brightness-125 drop-shadow-[0_0_10px_rgba(168,85,247,0.4)]" />
              </div>

              {isLoggedIn && (
                // بطاقة الرصيد التفاعلية مع تأثير البريق والعداد
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.01, boxShadow: "0 0 25px rgba(234, 179, 8, 0.3)" }}
                  className="relative overflow-hidden w-full bg-gradient-to-br from-white/10 to-transparent border border-white/10 rounded-2xl p-5"
                >
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-yellow-500/20 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.4)]">
                          <Wallet size={20} className="text-yellow-500" />
                       </div>
                       <div>
                         <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Global Assets</p>
                         <motion.p 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            className="text-xl font-black text-white"
                         >
                           {/* هنا يمكن إضافة Animated Counter لزيادة الفخامة */}
                           {(balance || 0).toFixed(2)} <span className="text-yellow-500 text-sm">π</span>
                         </motion.p>
                       </div>
                    </div>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}>
                       <Sparkles size={18} className="text-yellow-500/50" />
                    </motion.div>
                  </div>
                  {/* تأثير "المسح" الضوئي على البطاقة */}
                  <motion.div 
                    animate={{ x: ["-100%", "200%"] }} 
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12" 
                  />
                </motion.div>
              )}

              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsOpen(false)} 
                className="absolute top-4 right-4 text-white/30 hover:text-white"
              >
                <X size={24} />
              </Button>
            </div>

            {/* نظام الصوت المدمج (المعدل) */}
            <div className="px-8 py-3 bg-white/[0.02] border-b border-white/5 flex items-center justify-between z-10">
              <div className="flex items-center gap-2 text-white/40">
                <Music size={14} />
                <span className="text-[9px] font-bold uppercase">Audio Controls</span>
              </div>
              <SoundControlsComponent ref={soundRef} /> {/* استخدام المكون المعدل مع الرف */}
            </div>

            {/* روابط التنقل */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar z-10">
              <MenuLink to="/" icon={<Home size={18}/>} label="The Arena" active={location.pathname === '/'} onClick={() => playSound('click')} />
              
              {isLoggedIn && (
                <>
                  <p className="text-[8px] text-white/20 font-black uppercase tracking-[0.4em] pt-4 pb-2 px-4">Menu</p>
                  <MenuLink to="/profile" icon={<User size={18}/>} label="My Account" active={location.pathname === '/profile'} onClick={() => playSound('click')} />
                  <MenuLink to="/achievements" icon={<Trophy size={18}/>} label="Leaderboard" active={location.pathname === '/achievements'} onClick={() => playSound('click')} />
                  <MenuLink to="/vip-benefits" icon={<Gem size={18}/>} label="VIP Perks" active={location.pathname === '/vip-benefits'} onClick={() => playSound('click')} />
                  <MenuLink to="/withdrawals" icon={<Wallet size={18}/>} label="Vault" active={location.pathname === '/withdrawals'} onClick={() => playSound('click')} />
                  <MenuLink to="/marketplace" icon={<ShoppingBag size={18}/>} label="Marketplace" active={location.pathname === '/marketplace'} onClick={() => playSound('click')} />
                  <MenuLink to="/withdrawal-history" icon={<History size={18}/>} label="Activity Log" active={location.pathname === '/withdrawal-history'} onClick={() => playSound('click')} />
                </>
              )}

              {isAdmin && (
                <div className="mt-4 pt-4 border-t border-white/5">
                  <MenuLink to="/admin" icon={<LayoutDashboard size={18} className="text-red-500"/>} label="Admin Dashboard" active={location.pathname === '/admin'} onClick={() => playSound('click')} />
                </div>
              )}
            </nav>

            {/* زر الخروج مع تأثير التلاشي */}
            <div className="p-6 bg-black z-10">
              {isLoggedIn ? (
                <button 
                  onClick={() => { 
                    playSound('click'); 
                    soundRef.current?.fadeOut(); // تشغيل التلاشي قبل الخروج
                    setTimeout(() => {
                      onLogout?.(); 
                      setIsOpen(false);
                    }, 1500); // ننتظر 1.5 ثانية حتى ينتهي التلاشي ثم نخرج
                  }} 
                  className="w-full py-3.5 rounded-xl bg-red-600/10 border border-red-500/20 text-red-500 font-bold text-[10px] tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-red-600/20 transition-all"
                >
                  <LogOut size={16} /> Disconnect
                </button>
              ) : (
                <p className="text-[8px] text-white/10 text-center tracking-[0.4em] uppercase">Spin4Pi Security</p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <motion.button 
        whileTap={{ scale: 0.9 }} 
        onClick={handleToggle} 
        className="relative z-50 p-2 text-white/80 hover:text-purple-400 transition-colors"
      >
        <Menu size={36} />
      </motion.button>
      {typeof document !== 'undefined' && createPortal(MenuContent, document.body)}
    </>
  );
}

function MenuLink({ to, icon, label, active, onClick }: any) {
  const [showParticles, setShowParticles] = useState(false);
  const particleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleClick = (e: React.MouseEvent) => {
    onClick?.();
    setShowParticles(true);
    if (particleTimeoutRef.current) clearTimeout(particleTimeoutRef.current);
    particleTimeoutRef.current = setTimeout(() => setShowParticles(false), 500); // إخفاء الجزيئات بعد 0.5 ثانية
  };

  return (
    <Link to={to} onClick={handleClick} className="group block relative overflow-hidden">
      <div className={`flex items-center gap-4 p-4 rounded-xl transition-all relative z-10 ${active ? 'bg-purple-600/10 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]' : 'hover:bg-white/5 border border-transparent'}`}>
        <div className={`${active ? 'text-purple-400' : 'text-white/40 group-hover:text-purple-400'}`}>{icon}</div>
        <span className={`text-[12px] font-bold uppercase tracking-wide ${active ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>{label}</span>
      </div>
      {showParticles && (
        <motion.div
          initial={{ opacity: 1, scale: 0.5 }}
          animate={{ opacity: 0, scale: 1.5 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
        >
          <div className="w-10 h-10 bg-purple-500/50 rounded-full blur-md opacity-70" />
        </motion.div>
      )}
    </Link>
  );
}
