import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  X, LayoutGrid, UserCircle, Trophy, 
  Settings, Volume2, ChevronRight, Sparkles,
  ShoppingCart, Info, Medal, Wallet, Crown, Shield
} from 'lucide-react';
import logoIcon from "@/assets/spin4pi-logo.png";
import bgMusic from "@/assets/sounds/bg-music.mp3";

export function MobileMenu({ isLoggedIn, onLogout, isAdmin, balance = "0.00" }: any) {
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
        const fadeIn = setInterval(() => {
          if (vol < 0.25) {
            vol += 0.01;
            if (audioRef.current) audioRef.current.volume = vol;
          } else {
            clearInterval(fadeIn);
          }
        }, 150);
      }).catch(() => console.log("Interaction needed"));
    } else {
      audioRef.current.pause();
    }
    return () => audioRef.current?.pause();
  }, [isLoggedIn, isMuted]);

  const toggleMute = () => {
    const newState = !isMuted;
    setIsMuted(newState);
    localStorage.setItem('isMuted', String(newState));
  };

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      <style>{`
        @keyframes imperial-pulse {
          0% { box-shadow: 0 0 10px rgba(251, 191, 36, 0.2); border-color: rgba(251, 191, 36, 0.3); }
          50% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.4); border-color: rgba(251, 191, 36, 0.6); }
          100% { box-shadow: 0 0 10px rgba(251, 191, 36, 0.2); border-color: rgba(251, 191, 36, 0.3); }
        }
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .imperial-btn:active { transform: scale(0.9); }
      `}</style>

      {/* Trigger Button */}
      <button 
        className="imperial-btn"
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          cursor: 'pointer', width: '48px', height: '48px', 
          background: isOpen ? '#1a1a1b' : '#13131a', 
          border: '1px solid #fbbf2433', 
          borderRadius: '14px', display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center', gap: '4px',
          zIndex: 99999, transition: '0.3s',
          animation: isOpen ? 'none' : 'imperial-pulse 3s infinite'
        }}
      >
        {isOpen ? (
          <X size={24} color="#fbbf24" />
        ) : (
          <>
            <div style={{ width: '20px', height: '2px', background: '#fbbf24', borderRadius: '10px' }} />
            <div style={{ width: '20px', height: '2px', background: '#fbbf24', borderRadius: '10px', opacity: 0.6 }} />
            <div style={{ width: '20px', height: '2px', background: '#fbbf24', borderRadius: '10px' }} />
          </>
        )}
      </button>

      {isOpen && createPortal(
        <div style={{ 
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.85)', 
          zIndex: 1000000, backdropFilter: 'blur(10px)',
          display: 'flex', justifyContent: 'center', alignItems: 'flex-end'
        }} onClick={() => setIsOpen(false)}>
          
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{ 
              width: '100%', maxWidth: '500px', background: '#0a0a0c',
              borderTop: '2px solid #fbbf2433', borderLeft: '1px solid #ffffff05', borderRight: '1px solid #ffffff05',
              borderRadius: '30px 30px 0 0', padding: '30px 20px 40px',
              boxShadow: '0 -20px 50px rgba(0,0,0,0.9)',
              animation: 'slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* Header Area */}
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <div style={{ width: '50px', height: '4px', background: '#ffffff10', borderRadius: '10px', margin: '0 auto 20px' }} />
              <img src={logoIcon} style={{ width: '60px', height: '60px', marginBottom: '10px' }} />
              <h2 style={{ color: '#fff', fontSize: '14px', fontWeight: '900', letterSpacing: '4px', textTransform: 'uppercase' }}>
                Empire <span style={{ color: '#fbbf24' }}>Vault</span>
              </h2>
            </div>

            {/* Current Balance Display */}
            {isLoggedIn && (
              <div style={{
                background: '#13131a', border: '1px solid #fbbf2433',
                borderRadius: '20px', padding: '15px 20px', marginBottom: '25px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ background: '#fbbf24', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Wallet size={20} color="#000" />
                  </div>
                  <div>
                    <span style={{ color: '#fbbf24', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>Available Pi</span>
                    <div style={{ color: '#fff', fontSize: '22px', fontWeight: '900', lineHeight: 1 }}>{balance} <span style={{fontSize: '12px', color: '#fbbf24'}}>π</span></div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                   <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', display: 'inline-block', marginRight: '5px' }} />
                   <span style={{ color: '#ffffff40', fontSize: '9px', fontWeight: '900' }}>SECURE</span>
                </div>
              </div>
            )}

            {/* Navigation Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '30px' }}>
              <QuickAction icon={<LayoutGrid size={20} />} label="Arena" onClick={() => handleNavigation('/')} />
              <QuickAction icon={<Trophy size={20} />} label="Rank" onClick={() => handleNavigation('/leaderboard')} />
              <QuickAction icon={<Crown size={20} />} label="VIP" onClick={() => handleNavigation('/vip-benefits')} />
              <QuickAction icon={<UserCircle size={20} />} label="Account" onClick={() => handleNavigation('/profile')} />
            </div>

            {/* List Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
              <MenuOption icon={<Medal size={18} color="#fbbf24" />} label="Imperial Achievements" onClick={() => handleNavigation('/achievements')} />
              <MenuOption icon={<ShoppingCart size={18} color="#fbbf24" />} label="Marketplace" onClick={() => handleNavigation('/marketplace')} />
              <MenuOption icon={<Shield size={18} color="#fbbf24" />} label="Security & Legal" onClick={() => handleNavigation('/legal')} />
            </div>

            {/* Audio Toggle */}
            <div 
              onClick={toggleMute}
              style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '16px 20px', background: '#ffffff05', borderRadius: '18px',
                border: '1px solid #ffffff08', cursor: 'pointer', marginBottom: '20px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Volume2 size={18} color={isMuted ? "#ffffff40" : "#fbbf24"} />
                <span style={{ color: '#ffffff80', fontSize: '13px', fontWeight: '700' }}>Atmosphere Music</span>
              </div>
              <div style={{ 
                width: '36px', height: '18px', borderRadius: '20px', 
                background: isMuted ? '#222' : '#fbbf24', 
                position: 'relative', transition: '0.3s' 
              }}>
                <div style={{ 
                  position: 'absolute', top: '3px', left: isMuted ? '4px' : '18px', 
                  width: '12px', height: '12px', background: isMuted ? '#444' : '#000', 
                  borderRadius: '50%', transition: '0.3s' 
                }} />
              </div>
            </div>

            {isLoggedIn && (
              <button 
                onClick={() => { onLogout?.(); setIsOpen(false); }}
                style={{ 
                  width: '100%', padding: '16px', background: 'transparent',
                  border: '1px solid #ef444433', borderRadius: '18px', color: '#ef4444',
                  fontWeight: '900', fontSize: '10px', letterSpacing: '2px', cursor: 'pointer'
                }}
              >
                TERMINATE SESSION
              </button>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

function QuickAction({ onClick, icon, label }: any) {
  return (
    <div 
      onClick={onClick} 
      style={{ 
        background: '#ffffff03', padding: '15px 5px', borderRadius: '18px',
        border: '1px solid #ffffff05', cursor: 'pointer', textAlign: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'
      }}
    >
      <div style={{ color: '#fbbf24' }}>{icon}</div>
      <div style={{ color: '#ffffff40', fontSize: '9px', fontWeight: '800', textTransform: 'uppercase' }}>{label}</div>
    </div>
  );
}

function MenuOption({ onClick, icon, label }: any) {
  return (
    <div onClick={onClick} style={{ 
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '14px 18px', background: '#ffffff02', borderRadius: '14px',
      cursor: 'pointer', border: '1px solid #ffffff05'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {icon}
        <span style={{ color: '#ffffffcc', fontSize: '13px', fontWeight: '600' }}>{label}</span>
      </div>
      <ChevronRight size={14} color="#ffffff20" />
    </div>
  );
}
