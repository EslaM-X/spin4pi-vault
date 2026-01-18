import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { X, LayoutGrid, Trophy, Volume2, Crown, Wallet } from 'lucide-react';
import logoIcon from "@/assets/spin4pi-logo.png";

export function MobileMenu({ isLoggedIn, onLogout, balance = "0.00" }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // دوال بسيطة ومباشرة
  const openMenu = () => setIsOpen(true);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* زر الهامبرجر - برمجة خفيفة جداً */}
      <button 
        onClick={openMenu}
        className="w-10 h-10 rounded-xl bg-[#13131a] border border-gold/20 flex flex-col items-center justify-center gap-1"
        style={{ cursor: 'pointer', zIndex: 50 }}
      >
        <div className="w-5 h-[2px] bg-gold" />
        <div className="w-5 h-[2px] bg-gold" />
        <div className="w-5 h-[2px] bg-gold" />
      </button>

      {/* القائمة - تظهر فقط إذا كان isOpen true */}
      {isOpen && createPortal(
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.95)',
          zIndex: 999999,
          display: 'flex',
          flexDirection: 'column',
          padding: '20px'
        }}>
          {/* زر الإغلاق X */}
          <button 
            onClick={closeMenu}
            style={{ alignSelf: 'flex-end', padding: '10px', color: '#fff' }}
          >
            <X size={30} />
          </button>

          {/* محتوى القائمة السريع */}
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <img src={logoIcon} style={{ width: '60px', margin: '0 auto' }} alt="Logo" />
            <h2 style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold', marginTop: '10px' }}>
              SPIN4<span style={{ color: '#fbbf24' }}>PI</span>
            </h2>
          </div>

          {/* الرصيد */}
          {isLoggedIn && (
            <div style={{ 
              background: '#13131a', 
              border: '1px solid #fbbf24', 
              borderRadius: '20px', 
              padding: '20px', 
              marginTop: '30px',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <div style={{ color: '#fff' }}>
                <div style={{ fontSize: '10px', color: '#fbbf24' }}>BALANCE</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{balance} π</div>
              </div>
              <Wallet color="#fbbf24" />
            </div>
          )}

          {/* الأزرار الأساسية */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '15px', 
            marginTop: '30px' 
          }}>
            <button onClick={() => { navigate('/'); closeMenu(); }} style={btnStyle}>
               <LayoutGrid size={20} /> Arena
            </button>
            <button onClick={() => { navigate('/leaderboard'); closeMenu(); }} style={btnStyle}>
               <Trophy size={20} /> Rank
            </button>
          </div>

          {/* زر تسجيل الخروج */}
          {isLoggedIn && (
            <button 
              onClick={() => { onLogout?.(); closeMenu(); }}
              style={{ 
                marginTop: 'auto', 
                padding: '15px', 
                color: '#ef4444', 
                border: '1px solid #ef444433',
                borderRadius: '15px',
                background: 'transparent'
              }}
            >
              TERMINATE SESSION
            </button>
          )}
        </div>,
        document.body
      )}
    </>
  );
}

// تنسيق الأزرار (Style Object) لتقليل الثقل
const btnStyle: React.CSSProperties = {
  background: '#ffffff05',
  border: '1px solid #ffffff10',
  borderRadius: '15px',
  padding: '15px',
  color: '#fff',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '10px',
  fontSize: '12px'
};
