import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, Home, User, Trophy, ChevronRight, Music, Menu } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

// الشعارات الأصلية
import logoIcon from "@/assets/spin4pi-logo.png";
import logoText from "@/assets/spin4pi-text-logo.png";

export function MobileMenu({ isLoggedIn, onLogout }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAudio, setShowAudio] = useState(false);
  const [volume, setVolume] = useState(80);
  const bgMusic = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // --- محرك الصوت (يبدأ مع أول لمسة للشاشة) ---
  useEffect(() => {
    const audio = new Audio("https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3");
    audio.loop = true;
    bgMusic.current = audio;

    const startAudio = () => {
      audio.play().catch(() => {});
      window.removeEventListener('touchstart', startAudio);
      window.removeEventListener('click', startAudio);
    };
    window.addEventListener('touchstart', startAudio);
    window.addEventListener('click', startAudio);

    return () => { audio.pause(); if(timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  useEffect(() => {
    if (bgMusic.current) bgMusic.current.volume = volume / 100;
  }, [volume]);

  // مؤقت إغلاق إعدادات الصوت تلقائياً بعد 6 ثوانٍ
  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShowAudio(false), 6000);
  };

  const handleToggleAudio = (e: any) => {
    e.stopPropagation();
    setShowAudio(!showAudio);
    if (!showAudio) resetTimer();
  };

  return (
    <>
      {/* زر الهامبرجر - أضفت له !important لضمان ظهوره */}
      <button 
        onClick={() => setIsOpen(true)} 
        style={{ background: 'none !important', border: 'none !important', color: '#a855f7 !important', cursor: 'pointer !important', padding: '10px !important' }}
      >
        <Menu size={40} />
      </button>

      <AnimatePresence>
        {isOpen && createPortal(
          <div style={{ position: 'fixed', inset: 0, zIndex: 999999999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            
            {/* الخلفية المعتمة - تجبر الشاشة على السواد والضباب */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              style={{ 
                position: 'absolute', inset: 0, 
                backgroundColor: 'rgba(0,0,0,0.92)', 
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)' 
              }} 
            />
            
            {/* البطاقة العائمة الإمبراطورية - استخدام Inline Styles مع !important */}
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.5, opacity: 0 }}
              style={{
                position: 'relative', width: '90%', maxWidth: '380px',
                backgroundColor: '#080809', borderRadius: '50px',
                border: '3px solid #a855f7', padding: '45px 25px',
                boxShadow: '0 0 100px rgba(168,85,247,0.5)',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                zIndex: 1000000000
              }}
            >
              {/* زر الإغلاق */}
              <button onClick={() => setIsOpen(false)} style={{ position: 'absolute', top: '25px', right: '30px', background: 'none', border: 'none', color: '#555', cursor: 'pointer' }}>
                <X size={26} />
              </button>
              
              {/* الشعار */}
              <img src={logoIcon} style={{ width: '75px', height: '75px', marginBottom: '10px', filter: 'drop-shadow(0 0 15px #eab308)' }} />
              <img src={logoText} style={{ height: '22px', marginBottom: '20px' }} />
              <div style={{ fontSize: '10px', color: '#a855f7', fontWeight: '900', letterSpacing: '4px', marginBottom: '35px', padding: '6px 16px', background: 'rgba(168,85,247,0.1)', borderRadius: '100px' }}>
                VERIFIED ECOSYSTEM
              </div>

              {/* الروابط بستايل فخم جداً */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
                <Link to="/" onClick={() => setIsOpen(false)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '25px', border: '1px solid rgba(255,255,255,0.06)', textDecoration: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <Home size={22} color="#a855f7" />
                    <span style={{ color: 'white', fontWeight: 'bold', fontSize: '15px' }}>The Arena</span>
                  </div>
                  <ChevronRight size={18} color="#333" />
                </Link>

                {isLoggedIn && (
                  <>
                    <Link to="/profile" onClick={() => setIsOpen(false)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '25px', border: '1px solid rgba(255,255,255,0.06)', textDecoration: 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <User size={22} color="#3b82f6" />
                        <span style={{ color: 'white', fontWeight: 'bold', fontSize: '15px' }}>My Account</span>
                      </div>
                      <ChevronRight size={18} color="#333" />
                    </Link>
                    <Link to="/achievements" onClick={() => setIsOpen(false)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '25px', border: '1px solid rgba(255,255,255,0.06)', textDecoration: 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <Trophy size={22} color="#eab308" />
                        <span style={{ color: 'white', fontWeight: 'bold', fontSize: '15px' }}>Leaderboard</span>
                      </div>
                      <ChevronRight size={18} color="#333" />
                    </Link>
                  </>
                )}
              </div>

              {/* تحكم الصوت الذكي - 6 ثوانٍ */}
              <div style={{ width: '100%', marginBottom: '35px', textAlign: 'center' }}>
                <button onClick={handleToggleAudio} style={{ background: 'none', border: 'none', color: '#a855f7', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', margin: '0 auto' }}>
                  <Music size={20} className="animate-pulse" />
                  <span style={{ fontSize: '12px', fontWeight: '900', letterSpacing: '1px' }}>SYSTEM AUDIO</span>
                </button>
                <AnimatePresence>
                  {showAudio && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden', paddingTop: '15px' }}>
                      <div style={{ padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px' }}>
                        <Slider 
                          value={[volume]} 
                          max={100} 
                          onValueChange={(v) => { setVolume(v[0]); resetTimer(); }} 
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button 
                onClick={() => { onLogout?.(); setIsOpen(false); }} 
                style={{ 
                  width: '100%', padding: '20px', 
                  background: 'linear-gradient(to right, #e11d48, #9f1239)', 
                  borderRadius: '25px', border: 'none', color: 'white', 
                  fontWeight: 'bold', letterSpacing: '2px', 
                  boxShadow: '0 10px 30px rgba(225,29,72,0.4)', cursor: 'pointer' 
                }}
              >
                TERMINATE SESSION
              </button>
              
              <div style={{ marginTop: '20px', color: 'rgba(255,255,255,0.1)', fontSize: '9px', fontWeight: 'bold', letterSpacing: '4px' }}>
                PIEST PROTOCOL V.2.0
              </div>
            </motion.div>
          </div>,
          document.body
        )}
      </AnimatePresence>
    </>
  );
}
