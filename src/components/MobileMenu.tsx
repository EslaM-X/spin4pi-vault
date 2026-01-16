import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, LayoutGrid, UserCircle, Trophy, Users, 
  Settings, Volume2, ChevronRight, Star, Sparkles
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
      {/* الزر الرئيسي بتصميم "أسطوري" وخفيف */}
      <div 
        onClick={toggle}
        style={{ 
          cursor: 'pointer', width: '46px', height: '46px', 
          background: 'rgba(168, 85, 247, 0.12)', border: '2px solid #a855f7', 
          borderRadius: '14px', display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center', gap: '4.5px',
          boxShadow: '0 0 15px rgba(168, 85, 247, 0.4)'
        }}
      >
        <div style={{ width: '22px', height: '3px', background: 'linear-gradient(to right, #a855f7, #f472b6)', borderRadius: '10px' }} />
        <div style={{ width: '16px', height: '3px', background: '#d946ef', borderRadius: '10px', alignSelf: 'flex-end', marginRight: '9px' }} />
        <div style={{ width: '22px', height: '3px', background: 'linear-gradient(to right, #f472b6, #a855f7)', borderRadius: '10px' }} />
      </div>

      {isOpen && createPortal(
        <div style={{ 
          position: 'fixed', inset: 0, backgroundColor: 'rgba(5, 5, 5, 0.98)', 
          zIndex: 999999, display: 'flex', justifyContent: 'center', alignItems: 'center',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)'
        }}>
          {/* الحاوية الرئيسية الفخمة */}
          <div style={{ 
            position: 'relative', width: '92%', maxWidth: '380px', background: '#0a0a0b',
            border: '1px solid rgba(168, 85, 247, 0.4)', borderRadius: '45px',
            padding: '35px 25px', boxShadow: '0 0 80px rgba(168, 85, 247, 0.2)',
            maxHeight: '92vh', overflowY: 'auto'
          }}>
            
            {/* الجزء العلوي الجديد: Spin4Pi Menu */}
            <div style={{ textAlign: 'center', marginBottom: '35px' }}>
              <button 
                onClick={() => setIsOpen(false)} 
                style={{ position: 'absolute', top: '25px', right: '25px', background: 'none', border: 'none', color: 'white', opacity: 0.4 }}
              >
                <X size={28} />
              </button>
              
              <img src={logoIcon} style={{ width: '85px', height: '85px', filter: 'drop-shadow(0 0 20px rgba(168,85,247,0.6))', marginBottom: '15px' }} />
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Sparkles size={16} color="#f472b6" />
                <span style={{ 
                  fontSize: '14px', color: '#fff', fontWeight: '900', 
                  letterSpacing: '1.5px', textTransform: 'uppercase',
                  background: 'linear-gradient(to right, #fff, #a855f7)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                }}>
                  Spin4Pi Menu
                </span>
                <Sparkles size={16} color="#f472b6" />
              </div>
            </div>

            {/* روابط الصفحات بأسماء احترافية وأيقونات جذابة */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '30px' }}>
              <MenuOption href="/" icon={<LayoutGrid size={22} color="#a855f7" />} label="Gaming Arena" />
              <MenuOption href="/profile" icon={<UserCircle size={22} color="#3b82f6" />} label="Player Profile" />
              <MenuOption href="/leaderboard" icon={<Trophy size={22} color="#fbbf24" />} label="Champions Board" />
              <MenuOption href="/referral" icon={<Users size={22} color="#22c55e" />} label="Earn Rewards" />
              {isAdmin && <MenuOption href="/admin" icon={<Settings size={22} color="#ef4444" />} label="Admin Panel" />}
            </div>

            {/* زر الصوت التفاعلي المطور */}
            <div 
              onClick={() => setIsMuted(!isMuted)}
              style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '18px 22px', background: 'rgba(168, 85, 247, 0.05)', borderRadius: '24px',
                border: '1px solid rgba(168, 85, 247, 0.2)', cursor: 'pointer', marginBottom: '25px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ 
                  width: '38px', height: '38px', borderRadius: '12px', background: isMuted ? 'rgba(239,68,68,0.1)' : 'rgba(217,70,239,0.1)',
                  display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                  <Volume2 size={20} color={isMuted ? "#ef4444" : "#d946ef"} />
                </div>
                <span style={{ color: 'white', fontSize: '15px', fontWeight: 'bold' }}>Sound Effects</span>
              </div>
              <div style={{ 
                width: '44px', height: '22px', borderRadius: '20px', 
                background: isMuted ? '#27272a' : '#a855f7', position: 'relative',
                transition: '0.3s ease'
              }}>
                <div style={{ 
                  position: 'absolute', top: '3px', left: isMuted ? '3px' : '25px',
                  width: '16px', height: '16px', background: 'white', borderRadius: '50%', 
                  transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 0 8px rgba(0,0,0,0.4)'
                }} />
              </div>
            </div>

            {isLoggedIn && (
              <button 
                onClick={() => { onLogout?.(); setIsOpen(false); }}
                style={{ 
                  width: '100%', padding: '20px', background: 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(239,68,68,0.2) 100%)',
                  border: '1.5px solid rgba(239,68,68,0.4)', borderRadius: '24px', color: '#ef4444',
                  fontWeight: '900', fontSize: '13px', letterSpacing: '2px', cursor: 'pointer',
                  textTransform: 'uppercase'
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

function MenuOption({ href, icon, label }: any) {
  return (
    <a href={href} style={{ 
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '18px 22px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px',
      border: '1px solid rgba(255,255,255,0.06)', textDecoration: 'none',
      transition: '0.2s'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ 
          width: '42px', height: '42px', background: 'rgba(255,255,255,0.04)', 
          borderRadius: '14px', display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          {icon}
        </div>
        <span style={{ color: 'white', fontSize: '15px', fontWeight: '700', letterSpacing: '0.3px' }}>{label}</span>
      </div>
      <ChevronRight size={18} color="rgba(255,255,255,0.2)" />
    </a>
  );
}
