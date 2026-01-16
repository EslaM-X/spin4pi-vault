import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, Home, User, Trophy, Wallet, ChevronRight, Music, Menu, Zap } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

// الشعارات
import logoIcon from "@/assets/spin4pi-logo.png";
import logoText from "@/assets/spin4pi-text-logo.png";

export function MobileMenu({ isLoggedIn, onLogout, balance = 0 }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAudio, setShowAudio] = useState(false);
  const [volume, setVolume] = useState(80);
  const bgMusic = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // --- محرك الصوت الأسطوري ---
  useEffect(() => {
    const audio = new Audio("https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3");
    audio.loop = true;
    bgMusic.current = audio;

    const startAudio = () => {
      audio.play().catch(() => {});
      window.removeEventListener('click', startAudio);
      window.removeEventListener('touchstart', startAudio);
    };
    window.addEventListener('click', startAudio);
    window.addEventListener('touchstart', startAudio);

    return () => { audio.pause(); if(timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  useEffect(() => {
    if (bgMusic.current) bgMusic.current.volume = volume / 100;
  }, [volume]);

  const handleToggleAudio = (e: any) => {
    e.stopPropagation();
    setShowAudio(!showAudio);
    if (!showAudio) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setShowAudio(false), 6000); // إغلاق تلقائي بعد 6 ثوانٍ
    }
  };

  return (
    <>
      {/* ستايلات إجبارية لضمان الشكل الأسطوري */}
      <style>{`
        .epic-overlay { position: fixed !important; inset: 0 !important; background: rgba(0,0,0,0.85) !important; backdrop-filter: blur(20px) !important; z-index: 999998 !important; }
        .epic-card { 
          position: fixed !important; top: 50% !important; left: 50% !important; transform: translate(-50%, -50%) !important;
          width: 90% !important; max-width: 380px !important; background: #080809 !important;
          border: 2px solid #a855f7 !important; border-radius: 50px !important; padding: 40px 25px !important;
          box-shadow: 0 0 80px rgba(168,85,247,0.4) !important; z-index: 999999 !important;
          display: flex !important; flex-direction: column !important; align-items: center !important;
        }
        .epic-link { 
          display: flex !important; justify-content: space-between !important; align-items: center !important;
          width: 100% !important; padding: 18px !important; background: rgba(255,255,255,0.03) !important;
          border-radius: 20px !important; border: 1px solid rgba(255,255,255,0.05) !important;
          text-decoration: none !important; transition: 0.3s !important;
        }
        .epic-link:hover { background: rgba(168,85,247,0.1) !important; border-color: #a855f7 !important; }
        .terminate-btn {
          width: 100% !important; padding: 18px !important; border: none !important;
          background: linear-gradient(90deg, #e11d48, #9f1239) !important;
          color: white !important; font-weight: 900 !important; border-radius: 20px !important;
          box-shadow: 0 10px 25px rgba(225,29,72,0.3) !important; cursor: pointer !important;
        }
      `}</style>

      {/* زر الهامبرجر الخارجي */}
      <button onClick={() => setIsOpen(true)} style={{ background: 'none', border: 'none', color: '#a855f7', cursor: 'pointer' }}>
        <Menu size={40} />
      </button>

      <AnimatePresence>
        {isOpen && createPortal(
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="epic-overlay" onClick={() => setIsOpen(false)} />
            
            <motion.div 
              initial={{ scale: 0.7, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.7, opacity: 0 }}
              className="epic-card"
            >
              <button onClick={() => setIsOpen(false)} style={{ position: 'absolute', top: '25px', right: '25px', background: 'none', border: 'none', color: '#444' }}><X size={24} /></button>
              
              <img src={logoIcon} style={{ width: '70px', marginBottom: '10px', filter: 'drop-shadow(0 0 15px #eab308)' }} />
              <img src={logoText} style={{ height: '22px', marginBottom: '20px' }} />
              <div style={{ fontSize: '10px', color: '#a855f7', fontWeight: 'bold', letterSpacing: '3px', marginBottom: '30px' }}>VERIFIED ECOSYSTEM</div>

              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '30px' }}>
                <Link to="/" onClick={() => setIsOpen(false)} className="epic-link">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Home size={20} color="#a855f7" />
                    <span style={{ color: 'white', fontWeight: 'bold' }}>The Arena</span>
                  </div>
                  <ChevronRight size={16} color="#333" />
                </Link>
                {isLoggedIn && (
                  <Link to="/profile" onClick={() => setIsOpen(false)} className="epic-link">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <User size={20} color="#3b82f6" />
                      <span style={{ color: 'white', fontWeight: 'bold' }}>My Account</span>
                    </div>
                    <ChevronRight size={16} color="#333" />
                  </Link>
                )}
              </div>

              {/* تحكم الصوت الذكي - 6 ثوانٍ */}
              <div style={{ width: '100%', marginBottom: '30px', textAlign: 'center' }}>
                <button onClick={handleToggleAudio} style={{ background: 'none', border: 'none', color: '#a855f7', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto' }}>
                  <Music size={18} className="animate-pulse" />
                  <span style={{ fontSize: '11px', fontWeight: '900' }}>SYSTEM AUDIO</span>
                </button>
                <AnimatePresence>
                  {showAudio && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} style={{ paddingTop: '15px', overflow: 'hidden' }}>
                      <div style={{ padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '15px' }}>
                        <Slider value={[volume]} max={100} onValueChange={(v) => { setVolume(v[0]); if(timerRef.current) { clearTimeout(timerRef.current); timerRef.current = setTimeout(() => setShowAudio(false), 6000); } }} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button onClick={() => { onLogout?.(); setIsOpen(false); }} className="terminate-btn">
                TERMINATE SESSION
              </button>
              <div style={{ marginTop: '20px', color: 'rgba(255,255,255,0.1)', fontSize: '8px', letterSpacing: '3px' }}>PIEST PROTOCOL V.2.0</div>
            </motion.div>
          </>,
          document.body
        )}
      </AnimatePresence>
    </>
  );
}
