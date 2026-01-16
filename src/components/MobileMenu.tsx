import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, LayoutGrid, UserCircle, Trophy, Users, 
  Settings, Volume2, ChevronRight, Sparkles
} from 'lucide-react';
import logoIcon from "@/assets/spin4pi-logo.png";

export function MobileMenu({ isLoggedIn, onLogout, isAdmin }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [window.location.pathname]);

  const toggle = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* الزر الرئيسي المطور - بتصميم بارز جداً لتعرف أنه تغير */}
      <div 
        onClick={toggle}
        id="legendary-menu-btn"
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
          position: 'fixed', inset: 0, backgroundColor: 'rgba(2, 2, 3, 0.98)', 
          zIndex: 1000000, display: 'flex', justifyContent: 'center', alignItems: 'center',
          backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)'
        }}>
          {/* الحاوية الرئيسية الفخمة */}
          <div style={{ 
            position: 'relative', width: '92%', maxWidth: '380px', background: '#080809',
            border: '1.5px solid rgba(168, 85, 247, 0.5)', borderRadius: '40px',
            padding: '40px 25px', boxShadow: '0 0 100px rgba(168, 85, 247, 0.3)',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            
            {/* الجزء العلوي: Spin4Pi Menu */}
            <div style={{ textAlign: 'center', marginBottom: '35px' }}>
              <button 
                onClick={() => setIsOpen(false)} 
                style={{ position: 'absolute', top: '25px', right: '25px', background: 'none', border: 'none', color: '#fff', opacity: 0.5, cursor: 'pointer' }}
              >
                <X size={30} />
              </button>
              
              <img src={logoIcon} style={{ width: '90px', height: '90px', filter: 'drop-shadow(0 0 25px rgba(168,85,247,0.7))', marginBottom: '15px' }} />
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <Sparkles size={18} color="#f472b6" />
                <span style={{ 
                  fontSize: '16px', color: '#fff', fontWeight: '900', 
                  letterSpacing: '2px', textTransform: 'uppercase',
                  background: 'linear-gradient(to right, #fff, #a855f7)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                }}>
                  Spin4Pi Menu
                </span>
                <Sparkles size={18} color="#f472b6" />
              </div>
            </div>

            {/* الروابط الاحترافية */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
              <MenuOption href="/" icon={<LayoutGrid size={24} color="#a855f7" />} label="Gaming Arena" />
              <MenuOption href="/profile" icon={<UserCircle size={24} color="#3b82f6" />} label="Player Profile" />
              <MenuOption href="/leaderboard" icon={<Trophy size={24} color="#fbbf24" />} label="Champions Board" />
              <MenuOption href="/referral" icon={<Users size={24} color="#22c55e" />} label="Earn Rewards" />
              {isAdmin && <MenuOption href="/admin" icon={<Settings size={24} color="#ef4444" />} label="Admin Panel" />}
            </div>

            {/* زر الصوت المطور */}
            <div 
              onClick={() => setIsMuted(!isMuted)}
              style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '20px', background: 'rgba(168, 85, 247, 0.08)', borderRadius: '25px',
                border: '1px solid rgba(168, 85, 247, 0.3)', cursor: 'pointer', marginBottom: '30px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <Volume2 size={24} color={isMuted ? "#ef4444" : "#d946ef"} />
                <span style={{ color: 'white', fontSize: '15px', fontWeight: '800' }}>Sound Effects</span>
              </div>
              <div style={{ 
                width: '46px', height: '24px', borderRadius: '20px', 
                background: isMuted ? '#333' : '#a855f7', position: 'relative'
              }}>
                <div style={{ 
                  position: 'absolute', top: '4px', left: isMuted ? '4px' : '26px',
                  width: '16px', height: '16px', background: 'white', borderRadius: '50%', transition: '0.3s'
                }} />
              </div>
            </div>

            {isLoggedIn && (
              <button 
                onClick={() => { onLogout?.(); setIsOpen(false); }}
                style={{ 
                  width: '100%', padding: '20px', background: 'linear-gradient(to right, rgba(239,68,68,0.2), rgba(239,68,68,0.4))',
                  border: '2px solid #ef4444', borderRadius: '25px', color: '#fff',
                  fontWeight: '900', fontSize: '14px', letterSpacing: '2px', cursor: 'pointer'
                }}
              >
                LOGOUT ACCOUNT
              </button>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

function MenuOption({ href, icon, label }: any) {
  return (
    <a href={href} style={{ 
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '25px',
      border: '1px solid rgba(255,255,255,0.08)', textDecoration: 'none'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
        <div style={{ width: '40px', height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
          {icon}
        </div>
        <span style={{ color: 'white', fontSize: '15px', fontWeight: '700' }}>{label}</span>
      </div>
      <ChevronRight size={20} color="rgba(255,255,255,0.2)" />
    </a>
  );
}
