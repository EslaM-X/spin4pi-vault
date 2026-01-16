import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  X, LayoutGrid, UserCircle, Trophy, Users, 
  Settings, Volume2, ChevronRight, Sparkles,
  ShieldCheck, ShoppingCart, Info, History, Medal
} from 'lucide-react';
import logoIcon from "@/assets/spin4pi-logo.png";

import bgMusic from "@/assets/sounds/bg-music.mp3";

export function MobileMenu({ isLoggedIn, onLogout, isAdmin }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(() => localStorage.getItem('isMuted') === 'true');
  const navigate = useNavigate();
  const location = useLocation();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(bgMusic);
      audioRef.current.loop = true;
    }

    if (isLoggedIn && !isMuted) {
      // بدء الصوت من الصفر لتفعيل التلاشي
      audioRef.current.volume = 0;
      audioRef.current.play().then(() => {
        // دالة التلاشي (Fade-in)
        let vol = 0;
        const fadeInInterval = setInterval(() => {
          if (vol < 0.3) { // 0.3 هو مستوى الصوت النهائي المريح
            vol += 0.02;
            if (audioRef.current) audioRef.current.volume = vol;
          } else {
            clearInterval(fadeInInterval);
          }
        }, 100); // زيادة الصوت كل 100 مللي ثانية
      }).catch(err => console.log("Waiting for user interaction"));
    } else {
      audioRef.current.pause();
    }

    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, [isLoggedIn]);

  const toggleMute = () => {
    const newState = !isMuted;
    setIsMuted(newState);
    localStorage.setItem('isMuted', String(newState));

    if (audioRef.current) {
      if (newState) {
        audioRef.current.pause();
      } else if (isLoggedIn) {
        audioRef.current.volume = 0.3; // العودة للمستوى الطبيعي مباشرة عند إلغاء الكتم
        audioRef.current.play();
      }
    }
  };

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const toggleMenu = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      <div 
        onClick={toggleMenu}
        style={{ 
          cursor: 'pointer', width: '48px', height: '48px', 
          background: '#1a1a1b', border: '2.5px solid #a855f7', 
          borderRadius: '15px', display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center', gap: '5px',
          boxShadow: '0 0 20px rgba(168, 85, 247, 0.6)',
          zIndex: 9999, position: 'relative'
        }}
      >
        <div style={{ width: '24px', height: '3px', background: 'linear-gradient(to right, #a855f7, #f472b6)', borderRadius: '10px' }} />
        <div style={{ width: '18px', height: '3px', background: '#d946ef', borderRadius: '10px', alignSelf: 'flex-end', marginRight: '8px' }} />
        <div style={{ width: '24px', height: '3px', background: 'linear-gradient(to right, #f472b6, #a855f7)', borderRadius: '10px' }} />
      </div>

      {isOpen && createPortal(
        <div style={{ 
          position: 'fixed', inset: 0, backgroundColor: 'rgba(5, 5, 7, 0.98)', 
          zIndex: 1000000, display: 'flex', justifyContent: 'center', alignItems: 'center',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)'
        }}>
          <div style={{ 
            position: 'relative', width: '92%', maxWidth: '420px', background: '#080809',
            border: '1.5px solid rgba(168, 85, 247, 0.5)', borderRadius: '45px',
            padding: '30px 20px', boxShadow: '0 0 100px rgba(168, 85, 247, 0.3)',
            maxHeight: '92vh', overflowY: 'auto'
          }}>
            
            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
              <button onClick={() => setIsOpen(false)} style={{ position: 'absolute', top: '25px', right: '25px', background: 'none', border: 'none', color: '#fff', opacity: 0.5, cursor: 'pointer' }}>
                <X size={30} />
              </button>
              <img src={logoIcon} style={{ width: '80px', height: '80px', filter: 'drop-shadow(0 0 20px rgba(168,85,247,0.6))', marginBottom: '10px' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Sparkles size={18} color="#f472b6" />
                <span style={{ fontSize: '16px', color: '#fff', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase', background: 'linear-gradient(to right, #fff, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Spin4Pi Menu
                </span>
                <Sparkles size={18} color="#f472b6" />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '25px' }}>
              <MenuOption onClick={() => handleNavigation('/')} icon={<LayoutGrid size={22} color="#a855f7" />} label="Gaming Arena" />
              <MenuOption onClick={() => handleNavigation('/profile')} icon={<UserCircle size={22} color="#3b82f6" />} label="Player Profile" />
              <MenuOption onClick={() => handleNavigation('/leaderboard')} icon={<Trophy size={22} color="#fbbf24" />} label="Champions Board" />
              <MenuOption onClick={() => handleNavigation('/achievements')} icon={<Medal size={22} color="#f472b6" />} label="Achievements" />
              <MenuOption onClick={() => handleNavigation('/marketplace')} icon={<ShoppingCart size={22} color="#22c55e" />} label="Marketplace" />
              <MenuOption onClick={() => handleNavigation('/vip-benefits')} icon={<Sparkles size={22} color="#8b5cf6" />} label="VIP Benefits" />
              <MenuOption onClick={() => handleNavigation('/withdrawal-history')} icon={<History size={22} color="#94a3b8" />} label="Withdrawal History" />
              <MenuOption onClick={() => handleNavigation('/legal')} icon={<Info size={22} color="#64748b" />} label="Legal Center" />
              
              {isAdmin && (
                <MenuOption onClick={() => handleNavigation('/admin')} icon={<Settings size={22} color="#ef4444" />} label="Admin Terminal" />
              )}
            </div>

            <div 
              onClick={toggleMute}
              style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '16px 20px', background: 'rgba(168, 85, 247, 0.05)', borderRadius: '25px',
                border: '1px solid rgba(168, 85, 247, 0.2)', cursor: 'pointer', marginBottom: '20px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: isMuted ? 'rgba(239,68,68,0.1)' : 'rgba(168,85,247,0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Volume2 size={20} color={isMuted ? "#ef4444" : "#a855f7"} />
                </div>
                <span style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>Sound Effects</span>
              </div>
              <div style={{ width: '42px', height: '22px', borderRadius: '20px', background: isMuted ? '#333' : '#a855f7', position: 'relative', transition: '0.3s' }}>
                <div style={{ position: 'absolute', top: '3px', left: isMuted ? '3px' : '23px', width: '16px', height: '16px', background: 'white', borderRadius: '50%', transition: '0.3s' }} />
              </div>
            </div>

            {isLoggedIn && (
              <button 
                onClick={() => { onLogout?.(); setIsOpen(false); }}
                style={{ 
                  width: '100%', padding: '18px', background: 'linear-gradient(to right, rgba(239,68,68,0.1), rgba(239,68,68,0.3))',
                  border: '1.5px solid #ef4444', borderRadius: '25px', color: '#fff',
                  fontWeight: '900', fontSize: '12px', letterSpacing: '2px', cursor: 'pointer', textTransform: 'uppercase'
                }}
              >
                Logout Account
              </button>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

function MenuOption({ onClick, icon, label }: any) {
  return (
    <div 
      onClick={onClick}
      style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 18px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', transition: '0.2s'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{ width: '38px', height: '38px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: '12px' }}>{icon}</div>
        <span style={{ color: 'white', fontSize: '14px', fontWeight: '700' }}>{label}</span>
      </div>
      <ChevronRight size={18} color="rgba(255,255,255,0.2)" />
    </div>
  );
}
