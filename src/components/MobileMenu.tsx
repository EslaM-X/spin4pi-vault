import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, Home, User, Music, Menu, ChevronRight, Wallet } from 'lucide-react';

import logoIcon from "@/assets/spin4pi-logo.png";

export function MobileMenu({ isLoggedIn, onLogout, balance = 0 }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAudio, setShowAudio] = useState(false);
  const [volume, setVolume] = useState(70);
  const audioTimerRef = useRef<any>(null);
  const bgMusic = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio("https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3");
    audio.loop = true;
    bgMusic.current = audio;
    return () => { if(audioTimerRef.current) clearTimeout(audioTimerRef.current); };
  }, []);

  const startTimer = () => {
    if (audioTimerRef.current) clearTimeout(audioTimerRef.current);
    audioTimerRef.current = setTimeout(() => setShowAudio(false), 6000);
  };

  // دالة الفتح القسرية
  const forceOpen = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Menu Triggered");
    setIsOpen(true);
  };

  return (
    <>
      {/* الزر بوضعية قسرية لضمان التفاعل */}
      <button 
        onClick={forceOpen}
        onTouchStart={forceOpen}
        style={{ 
          background: 'rgba(168,85,247,0.1)', // خلفية خفيفة للتأكد من مكانه
          border: '1px solid rgba(168,85,247,0.4)',
          color: '#a855f7', 
          cursor: 'pointer', 
          padding: '10px', 
          zIndex: 9999, // قيمة ضخمة ليكون فوق كل شيء
          position: 'relative', // سنعيده ثابت لاحقاً لو لم يعمل
          pointerEvents: 'auto',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Menu size={28} />
      </button>

      <AnimatePresence>
        {isOpen && createPortal(
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(15px)' }}
            />

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
              style={{
                position: 'relative', width: '90%', maxWidth: '360px', background: '#080809',
                borderRadius: '40px', border: '2px solid #a855f7', padding: '35px 25px',
                boxShadow: '0 0 60px rgba(168,85,247,0.4)', display: 'flex', flexDirection: 'column', alignItems: 'center'
              }}
            >
              <button onClick={() => setIsOpen(false)} style={{ position: 'absolute', top: '20px', right: '25px', color: '#444', background: 'none', border: 'none' }}><X size={24} /></button>

              <img src={logoIcon} style={{ width: '60px', marginBottom: '15px' }} />
              
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '25px' }}>
                <Link to="/" onClick={() => setIsOpen(false)} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '18px', textDecoration: 'none', color: 'white' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Home size={18} color="#a855f7" /> <span>The Arena</span></div>
                  <ChevronRight size={16} color="#333" />
                </Link>
                {isLoggedIn && (
                  <Link to="/profile" onClick={() => setIsOpen(false)} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '18px', textDecoration: 'none', color: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><User size={18} color="#3b82f6" /> <span>My Account</span></div>
                    <ChevronRight size={16} color="#333" />
                  </Link>
                )}
              </div>

              <div style={{ width: '100%', marginBottom: '20px' }}>
                <button onClick={(e) => { e.stopPropagation(); setShowAudio(!showAudio); if(!showAudio) startTimer(); }} style={{ background: 'none', border: 'none', color: '#a855f7', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', margin: '0 auto' }}>
                  <Music size={18} className={!showAudio ? "animate-pulse" : ""} />
                  <span style={{ fontSize: '10px', fontWeight: '900' }}>AUDIO SYSTEM</span>
                </button>
                {showAudio && (
                  <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '15px' }}>
                    <input type="range" min="0" max="100" value={volume} onChange={(e) => { setVolume(Number(e.target.value)); startTimer(); if(bgMusic.current) bgMusic.current.volume = Number(e.target.value)/100; bgMusic.current.play(); }} style={{ width: '100%', accentColor: '#a855f7' }} />
                  </div>
                )}
              </div>

              {isLoggedIn && (
                <button onClick={() => { onLogout?.(); setIsOpen(false); }} style={{ width: '100%', padding: '15px', background: 'linear-gradient(to right, #e11d48, #9f1239)', border: 'none', borderRadius: '18px', color: 'white', fontWeight: 'bold' }}>TERMINATE</button>
              )}
            </motion.div>
          </div>,
          document.body
        )}
      </AnimatePresence>
    </>
  );
}
