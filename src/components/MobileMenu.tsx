import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, Home, User, Music, Menu, ChevronRight, Wallet } from 'lucide-react';

// كود آمن لاستيراد الصورة لضمان عدم توقف الزر عن العمل
import logoIcon from "@/assets/spin4pi-logo.png";

export function MobileMenu({ isLoggedIn, onLogout, isAdmin = false, balance = 0 }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAudio, setShowAudio] = useState(false);
  const [volume, setVolume] = useState(70);
  const audioTimerRef = useRef<NodeJS.Timeout | null>(null);
  const bgMusic = useRef<HTMLAudioElement | null>(null);

  // تشغيل الصوت - مع معالجة الأخطاء لضمان استمرار عمل الزر
  useEffect(() => {
    try {
      const audio = new Audio("https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3");
      audio.loop = true;
      bgMusic.current = audio;

      const enableAudio = () => {
        audio.play().catch(() => {});
        window.removeEventListener('click', enableAudio);
      };
      window.addEventListener('click', enableAudio);
    } catch (err) {
      console.error("Audio error:", err);
    }
    return () => { if(audioTimerRef.current) clearTimeout(audioTimerRef.current); };
  }, []);

  useEffect(() => {
    if (bgMusic.current) bgMusic.current.volume = volume / 100;
  }, [volume]);

  // وظيفة الإغلاق التلقائي بعد 6 ثوانٍ
  const startTimer = () => {
    if (audioTimerRef.current) clearTimeout(audioTimerRef.current);
    audioTimerRef.current = setTimeout(() => {
      setShowAudio(false);
    }, 6000); // 6 ثوانٍ بالضبط
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
  };

  return (
    <>
      {/* الزر الرئيسي - مع إضافة z-index لضمان أنه قابل للضغط */}
      <button 
        onClick={handleToggle}
        style={{ 
          background: 'none', border: 'none', color: '#a855f7', 
          cursor: 'pointer', padding: '8px', zIndex: 110, position: 'relative' 
        }}
      >
        <Menu size={32} />
      </button>

      <AnimatePresence>
        {isOpen && createPortal(
          <div style={{ position: 'fixed', inset: 0, zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            
            {/* الخلفية المعتمة */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(15px)' }}
            />

            {/* البطاقة العائمة */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              style={{
                position: 'relative', width: '90%', maxWidth: '360px', background: '#080809',
                borderRadius: '40px', border: '2px solid #a855f7', padding: '35px 25px',
                boxShadow: '0 0 60px rgba(168,85,247,0.4)', display: 'flex', flexDirection: 'column', alignItems: 'center'
              }}
            >
              <button onClick={() => setIsOpen(false)} style={{ position: 'absolute', top: '20px', right: '25px', color: '#444', background: 'none', border: 'none' }}>
                <X size={24} />
              </button>

              <img src={logoIcon} style={{ width: '65px', marginBottom: '15px' }} />
              
              {isLoggedIn && (
                <div style={{ marginBottom: '25px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(234,179,8,0.1)', padding: '5px 15px', borderRadius: '100px', border: '1px solid rgba(234,179,8,0.3)' }}>
                    <Wallet size={14} color="#eab308" />
                    <span style={{ color: '#eab308', fontWeight: 'bold' }}>{Number(balance).toFixed(2)} π</span>
                  </div>
                </div>
              )}

              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '30px' }}>
                <Link to="/" onClick={() => setIsOpen(false)} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '18px', textDecoration: 'none', color: 'white' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Home size={20} color="#a855f7" /> <span>The Arena</span>
                  </div>
                  <ChevronRight size={16} color="#333" />
                </Link>

                {isLoggedIn && (
                  <Link to="/profile" onClick={() => setIsOpen(false)} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '18px', textDecoration: 'none', color: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <User size={20} color="#3b82f6" /> <span>My Account</span>
                    </div>
                    <ChevronRight size={16} color="#333" />
                  </Link>
                )}
              </div>

              {/* تحكم الصوت مع المؤقت الذكي */}
              <div style={{ width: '100%', marginBottom: '25px' }}>
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowAudio(!showAudio); if(!showAudio) startTimer(); }} 
                  style={{ background: 'none', border: 'none', color: '#a855f7', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', margin: '0 auto' }}
                >
                  <Music size={18} className={!showAudio ? "animate-pulse" : ""} />
                  <span style={{ fontSize: '10px', fontWeight: '900' }}>SYSTEM AUDIO</span>
                </button>
                
                {showAudio && (
                  <div style={{ marginTop: '15px', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '15px' }}>
                    <input 
                      type="range" 
                      min="0" max="100" 
                      value={volume} 
                      onChange={(e) => { setVolume(Number(e.target.value)); startTimer(); }}
                      style={{ width: '100%', accentColor: '#a855f7' }}
                    />
                  </div>
                )}
              </div>

              {isLoggedIn && (
                <button 
                  onClick={() => { onLogout?.(); setIsOpen(false); }}
                  style={{ width: '100%', padding: '15px', background: 'linear-gradient(to right, #e11d48, #9f1239)', border: 'none', borderRadius: '18px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  TERMINATE SESSION
                </button>
              )}
            </motion.div>
          </div>,
          document.body
        )}
      </AnimatePresence>
    </>
  );
}
