import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Home, User, LogOut, ChevronRight, 
  Volume2, ShieldCheck, Trophy, Share2, Settings 
} from 'lucide-react';
import logoIcon from "@/assets/spin4pi-logo.png";

export function MobileMenu({ isLoggedIn, onLogout, isAdmin }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // إغلاق المنيو عند تغيير الصفحة لضمان عدم التعليق
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
      {/* الزر الرئيسي: تم تبسيطه برمجياً وتطويره بصرياً */}
      <div 
        onClick={toggle}
        style={{ 
          cursor: 'pointer', width: '44px', height: '44px', 
          background: 'rgba(168, 85, 247, 0.15)', border: '1.5px solid #a855f7', 
          borderRadius: '12px', display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center', gap: '4px',
          boxShadow: '0 0 10px rgba(168, 85, 247, 0.3)'
        }}
      >
        <div style={{ width: '20px', height: '2.5px', background: 'linear-gradient(to right, #a855f7, #d946ef)', borderRadius: '2px' }} />
        <div style={{ width: '14px', height: '2.5px', background: '#a855f7', borderRadius: '2px', alignSelf: 'flex-end', marginRight: '10px' }} />
        <div style={{ width: '20px', height: '2.5px', background: 'linear-gradient(to right, #d946ef, #a855f7)', borderRadius: '2px' }} />
      </div>

      {isOpen && createPortal(
        <div style={{ 
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.98)', 
          zIndex: 999999, display: 'flex', justifyContent: 'center', alignItems: 'center',
          backdropFilter: 'blur(15px)', WebkitBackdropFilter: 'blur(15px)'
        }}>
          {/* الحاوية الرئيسية: تصميم فخم بدون مكتبات ثقيلة */}
          <div style={{ 
            position: 'relative', width: '90%', maxWidth: '380px', background: '#0c0c0e',
            border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '40px',
            padding: '30px', boxShadow: '0 0 50px rgba(168, 85, 247, 0.15)',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            
            {/* زر الإغلاق والشعار */}
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <button 
                onClick={() => setIsOpen(false)} 
                style={{ position: 'absolute', top: '25px', right: '25px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)' }}
              >
                <X size={26} />
              </button>
              <img src={logoIcon} style={{ width: '70px', height: '70px', filter: 'drop-shadow(0 0 15px rgba(168,85,247,0.5))', marginBottom: '10px' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <ShieldCheck size={12} color="#a855f7" />
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold', letterSpacing: '3px' }}>SYSTEM TERMINAL</span>
              </div>
            </div>

            {/* الروابط: تصميم البطاقات */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '25px' }}>
              <MenuOption href="/" icon={<Home size={20} color="#a855f7" />} label="The Arena" />
              <MenuOption href="/profile" icon={<User size={20} color="#3b82f6" />} label="Commander Profile" />
              <MenuOption href="/leaderboard" icon={<Trophy size={20} color="#eab308" />} label="Global Rankings" />
              <MenuOption href="/referral" icon={<Share2 size={20} color="#22c55e" />} label="Affiliate Portal" />
              {isAdmin && <MenuOption href="/admin" icon={<Settings size={20} color="#ef4444" />} label="Admin Control" />}
            </div>

            {/* التحكم بالصوت */}
            <div 
              onClick={() => setIsMuted(!isMuted)}
              style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '15px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', marginBottom: '25px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Volume2 size={20} color={isMuted ? "#ef4444" : "#d946ef"} />
                <span style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>Sound Effects</span>
              </div>
              <div style={{ 
                width: '40px', height: '20px', borderRadius: '20px', 
                background: isMuted ? '#333' : '#a855f7', position: 'relative'
              }}>
                <div style={{ 
                  position: 'absolute', top: '3px', left: isMuted ? '3px' : '23px',
                  width: '14px', height: '14px', background: 'white', borderRadius: '50%', transition: '0.3s'
                }} />
              </div>
            </div>

            {isLoggedIn && (
              <button 
                onClick={() => { onLogout?.(); setIsOpen(false); }}
                style={{ 
                  width: '100%', padding: '18px', background: 'linear-gradient(to right, rgba(239,68,68,0.1), rgba(239,68,68,0.2))',
                  border: '1px solid rgba(239,68,68,0.3)', borderRadius: '20px', color: '#ef4444',
                  fontWeight: '900', fontSize: '12px', letterSpacing: '2px', cursor: 'pointer'
                }}
              >
                LOGOUT SESSION
              </button>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

// مكون الخيار الواحد لضمان الثبات
function MenuOption({ href, icon, label }: any) {
  return (
    <a href={href} style={{ 
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '18px', background: 'rgba(255,255,255,0.03)', borderRadius: '20px',
      border: '1px solid rgba(255,255,255,0.05)', textDecoration: 'none'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>{icon}</div>
        <span style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>{label}</span>
      </div>
      <ChevronRight size={18} color="rgba(255,255,255,0.2)" />
    </a>
  );
}
