import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  X, LayoutGrid, UserCircle, Trophy, 
  Settings, Volume2, ChevronRight, Sparkles,
  ShoppingCart, Info, History, Medal
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
      {/* حقن الأنيميشن الذكي: Bounce للأيقونات و Pulse للزر */}
      <style>{`
        @keyframes cyber-pulse {
          0% { box-shadow: 0 0 10px rgba(168, 85, 247, 0.4); transform: scale(1); }
          50% { box-shadow: 0 0 22px rgba(168, 85, 247, 0.6); transform: scale(1.03); }
          100% { box-shadow: 0 0 10px rgba(168, 85, 247, 0.4); transform: scale(1); }
        }
        @keyframes icon-bounce {
          0% { transform: scale(0.3) translateY(30px); opacity: 0; }
          70% { transform: scale(1.1) translateY(-5px); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes menu-fade {
          from { opacity: 0; backdrop-filter: blur(0px); }
          to { opacity: 1; backdrop-filter: blur(15px); }
        }
        .bounce-item {
          animation: icon-bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .cyber-btn:active { transform: scale(0.92); }
      `}</style>

      {/* زر التشغيل الرئيسي */}
      <button 
        className="cyber-btn"
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          cursor: 'pointer', width: '52px', height: '52px', 
          background: isOpen ? '#1a1a1b' : '#121214', 
          border: `2px solid ${isOpen ? '#f472b6' : '#a855f7'}`, 
          borderRadius: '16px', display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center', gap: isOpen ? '0' : '5px',
          zIndex: 99999, transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          padding: 0, outline: 'none', position: 'relative',
          animation: isOpen ? 'none' : 'cyber-pulse 2s infinite ease-in-out'
        }}
      >
        {isOpen ? (
          <X size={28} color="#fff" />
        ) : (
          <>
            <div style={{ width: '22px', height: '3px', background: 'linear-gradient(90deg, #a855f7, #f472b6)', borderRadius: '10px' }} />
            <div style={{ width: '16px', height: '3px', background: '#d946ef', borderRadius: '10px' }} />
            <div style={{ width: '22px', height: '3px', background: 'linear-gradient(90deg, #f472b6, #a855f7)', borderRadius: '10px' }} />
          </>
        )}
      </button>

      {isOpen && createPortal(
        <div style={{ 
          position: 'fixed', inset: 0, backgroundColor: 'rgba(5, 5, 7, 0.96)', 
          zIndex: 1000000, display: 'flex', justifyContent: 'center', alignItems: 'center',
          animation: 'menu-fade 0.3s ease-out'
        }}>
          <div style={{ 
            position: 'relative', width: '92%', maxWidth: '400px', background: '#0a0a0b',
            border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '40px',
            padding: '40px 24px', boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
            maxHeight: '88vh', overflowY: 'auto'
          }}>
            
            <div style={{ textAlign: 'center', marginBottom: '35px' }}>
              <img src={logoIcon} style={{ width: '85px', height: '85px', filter: 'drop-shadow(0 0 15px rgba(168,85,247,0.4))', marginBottom: '15px' }} />
              <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: '900', letterSpacing: '3px', margin: 0 }}>
                SPIN<span style={{ color: '#a855f7' }}>4</span>PI
              </h2>
            </div>

            {/* شبكة الأيقونات مع تأثير الارتداد (Bounce) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
              <QuickAction className="bounce-item" delay="0.1s" onClick={() => handleNavigation('/')} icon={<LayoutGrid size={22} />} label="Arena" color="#a855f7" />
              <QuickAction className="bounce-item" delay="0.2s" onClick={() => handleNavigation('/profile')} icon={<UserCircle size={22} />} label="Profile" color="#3b82f6" />
              <QuickAction className="bounce-item" delay="0.3s" onClick={() => handleNavigation('/leaderboard')} icon={<Trophy size={22} />} label="Rank" color="#fbbf24" />
              <QuickAction className="bounce-item" delay="0.4s" onClick={() => handleNavigation('/marketplace')} icon={<ShoppingCart size={22} />} label="Shop" color="#22c55e" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
              <MenuOption onClick={() => handleNavigation('/achievements')} icon={<Medal size={20} color="#f472b6" />} label="Achievements" />
              <MenuOption onClick={() => handleNavigation('/vip-benefits')} icon={<Sparkles size={20} color="#8b5cf6" />} label="VIP Benefits" />
              <MenuOption onClick={() => handleNavigation('/legal')} icon={<Info size={20} color="#64748b" />} label="Legal Center" />
            </div>

            {/* Atmosphere Toggle */}
            <div 
              onClick={toggleMute}
              style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '16px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', marginBottom: '25px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Volume2 size={20} color={isMuted ? "#666" : "#a855f7"} />
                <span style={{ color: '#fff', fontSize: '14px', fontWeight: '700' }}>Atmosphere</span>
              </div>
              <div style={{ 
                width: '44px', height: '22px', borderRadius: '20px', 
                background: isMuted ? '#222' : 'linear-gradient(to right, #a855f7, #f472b6)', 
                position: 'relative', transition: '0.3s' 
              }}>
                <div style={{ 
                  position: 'absolute', top: '3px', left: isMuted ? '4px' : '22px', 
                  width: '16px', height: '16px', background: '#fff', 
                  borderRadius: '50%', transition: '0.3s' 
                }} />
              </div>
            </div>

            {isLoggedIn && (
              <button 
                onClick={() => { onLogout?.(); setIsOpen(false); }}
                style={{ 
                  width: '100%', padding: '18px', background: 'rgba(239,68,68,0.1)',
                  border: '1px solid #ef4444', borderRadius: '20px', color: '#ef4444',
                  fontWeight: '800', fontSize: '12px', letterSpacing: '2px', cursor: 'pointer'
                }}
              >
                LOGOUT SYSTEM
              </button>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

// مكون الأزرار مع دعم الأنيميشن المتأخر
function QuickAction({ onClick, icon, label, color, className, delay }: any) {
  return (
    <div 
      className={className}
      onClick={onClick} 
      style={{ 
        background: 'rgba(255,255,255,0.03)', padding: '20px 10px', borderRadius: '24px',
        border: `1px solid rgba(255,255,255,0.05)`, cursor: 'pointer', textAlign: 'center',
        animationDelay: delay, opacity: 0 // يبدأ مخفي ثم يظهر بالأنيميشن
      }}
    >
      <div style={{ color: color, marginBottom: '10px', display: 'flex', justifyContent: 'center' }}>{icon}</div>
      <div style={{ color: '#fff', fontSize: '13px', fontWeight: '800' }}>{label}</div>
    </div>
  );
}

function MenuOption({ onClick, icon, label }: any) {
  return (
    <div onClick={onClick} style={{ 
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '14px 20px', background: 'rgba(255,255,255,0.01)', borderRadius: '18px',
      cursor: 'pointer'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {icon}
        <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: '600' }}>{label}</span>
      </div>
      <ChevronRight size={16} color="rgba(255,255,255,0.2)" />
    </div>
  );
}
