import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Home, User, LogOut, ChevronRight } from 'lucide-react';

export function MobileMenu({ isLoggedIn, onLogout }: any) {
  const [isOpen, setIsOpen] = useState(false);

  // دالة بسيطة جداً لضمان التفاعل
  const toggle = () => {
    console.log("Menu clicked");
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* زر الهامبرجر الأسطوري - مبسط تقنياً */}
      <div 
        onClick={toggle}
        style={{ 
          cursor: 'pointer',
          width: '40px',
          height: '40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '4px',
          background: 'rgba(168,85,247,0.15)',
          border: '1px solid #a855f7',
          borderRadius: '10px',
          zIndex: 101 // أعلى من الهيدر بقليل
        }}
      >
        <div style={{ width: '20px', height: '2px', background: '#a855f7', borderRadius: '2px' }} />
        <div style={{ width: '14px', height: '2px', background: '#d946ef', borderRadius: '2px', alignSelf: 'flex-end', marginRight: '10px' }} />
        <div style={{ width: '20px', height: '2px', background: '#a855f7', borderRadius: '2px' }} />
      </div>

      {isOpen && createPortal(
        <div style={{ 
          position: 'fixed', 
          top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.95)', 
          zIndex: 999999,
          display: 'flex',
          flexDirection: 'column',
          padding: '40px 20px'
        }}>
          {/* رأس القائمة */}
          <div style={{ display: 'flex', justifyContent: 'right', marginBottom: '40px' }}>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white' }}>
              <X size={32} />
            </button>
          </div>

          {/* الروابط */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <a href="/" onClick={() => setIsOpen(false)} style={{ 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '15px',
              color: 'white', textDecoration: 'none', fontWeight: 'bold'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Home size={20} color="#a855f7"/> Arena</span>
              <ChevronRight size={18} />
            </a>

            {isLoggedIn && (
              <a href="/profile" onClick={() => setIsOpen(false)} style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '15px',
                color: 'white', textDecoration: 'none', fontWeight: 'bold'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><User size={20} color="#3b82f6"/> Profile</span>
                <ChevronRight size={18} />
              </a>
            )}

            {isLoggedIn && (
              <button 
                onClick={() => { onLogout?.(); setIsOpen(false); }}
                style={{ 
                  marginTop: '20px', padding: '20px', background: '#e11d48', color: 'white',
                  border: 'none', borderRadius: '15px', fontWeight: 'bold', fontSize: '16px'
                }}
              >
                LOGOUT
              </button>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
