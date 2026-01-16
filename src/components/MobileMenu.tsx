import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, LayoutGrid, UserCircle, Trophy, Users, 
  Settings, Volume2, ChevronRight, Sparkles,
  ShieldAlert, ShoppingCart, Info, History, Medal
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
      {/* الزر الرئيسي المطور */}
      <div 
        onClick={toggle}
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
          <div style={{ 
            position: 'relative', width: '92%', maxWidth: '400px', background: '#080809',
            border: '1.5px solid rgba(168, 85, 247, 0.5)', borderRadius: '40px',
            padding: '30px 20px', boxShadow: '0 0 100px rgba(168, 85, 247, 0.3)',
            maxHeight: '92vh', overflowY: 'auto'
          }}>
            
            {/* الجزء العلوي المبدع */}
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <button onClick={() => setIsOpen(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#fff', opacity: 0.5 }}><X size={30} /></button>
              <img src={logoIcon} style={{ width: '80px', height: '80px', filter: 'drop-shadow(0 0 20px rgba(168,85,247,0.6))', marginBottom: '10px' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Sparkles size={16} color="#f472b6" />
                <span style={{ fontSize: '15px', color: '#fff', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase', background: 'linear-gradient(to right, #fff, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Spin4Pi Menu</span>
                <Sparkles size={16} color="#f472b6" />
              </div>
            </div>

            {/* قائمة الصفحات الشاملة بناءً على مجلد pages */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '25px' }}>
              <MenuOption href="/" icon={<LayoutGrid size={22} color="#a855f7" />} label="Gaming Arena" />
              <MenuOption href="/profile" icon={<UserCircle size={22} color="#3b82f6" />} label="Player Profile" />
              <MenuOption href="/leaderboard" icon={<Trophy size={22} color="#fbbf24" />} label="Champions Board" />
              <MenuOption href="/achievements" icon={<Medal size={22} color="#f472b6" />} label="Achievements" />
              <MenuOption href="/marketplace" icon={<ShoppingCart size={22} color="#22c55e" />} label="NFT Marketplace" />
              <MenuOption href="/vip-benefits" icon={<Star size={22} color="#8b5cf6" />} label="VIP Benefits" />
              <MenuOption href="/withdrawal-history" icon={<History size={22} color="#94a3b8" />} label="Withdrawal History" />
              <MenuOption href="/legal" icon={<Info size={22} color="#64748b" />} label="Legal Info" />
              {isAdmin && <MenuOption href="/admin" icon={<ShieldAlert size={22} color="#ef4444" />} label="Admin Terminal" />}
            </div>

            {/* زر الصوت المطور */}
            <div onClick={() => setIsMuted(!isMuted)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', background: 'rgba(168, 85, 247, 0.05)', borderRadius: '20px', border: '1px solid rgba(168, 85, 247, 0.2)', cursor: 'pointer', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Volume2 size={20} color={isMuted ? "#ef4444" : "#d946ef"} />
                <span style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>Sound Effects</span>
              </div>
              <div style={{ width: '40px', height: '20px', borderRadius: '20px', background: isMuted ? '#333' : '#a855f7', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '3px', left: isMuted ? '3px' : '23px', width: '14px', height: '14px', background: 'white', borderRadius: '50%', transition: '0.3s' }} />
              </div>
            </div>

            {isLoggedIn && (
              <button onClick={() => { onLogout?.(); setIsOpen(false); }} style={{ width: '100%', padding: '18px', background: 'linear-gradient(to right, rgba(239,68,68,0.1), rgba(239,68,68,0.3))', border: '1.5px solid #ef4444', borderRadius: '22px', color: '#fff', fontWeight: '900', fontSize: '12px', letterSpacing: '2px', cursor: 'pointer' }}>LOGOUT ACCOUNT</button>
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
    <a href={href} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: 'rgba(255,255,255,0.02)', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.05)', textDecoration: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ width: '36px', height: '36px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: '10px' }}>{icon}</div>
        <span style={{ color: 'white', fontSize: '13px', fontWeight: '700' }}>{label}</span>
      </div>
      <ChevronRight size={16} color="rgba(255,255,255,0.2)" />
    </a>
  );
}
