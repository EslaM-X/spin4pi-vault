import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, Home, User, Trophy, Music, Menu, ChevronRight } from 'lucide-react';

// استخدام الـ Try/Catch للصور لتجنب فشل الـ Build
let logoIcon = "";
let logoText = "";

try {
  // حاول استيراد الصور - إذا فشل سيتركها فارغة ولن يتوقف الموقع
  import("@/assets/spin4pi-logo.png").then(res => logoIcon = res.default).catch(() => {});
  import("@/assets/spin4pi-text-logo.png").then(res => logoText = res.default).catch(() => {});
} catch (e) {
  console.error("Images not found");
}

export function MobileMenu({ isLoggedIn, onLogout }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAudio, setShowAudio] = useState(false);
  const [volume, setVolume] = useState(80);
  const bgMusic = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    // رابط موسيقى خارجي مضمون للعمل
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

  const resetAudioTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShowAudio(false), 6000); // إغلاق بعد 6 ثوانٍ
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} style={{ background: 'none', border: 'none', color: '#a855f7', cursor: 'pointer' }}>
        <Menu size={40} />
      </button>

      <AnimatePresence>
        {isOpen && createPortal(
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(20px)' }} 
            />
            
            <motion.div 
              initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }}
              style={{
                position: 'relative', width: '90%', maxWidth: '380px', background: '#080809',
                borderRadius: '50px', border: '2px solid #a855f7', padding: '40px 30px',
                boxShadow: '0 0 100px rgba(168,85,247,0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center'
              }}
            >
              <button onClick={() => setIsOpen(false)} style={{ position: 'absolute', top: '25px', right: '30px', color: '#444', background: 'none', border: 'none' }}>
                <X size={26} />
              </button>

              {/* عرض الشعار فقط إذا وجد الملف */}
              {logoIcon && <img src={logoIcon} style={{ width: '70px', marginBottom: '10px' }} />}
              {logoText && <img src={logoText} style={{ height: '22px', marginBottom: '20px' }} />}
              
              <div style={{ fontSize: '10px', color: '#a855f7', fontWeight: 'bold', letterSpacing: '4px', marginBottom: '35px', padding: '6px 16px', background: 'rgba(168,85,247,0.1)', borderRadius: '100px' }}>
                VERIFIED ECOSYSTEM
              </div>

              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '30px' }}>
                <Link to="/" onClick={() => setIsOpen(false)} style={{ display: 'flex', justifyContent: 'space-between', padding: '18px', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', textDecoration: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Home size={20} color="#a855f7" /> <span style={{color:'white', fontWeight:'bold'}}>The Arena</span>
                  </div>
                  <ChevronRight size={16} color="#333" />
                </Link>
                {isLoggedIn && (
                  <Link to="/profile" onClick={() => setIsOpen(false)} style={{ display: 'flex', justifyContent: 'space-between', padding: '18px', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', textDecoration: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <User size={20} color="#3b82f6" /> <span style={{color:'white', fontWeight:'bold'}}>My Account</span>
                    </div>
                    <ChevronRight size={16} color="#333" />
                  </Link>
                )}
              </div>

              {/* نظام الصوت الذكي */}
              <div style={{ width: '100%', marginBottom: '30px', textAlign: 'center' }}>
                <button onClick={(e) => { e.stopPropagation(); setShowAudio(!showAudio); if(!showAudio) resetAudioTimer(); }} style={{ background: 'none', border: 'none', color: '#a855f7', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', margin: '0 auto' }}>
                  <Music size={20} className="animate-pulse" />
                  <span style={{ fontSize: '11px', fontWeight: '900' }}>SYSTEM AUDIO</span>
                </button>
                <AnimatePresence>
                  {showAudio && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} style={{ overflow: 'hidden', paddingTop: '15px' }}>
                      <div style={{ padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '15px' }}>
                        <input type="range" min="0" max="100" value={volume} onChange={(e) => { setVolume(Number(e.target.value)); resetAudioTimer(); }} style={{ width: '100%' }} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button 
                onClick={() => { onLogout?.(); setIsOpen(false); }}
                style={{ width: '100%', padding: '20px', background: 'linear-gradient(to right, #e11d48, #9f1239)', border: 'none', borderRadius: '20px', color: 'white', fontWeight: 'bold', boxShadow: '0 10px 20px rgba(225,29,72,0.3)' }}
              >
                TERMINATE SESSION
              </button>
            </motion.div>
          </div>,
          document.body
        )}
      </AnimatePresence>
    </>
  );
}
