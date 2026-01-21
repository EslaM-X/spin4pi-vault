import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
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

  // دالة تنقل تضمن إغلاق المنيو وتنظيف الشاشة قبل تغيير الصفحة
  const handleNav = (path: string) => {
    setIsOpen(false); 
    setTimeout(() => {
      navigate(path);
      window.scrollTo(0, 0);
    }, 150); 
  };

  const isPositive = piChange >= 0;

  return (
    <>
      {/* Trigger Button (Hamburger) */}
      <button 
        onClick={() => setIsOpen(true)}
        className="relative z-50 w-11 h-11 rounded-2xl border border-gold/20 bg-[#13131a] flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-all"
      >
        <div className="w-5 h-[2px] bg-gold rounded-full" />
        <div className="w-3 h-[2px] bg-gold/60 rounded-full self-end mr-3" />
        <div className="w-5 h-[2px] bg-gold rounded-full" />
      </button>

      {/* Full Screen Menu Portal */}
      {isOpen && createPortal(
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(5, 5, 7, 0.98)',
          zIndex: 9999999, 
          display: 'flex',
          flexDirection: 'column',
          padding: '20px',
          overflowY: 'auto',
          backdropFilter: 'blur(12px)'
        }}>
          {/* Header Section */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <img src={logoIcon} className="w-10 h-10 object-contain" alt="Logo" />
              <div>
                <h2 className="text-white text-lg font-black tracking-widest uppercase italic leading-none">
                  SPIN4<span className="text-gold">PI</span>
                </h2>
                <div className="text-[8px] text-gold/50 font-bold tracking-[2px] mt-1">IMPERIAL SYSTEM</div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-white active:scale-90 transition-all"
            >
              <X size={24} />
            </button>
          </div>

          {/* Market Live Data Section */}
          <div className="bg-[#13131a] border border-gold/10 rounded-2xl p-4 mb-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-gold/30">
                <img src={piNetworkLogo} className="w-full h-full object-cover" alt="Pi" />
              </div>
              <div>
                <div className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Live Market</div>
                <div className="text-base font-black text-white">$ {piPrice.toFixed(2)}</div>
              </div>
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${isPositive ? 'text-emerald-500 bg-emerald-500/10' : 'text-red-500 bg-red-500/10'}`}>
              {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span className="text-[10px] font-bold">{Math.abs(piChange).toFixed(1)}%</span>
            </div>
          </div>

          {/* --- ADMIN TERMINAL BUTTON (الآن بارز وواضح جداً) --- */}
          {isLoggedIn && (
            <div className="mb-6 px-1">
              <button
                onClick={() => handleNav('/admin')}
                className="relative w-full overflow-hidden p-[1px] rounded-2xl bg-gradient-to-r from-emerald-500 via-gold to-emerald-400 group active:scale-[0.98] transition-all"
              >
                <div className="bg-[#0f0f15] rounded-[15px] p-4 flex items-center gap-4 relative z-10">
                  <div className="w-11 h-11 bg-emerald-500/10 border border-emerald-500/40 rounded-xl flex items-center justify-center text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                    <ShieldCheck size={24} />
                  </div>
                  <div className="text-left">
                    <p className="text-[8px] font-black text-emerald-500 uppercase tracking-[2px] mb-1">Authorization: Level 4</p>
                    <p className="text-base font-black italic uppercase text-white">Admin Terminal</p>
                  </div>
                  <ChevronRight size={18} className="ml-auto text-white/20 group-hover:text-gold group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            </div>
          )}

          {/* Wallet Balance Section */}
          {isLoggedIn && (
            <div className="relative mb-6">
              <div className="relative bg-[#13131a] border border-gold/40 rounded-[28px] p-1 flex items-center shadow-2xl">
                <div className="w-16 h-16 bg-gold rounded-2xl flex items-center justify-center text-black shrink-0 m-1">
                  <Wallet size={32} strokeWidth={2.5} />
                </div>
                <div className="flex-1 px-4 py-2">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-black text-gold uppercase tracking-[3px]">Available Pi</span>
                    <div className="h-[1px] flex-1 bg-gold/20"></div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white italic tracking-tighter leading-none">
                      {Number(balance).toFixed(2)}
                    </span>
                    <span className="text-xl font-bold text-gold italic uppercase">π</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Grid Navigation Section */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <NavGridItem icon={<LayoutGrid size={20}/>} label="Arena" onClick={() => handleNav('/')} />
            {isLoggedIn && (
              <>
                <NavGridItem icon={<Trophy size={20}/>} label="Rankings" onClick={() => handleNav('/leaderboard')} />
                <NavGridItem icon={<Crown size={20}/>} label="VIP Vault" onClick={() => handleNav('/vip-benefits')} />
              </>
            )}
            <NavGridItem icon={<UserCircle size={20}/>} label="Account" onClick={() => handleNav('/profile')} />
          </div>

          {/* List Navigation Section */}
          <div className="space-y-2 mb-8">
            {isLoggedIn && (
              <>
                <MenuLink icon={<Medal size={18} />} label="Imperial Achievements" onClick={() => handleNav('/achievements')} />
                <MenuLink icon={<ShoppingCart size={18} />} label="Marketplace" onClick={() => handleNav('/marketplace')} />
                <MenuLink icon={<History size={18} />} label="Withdrawal History" onClick={() => handleNav('/withdrawals')} />
              </>
            )}
            <MenuLink icon={<Shield size={18} />} label="Security & Legal" onClick={() => handleNav('/legal')} />
          </div>

          {/* Bottom Auth Section */}
          <div className="mt-auto pt-4 pb-10">
            {!isLoggedIn ? (
              <button 
                onClick={() => { onLogin?.(); setIsOpen(false); }}
                className="w-full py-5 rounded-[24px] bg-gold text-black text-sm font-black uppercase tracking-[3px] shadow-lg active:scale-95 transition-all"
              >
                Connect With Pi
              </button>
            ) : (
              <button 
                onClick={() => { onLogout?.(); setIsOpen(false); }}
                className="w-full py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-[2px]"
              >
                Logout System
              </button>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

// Helpers
function NavGridItem({ icon, label, onClick }: any) {
  return (
    <button onClick={onClick} className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl flex flex-col items-center gap-2 active:bg-gold/10 transition-all group">
      <div className="text-gold group-hover:scale-110 transition-transform">{icon}</div>
      <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">{label}</span>
    </button>
  );
}

function MenuLink({ icon, label, onClick }: any) {
  return (
    <div onClick={onClick} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl cursor-pointer active:bg-gold/5 group transition-all">
      <div className="flex items-center gap-3">
        <div className="text-gold/60 group-hover:text-gold transition-colors">{icon}</div>
        <span className="text-[12px] font-bold text-white/70 group-hover:text-white transition-colors uppercase tracking-wide">{label}</span>
      </div>
      <ChevronRight size={14} className="text-white/10 group-hover:translate-x-1 transition-all" />
    </div>
  );
}
