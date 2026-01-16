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
      audioRef.current.volume = 0;
      audioRef.current.play().then(() => {
        let vol = 0;
        const fadeInInterval = setInterval(() => {
          if (vol < 0.3) {
            vol += 0.02;
            if (audioRef.current) audioRef.current.volume = vol;
          } else {
            clearInterval(fadeInInterval);
          }
        }, 100);
      }).catch(err => console.log("Waiting for interaction"));
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
        audioRef.current.volume = 0.3;
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
      {/* زر الهمبرجر الذكي والأسطوري */}
      <div 
        onClick={toggleMenu}
        style={{ 
          cursor: 'pointer', 
          width: '52px', 
          height: '52px', 
          background: isOpen ? 'rgba(168, 85, 247, 0.2)' : '#1a1a1b', 
          border: `2px solid ${isOpen ? '#f472b6' : '#a855f7'}`, 
          borderRadius: '16px', 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: isOpen ? '0' : '5px',
          boxShadow: isOpen ? '0 0 30px rgba(244, 114, 182, 0.4)' : '0 0 20px rgba(168, 85, 247, 0.4)',
          zIndex: 99999, 
          position: 'relative',
          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
      >
        {isOpen ? (
          <X size={28} color="#fff" style={{ transition: '0.3s' }} />
        ) : (
          <>
            <div style={{ width: '26px', height: '3.5px', background: 'linear-gradient(90deg, #a855f7, #f472b6)', borderRadius: '10px', transition: '0.3s' }} />
            <div style={{ width: '18px', height: '3.5px', background: '#d946ef', borderRadius: '10px', alignSelf: 'center', transition: '0.3s' }} />
            <div style={{ width: '26px', height: '3.5px', background: 'linear-gradient(90deg, #f472b6, #a855f7)', borderRadius: '10px', transition: '0.3s' }} />
          </>
        )}
        
        {/* حلقة التوهج الخارجية (تظهر عند الفتح) */}
        {isOpen && (
           <div style={{
             position: 'absolute',
             inset: '-4px',
             borderRadius: '20px',
             border: '1px solid rgba(244, 114, 182, 0.3)',
             animation: 'pulse 2s infinite'
           }} />
        )}
      </div>

      {isOpen && createPortal(
        <div style={{ 
          position: 'fixed', inset: 0, backgroundColor: 'rgba(5, 5, 7, 0.98)', 
          zIndex: 1000000, display: 'flex', justifyContent: 'center', alignItems: 'center',
          backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)'
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
              <img src={logoIcon} style={{ width: '85px', height: '85px', filter: 'drop-shadow(0 0 25px rgba(168,85,247,0.7))', marginBottom: '12px' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Sparkles size={18} color="#f472b6" />
                <span style={{ fontSize: '18px', color: '#fff', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase', background: 'linear-gradient(to right, #fff, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Spin4Pi Vault
                </span>
                <Sparkles size={18} color="#f472b6" />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '25px' }}>
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
                padding: '18px 20px', background: 'rgba(168, 85, 247, 0.08)', borderRadius: '25px',
                border: '1px solid rgba(168, 85, 247, 0.25)', cursor: 'pointer', marginBottom: '20px',
                transition: '0.3s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: isMuted ? 'rgba(239,68,68,0.15)' : 'rgba(168,85,247,0.15)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Volume2 size={22} color={isMuted ? "#ef4444" : "#a855f7"} />
                </div>
                <span style={{ color: 'white', fontSize: '15px', fontWeight: '800' }}>Atmosphere Sound</span>
              </div>
              <div style={{ width: '46px', height: '24px', borderRadius: '20px', background: isMuted ? '#2d2d2e' : 'linear-gradient(to right, #a855f7, #f472b6)', position: 'relative', transition: '0.4s' }}>
                <div style={{ position: 'absolute', top: '3px', left: isMuted ? '4px' : '26px', width: '18px', height: '18px', background: 'white', borderRadius: '50%', transition: '0.4s', boxShadow: '0 0 10px rgba(0,0,0,0.2)' }} />
              </div>
            </div>

            {isLoggedIn && (
              <button 
                onClick={() => { onLogout?.(); setIsOpen(false); }}
                style={{ 
                  width: '100%', padding: '20px', background: 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.4))',
                  border: '2px solid #ef4444', borderRadius: '25px', color: '#fff',
                  fontWeight: '900', fontSize: '13px', letterSpacing: '2.5px', cursor: 'pointer', textTransform: 'uppercase',
                  boxShadow: '0 10px 20px rgba(239, 68, 68, 0.2)'
                }}
              >
                Terminate Session
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
        padding: '14px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: '22px',
        border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', transition: '0.3s'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: '42px', height: '42px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '14px' }}>
          {icon}
        </div>
        <span style={{ color: 'white', fontSize: '15px', fontWeight: '700' }}>{label}</span>
      </div>
      <ChevronRight size={18} color="rgba(255,255,255,0.3)" />
    </div>
  );
}
