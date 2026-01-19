import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { 
  X, LayoutGrid, Trophy, Crown, 
  UserCircle, Shield, ShoppingCart, 
  Medal, Wallet, TrendingUp, TrendingDown, ChevronRight,
  LogIn, History 
} from 'lucide-react';

import logoIcon from "@/assets/spin4pi-logo.png";
import piNetworkLogo from "@/assets/pinetwork.jpg";

export function MobileMenu({ isLoggedIn, onLogin, onLogout, balance = "0.00", piPrice = 0, piChange = 0 }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleNav = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const isPositive = piChange >= 0;

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="relative z-50 w-11 h-11 rounded-2xl border border-gold/20 bg-[#13131a] flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-all"
      >
        <div className="w-5 h-[2px] bg-gold rounded-full" />
        <div className="w-3 h-[2px] bg-gold/60 rounded-full self-end mr-3" />
        <div className="w-5 h-[2px] bg-gold rounded-full" />
      </button>

      {isOpen && createPortal(
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(5, 5, 7, 0.98)',
          zIndex: 1000000,
          display: 'flex',
          flexDirection: 'column',
          padding: '20px',
          overflowY: 'auto'
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
            <button onClick={() => setIsOpen(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-white">
              <X size={24} />
            </button>
          </div>

          {/* Live Market Card */}
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

          {/* --- تم تكبير قسم الرصيد هنا --- */}
          {isLoggedIn && (
            <div className="bg-gradient-to-br from-[#1a1a23] to-[#0d0d12] border border-gold/30 rounded-[32px] p-6 mb-8 flex items-center gap-5 relative shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-[50px] -mr-16 -mt-16" />
              <div className="w-14 h-14 bg-gold rounded-2xl flex items-center justify-center text-black shrink-0 shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-transform group-hover:scale-105 duration-500">
                <Wallet size={28} />
              </div>
              <div className="flex-1 min-w-0 relative z-10">
                <span className="text-[11px] font-black text-gold uppercase tracking-[3px] block mb-1 opacity-80">Available Pi</span>
                <div className="text-4xl font-black text-white tracking-tighter italic flex items-baseline gap-2">
                  {Number(balance).toFixed(2)} 
                  <span className="text-xl text-gold/80 not-italic">π</span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Links Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button onClick={() => handleNav('/')} className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl flex flex-col items-center gap-2 active:bg-gold/10 transition-colors">
              <LayoutGrid size={20} className="text-gold" />
              <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Arena</span>
            </button>
            {isLoggedIn && (
              <>
                <button onClick={() => handleNav('/leaderboard')} className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl flex flex-col items-center gap-2 active:bg-gold/10 transition-colors">
                  <Trophy size={20} className="text-gold" />
                  <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Rankings</span>
                </button>
                <button onClick={() => handleNav('/vip-benefits')} className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl flex flex-col items-center gap-2 active:bg-gold/10 transition-colors">
                  <Crown size={20} className="text-gold" />
                  <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">VIP Vault</span>
                </button>
              </>
            )}
            <button onClick={() => handleNav('/profile')} className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl flex flex-col items-center gap-2 active:bg-gold/10 transition-colors">
              <UserCircle size={20} className="text-gold" />
              <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Account</span>
            </button>
          </div>

          {/* Navigation List */}
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

          {/* Auth Button */}
          <div className="mt-auto pt-4">
            {!isLoggedIn ? (
              <button 
                onClick={() => { onLogin?.(); setIsOpen(false); }}
                className="w-full py-5 rounded-[24px] bg-gradient-to-r from-gold via-[#FFD700] to-[#B8860B] text-black text-[13px] font-black uppercase tracking-[3px] shadow-[0_15px_30px_rgba(212,175,55,0.25)] flex items-center justify-center gap-3 active:scale-95 transition-all"
              >
                <LogIn size={20} />
                Connect With Pi
              </button>
            ) : (
              <button 
                onClick={() => { onLogout?.(); setIsOpen(false); }}
                className="w-full py-4 rounded-2xl bg-red-500/5 border border-red-500/20 text-red-500 text-[11px] font-black uppercase tracking-[2px] active:scale-95 transition-all opacity-60 hover:opacity-100"
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

function MenuLink({ icon, label, onClick }: any) {
  return (
    <div 
      onClick={onClick} 
      className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl cursor-pointer active:bg-gold/5 group transition-all"
    >
      <div className="flex items-center gap-3">
        <div className="text-gold/60 group-hover:text-gold transition-colors">
          {icon}
        </div>
        <span className="text-[12px] font-bold text-white/70 group-hover:text-white transition-colors uppercase tracking-wide">
          {label}
        </span>
      </div>
      <ChevronRight size={14} className="text-white/10 group-hover:text-gold transition-all group-hover:translate-x-1" />
    </div>
  );
}
