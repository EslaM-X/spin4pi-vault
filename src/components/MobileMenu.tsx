import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  X, LayoutGrid, Trophy, Crown, 
  UserCircle, Shield, ShoppingCart, 
  Medal, Wallet, TrendingUp, TrendingDown, ChevronRight,
  LogIn, History, ShieldCheck 
} from 'lucide-react';

import logoIcon from "@/assets/spin4pi-logo.png";
import piNetworkLogo from "@/assets/pinetwork.jpg";

export function MobileMenu({ isLoggedIn, onLogin, onLogout, balance = "0.00", piPrice = 0, piChange = 0 }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // تأمين نهائي: إذا تغير الرابط لأي سبب، أغلق المنيو قسرياً
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleNav = (path: string) => {
    // 1. إغلاق الحالة فوراً
    setIsOpen(false);
    
    // 2. إزالة أي بقايا للـ Portal يدوياً من الـ DOM لضمان الاختفاء
    const portals = document.querySelectorAll('.mobile-menu-portal');
    portals.forEach(el => el.remove());

    // 3. التنقل
    setTimeout(() => {
      navigate(path);
    }, 50);
  };

  const isPositive = piChange >= 0;

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="relative z-[100] w-11 h-11 rounded-2xl border border-gold/20 bg-[#13131a] flex flex-col items-center justify-center gap-1.5"
      >
        <div className="w-5 h-[2px] bg-gold rounded-full" />
        <div className="w-3 h-[2px] bg-gold/60 rounded-full self-end mr-3" />
        <div className="w-5 h-[2px] bg-gold rounded-full" />
      </button>

      {isOpen && createPortal(
        <div className="mobile-menu-portal" style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: '#050507', // لون صلب لمنع الشفافية والتداخل
          zIndex: 9999999,
          display: 'flex',
          flexDirection: 'column',
          padding: '20px',
          overflowY: 'auto'
        }}>
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <img src={logoIcon} className="w-10 h-10" alt="Logo" />
              <h2 className="text-white text-lg font-black uppercase italic">SPIN4<span className="text-gold">PI</span></h2>
            </div>
            <button onClick={() => setIsOpen(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white">
              <X size={24} />
            </button>
          </div>

          {/* Admin Terminal Button - تم تعديل المسار ليكون كاملاً وصحيحاً */}
          {isLoggedIn && (
            <button
              onClick={() => handleNav('/admin')}
              className="w-full mb-6 p-[2px] rounded-2xl bg-gradient-to-r from-emerald-500 via-gold to-emerald-500"
            >
              <div className="bg-[#0d0d12] rounded-[14px] p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-black">
                  <ShieldCheck size={20} />
                </div>
                <div className="text-left flex-1">
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Master Control</p>
                  <p className="text-sm font-black uppercase text-white">Admin Terminal</p>
                </div>
                <ChevronRight size={18} className="text-white/20" />
              </div>
            </button>
          )}

          {/* Balance Section */}
          {isLoggedIn && (
            <div className="bg-[#13131a] border border-gold/30 rounded-[24px] p-4 mb-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-gold rounded-xl flex items-center justify-center text-black">
                <Wallet size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gold/60 uppercase">Balance</p>
                <p className="text-2xl font-black text-white italic">{Number(balance).toFixed(2)} π</p>
              </div>
            </div>
          )}

          {/* Grid Links */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button onClick={() => handleNav('/')} className="bg-white/5 p-4 rounded-xl flex flex-col items-center gap-2">
              <LayoutGrid size={20} className="text-gold" />
              <span className="text-[10px] font-bold uppercase text-white/70">Arena</span>
            </button>
            <button onClick={() => handleNav('/profile')} className="bg-white/5 p-4 rounded-xl flex flex-col items-center gap-2">
              <UserCircle size={20} className="text-gold" />
              <span className="text-[10px] font-bold uppercase text-white/70">Account</span>
            </button>
          </div>

          {/* List Links */}
          <div className="space-y-2 mb-8">
            {isLoggedIn && (
              <>
                <div onClick={() => handleNav('/withdrawals')} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl cursor-pointer">
                  <div className="flex items-center gap-3">
                    <History size={18} className="text-gold/60" />
                    <span className="text-xs font-bold text-white/80 uppercase">History</span>
                  </div>
                  <ChevronRight size={14} className="text-white/20" />
                </div>
              </>
            )}
          </div>

          {/* Logout */}
          <div className="mt-auto pb-10">
            {isLoggedIn && (
              <button onClick={() => { onLogout?.(); setIsOpen(false); }} className="w-full py-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase">
                Logout
              </button>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
