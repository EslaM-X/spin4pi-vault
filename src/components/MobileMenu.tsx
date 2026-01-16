import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, Home, User, Trophy, Music, Menu, ChevronRight } from 'lucide-react';

// تأكد أن هذه المسارات صحيحة في جهازك
import logoIcon from "@/assets/spin4pi-logo.png";
import logoText from "@/assets/spin4pi-text-logo.png";

export function MobileMenu({ isLoggedIn, onLogout }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAudio, setShowAudio] = useState(false);
  const [volume, setVolume] = useState(80);
  const bgMusic = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<any>(null);

  // تشغيل الموسيقى
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

    return () => { audio.pause(); if(timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  useEffect(() => {
    if (bgMusic.current) bgMusic.current.volume = volume / 100;
  }, [volume]);

  const handleAudioToggle = (e: any) => {
    e.stopPropagation();
    setShowAudio(!showAudio);
    if (!showAudio) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setShowAudio(false), 6000); // 6 ثواني
    }
  };

  return (
    <>
      {/* زر القائمة الأصلي في الهيدر */}
      <button onClick={() => setIsOpen(true)} style={{ background: 'none', border: 'none', color: '#a855f7', padding: '10px' }}>
        <Menu size={35} />
      </button>

      <AnimatePresence>
        {isOpen && createPortal(
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(15px)' }} 
            />
            
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
              style={{
                position: 'relative', width: '90%', maxWidth: '360px', background: '#0a0a0b',
                borderRadius: '40px', border: '2px solid #a855f7', padding: '30px',
                boxShadow: '0 0 50px rgba(168,85,247,0.4)', display: 'flex', flexDirection: 'column', alignItems: 'center'
              }}
            >
              <button onClick={() => setIsOpen(false)} style={{ position: 'absolute', top: '20px', right: '20px', color: '#444', background: 'none', border: 'none' }}>
                <X size={24} />
              </button>

              <img src={logoIcon} style={{ width: '60px', marginBottom: '10px' }} />
              <img src={logoText} style={{ height: '20px', marginBottom: '25px' }} />

              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                <Link to="/" onClick={() => setIsOpen(false)} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '15px', textDecoration: 'none', color: 'white' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Home size={20} color="#a855f7" /> <span>The Arena</span>
                  </div>
                  <ChevronRight size={16} />
                </Link>
                {isLoggedIn && (
                  <Link to="/profile" onClick={() => setIsOpen(false)} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '15px', textDecoration: 'none', color: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <User size={20} color="#3b82f6" /> <span>Account</span>
                    </div>
                    <ChevronRight size={16} />
                  </Link>
                )}
              </div>

              {/* تحكم الصوت */}
              <div style={{ marginBottom: '20px' }}>
                <button onClick={handleAudioToggle} style={{ background: 'none', border: 'none', color: '#a855f7', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <Music size={20} /> <span style={{fontSize: '10px', fontWeight: 'bold'}}>SYSTEM AUDIO</span>
                </button>
                {showAudio && (
                  <div style={{ marginTop: '10px', padding: '10px', background: '#111', borderRadius: '10px' }}>
                    <input type="range" min="0" max="100" value={volume} onChange={(e) => {setVolume(Number(e.target.value)); resetTimer();}} style={{width: '100px'}} />
                  </div>
                )}
              </div>

              <button 
                onClick={() => { onLogout?.(); setIsOpen(false); }}
                style={{ width: '100%', padding: '15px', background: 'linear-gradient(to right, #e11d48, #9f1239)', border: 'none', borderRadius: '15px', color: 'white', fontWeight: 'bold' }}
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
