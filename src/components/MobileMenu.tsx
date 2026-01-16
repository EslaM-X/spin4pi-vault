import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, Home, User, Trophy, Music, Menu, ChevronRight } from 'lucide-react';

export function MobileMenu({ isLoggedIn, onLogout }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAudio, setShowAudio] = useState(false);
  const [volume, setVolume] = useState(80);
  const bgMusic = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<any>(null);

  // التأكد من أن الـ Portal سيجد مكاناً للعمل فيه
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); return () => setMounted(false); }, []);

  useEffect(() => {
    const audio = new Audio("https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3");
    audio.loop = true;
    bgMusic.current = audio;
    
    const startAudio = () => {
      audio.play().catch(() => {});
      window.removeEventListener('click', startAudio);
    };
    window.addEventListener('click', startAudio);
    return () => { audio.pause(); };
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* زر الهامبرجر - تأكد أنه لا يوجد شيء فوقه يمنع الضغط */}
      <button 
        onClick={(e) => { e.stopPropagation(); setIsOpen(true); }} 
        style={{ background: 'none', border: 'none', color: '#a855f7', cursor: 'pointer', zIndex: 50 }}
      >
        <Menu size={35} />
      </button>

      <AnimatePresence>
        {isOpen && createPortal(
          <div style={{ position: 'fixed', inset: 0, zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)' }} 
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              style={{
                position: 'relative', width: '85%', maxWidth: '350px', background: '#0a0a0b',
                borderRadius: '30px', border: '1px solid #a855f7', padding: '30px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 100001
              }}
            >
              <button onClick={() => setIsOpen(false)} style={{ position: 'absolute', top: '15px', right: '15px', color: '#444', background: 'none', border: 'none' }}>
                <X size={24} />
              </button>

              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
                <Link to="/" onClick={() => setIsOpen(false)} style={{ color: 'white', textDecoration: 'none', padding: '15px', background: '#111', borderRadius: '15px' }}>
                   The Arena
                </Link>
                {isLoggedIn && (
                  <Link to="/profile" onClick={() => setIsOpen(false)} style={{ color: 'white', textDecoration: 'none', padding: '15px', background: '#111', borderRadius: '15px' }}>
                    My Account
                  </Link>
                )}
                <button 
                  onClick={() => { onLogout?.(); setIsOpen(false); }}
                  style={{ marginTop: '20px', padding: '15px', background: 'red', border: 'none', borderRadius: '15px', color: 'white', fontWeight: 'bold' }}
                >
                  LOGOUT
                </button>
              </div>
            </motion.div>
          </div>,
          document.body
        )}
      </AnimatePresence>
    </>
  );
}
