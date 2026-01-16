import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, Home, User, Trophy, Wallet, ChevronRight, Music, Menu, Zap } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

import logoIcon from "@/assets/spin4pi-logo.png";
import logoText from "@/assets/spin4pi-text-logo.png";

export function MobileMenu({ isLoggedIn, onLogout, isAdmin = false, balance = 0 }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAudio, setShowAudio] = useState(false);
  const [volume, setVolume] = useState(80);
  
  const bgMusic = useRef<HTMLAudioElement | null>(null);
  const audioTimer = useRef<NodeJS.Timeout | null>(null);

  // نظام الصوت - محرك قوي للتشغيل
  useEffect(() => {
    const audio = new Audio("https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3");
    audio.loop = true;
    audio.volume = volume / 100;
    bgMusic.current = audio;

    const forcePlay = () => {
      audio.play().catch(() => {});
      window.removeEventListener('touchstart', forcePlay);
      window.removeEventListener('mousedown', forcePlay);
    };

    window.addEventListener('touchstart', forcePlay);
    window.addEventListener('mousedown', forcePlay);

    return () => { audio.pause(); if(audioTimer.current) clearTimeout(audioTimer.current); };
  }, []);

  useEffect(() => {
    if (bgMusic.current) bgMusic.current.volume = volume / 100;
  }, [volume]);

  // مؤقت الإغلاق الذكي (6 ثوانٍ)
  const startAudioTimer = () => {
    if (audioTimer.current) clearTimeout(audioTimer.current);
    audioTimer.current = setTimeout(() => setShowAudio(false), 6000);
  };

  const handleToggleAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowAudio(!showAudio);
    if (!showAudio) startAudioTimer();
  };

  const menuContent = (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* الخلفية المعتمة */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(15px)' }}
          />

          {/* البطاقة العائمة الأسطورية (نفس الصورة بضبط) */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            style={{
              position: 'relative', width: '90%', maxWidth: '380px', backgroundColor: '#0a0a0b',
              borderRadius: '45px', border: '3px solid rgba(168,85,247,0.5)',
              padding: '40px 30px', boxShadow: '0 0 80px rgba(168,85,247,0.4)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'
            }}
          >
            {/* زر الإغلاق X */}
            <button onClick={() => setIsOpen(false)} style={{ position: 'absolute', top: '25px', right: '25px', color: 'rgba(255,255,255,0.3)' }}>
              <X size={24} />
            </button>

            {/* الشعار */}
            <motion.img animate={{ y: [0, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}
              src={logoIcon} style={{ width: '70px', height: '70px', marginBottom: '10px', filter: 'drop-shadow(0 0 15px rgba(234,179,8,0.7))' }} 
            />
            <img src={logoText} style={{ height: '24px', marginBottom: '15px' }} />
            <div style={{ fontSize: '10px', color: '#a855f7', fontWeight: '900', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '30px', padding: '5px 15px', backgroundColor: 'rgba(168,85,247,0.1)', borderRadius: '20px', border: '1px solid rgba(168,85,247,0.2)' }}>
              Verified Ecosystem
            </div>

            {/* الروابط */}
            <div style={{ width: '100%', gap: '12px', display: 'flex', flexDirection: 'column', marginBottom: '30px' }}>
              <Link to="/" onClick={() => setIsOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <Home size={20} color="#a855f7" />
                  <span style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>The Arena</span>
                </div>
                <ChevronRight size={16} color="rgba(255,255,255,0.2)" />
              </Link>

              {isLoggedIn && (
                <Link to="/profile" onClick={() => setIsOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', textDecoration: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <User size={20} color="#3b82f6" />
                    <span style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>My Account</span>
                  </div>
                  <ChevronRight size={16} color="rgba(255,255,255,0.2)" />
                </Link>
              )}
            </div>

            {/* التحكم في الصوت (6 ثوانٍ) */}
            <div style={{ width: '100%', marginBottom: '30px' }}>
              <button onClick={handleToggleAudio} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#a855f7', background: 'none', border: 'none', cursor: 'pointer', margin: '0 auto' }}>
                <Music size={20} className="animate-pulse" />
                <span style={{ fontSize: '11px', fontWeight: '900', letterSpacing: '1px' }}>SYSTEM AUDIO</span>
              </button>
              
              <AnimatePresence>
                {showAudio && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ paddingTop: '15px' }}>
                    <div style={{ backgroundColor: 'rgba(0,0,0,0.5)', padding: '15px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <Slider value={[volume]} max={100} onValueChange={(v) => { setVolume(v[0]); startAudioTimer(); }} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* زر الخروج الأحمر */}
            <button 
              onClick={() => { onLogout?.(); setIsOpen(false); }}
              style={{ width: '100%', padding: '18px', background: 'linear-gradient(to right, #e11d48, #9f1239)', borderRadius: '20px', color: 'white', fontWeight: '900', fontSize: '12px', letterSpacing: '2px', border: 'none', boxShadow: '0 10px 20px rgba(225,29,72,0.3)', textTransform: 'uppercase' }}
            >
              Terminate Session
            </button>
            <div style={{ marginTop: '20px', color: 'rgba(255,255,255,0.1)', fontSize: '9px', fontWeight: 'bold', letterSpacing: '4px' }}>
              PIEST PROTOCOL V.2.0
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button onClick={() => setIsOpen(true)} style={{ background: 'none', border: 'none', color: '#a855f7', cursor: 'pointer', padding: '10px' }}>
        <Menu size={38} />
      </button>
      {createPortal(menuContent, document.body)}
    </>
  );
}
