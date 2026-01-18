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
      {/* Hamburger Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="relative z-50 w-11 h-11 rounded-2xl border border-gold/20 bg-[#13131a] flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-all shadow-[0_0_15px_rgba(212,175,55,0.1)]"
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
          padding: '24px',
          overflowY: 'auto',
          backdropFilter: 'blur(10px)'
        }}>
          {/* Top Bar */}
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-3">
              <img src={logoIcon} className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(212,175,55,0.3)]" alt="Logo" />
              <div>
                <h2 className="text-white text-lg font-black tracking-widest uppercase italic leading-none">
                  SPIN4<span className="text-gold">PI</span>
                </h2>
                <div className="text-[8px] text-gold/50 font-black tracking-[3px] mt-1 uppercase">Imperial Menu</div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 text-white hover:bg-red-500/20 hover:text-red-500 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Market Status Card */}
          <div className="bg-[#0d0d12] border border-white/5 rounded-2xl p-4 mb-6 flex justify-between items-center shadow-inner">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-gold/20 p-0.5">
                <img src={piNetworkLogo} className="w-full h-full rounded-full object-cover" alt="Pi" />
              </div>
              <div>
                <div className="text-[9px] text-white/30 font-black uppercase tracking-widest">Market Value</div>
                <div className="text-base font-black text-white">$ {piPrice.toFixed(2)}</div>
              </div>
            </div>
            <div className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-black ${isPositive ? 'text-emerald-500 bg-emerald-500/10' : 'text-red-500 bg-red-500/10'}`}>
              {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span>{Math.abs(piChange).toFixed(1)}%</span>
            </div>
          </div>

          {/* User Balance Section */}
          {isLoggedIn && (
            <div className="bg-gradient-to-br from-[#13131a] to-[#050507] border border-gold/30 rounded-[30px] p-6 mb-8 relative shadow-2xl overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 blur-3xl rounded-full" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 bg-gold rounded-2xl flex items-center justify-center text-black shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                  <Wallet size={24} />
                </div>
                <div className="flex-1">
                  <span className="text-[9px] font-black text-gold/60 uppercase tracking-[2px] block mb-1">Imperial Balance</span>
                  <div className="text-2xl font-black text-white italic tracking-tighter">
                    {Number(balance).toFixed(2)} <span className="text-sm text-gold">π</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Grid Navigation */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <NavGridItem icon={<LayoutGrid size={20} />} label="Arena" onClick={() => handleNav('/')} />
            
            {isLoggedIn ? (
              <>
                {/* تم تعديل المسار ليتناسب مع Achievements بدلاً من leaderboard الغير موجود */}
                <NavGridItem icon={<Trophy size={20} />} label="Ranks" onClick={() => handleNav('/achievements')} />
                {/* تم تصحيح المسار من /vip-benefits إلى /vip كما هو في App.tsx */}
                <NavGridItem icon={<Crown size={20} />} label="VIP Vault" onClick={() => handleNav('/vip')} />
              </>
            ) : null}
            
            <NavGridItem icon={<UserCircle size={20} />} label="Account" onClick={() => handleNav('/profile')} />
          </div>

          {/* List Navigation */}
          <div className="space-y-2 mb-10">
            {isLoggedIn && (
              <>
                <MenuLink icon={<Medal size={18} />} label="Achievements" onClick={() => handleNav('/achievements')} />
                <MenuLink icon={<ShoppingCart size={18} />} label="Marketplace" onClick={() => handleNav('/marketplace')} />
                {/* إضافة رابط سجل السحوبات المفقود */}
                <MenuLink icon={<History size={18} />} label="Withdrawal Ledger" onClick={() => handleNav('/withdrawals')} />
              </>
            )}
            <MenuLink icon={<Shield size={18} />} label="Security & Legal" onClick={() => handleNav('/legal')} />
          </div>

          {/* Auth Button */}
          <div className="mt-auto">
            {!isLoggedIn ? (
              <button 
                onClick={() => { onLogin?.(); setIsOpen(false); }}
                className="w-full py-5 rounded-2xl bg-gradient-to-r from-gold to-[#B8860B] text-black text-[11px] font-black uppercase tracking-[3px] shadow-[0_10px_30px_rgba(212,175,55,0.2)] flex items-center justify-center gap-3 active:scale-95 transition-all"
              >
                <LogIn size={20} />
                Initialize Connection
              </button>
            ) : (
              <button 
                onClick={() => { onLogout?.(); setIsOpen(false); }}
                className="w-full py-5 rounded-2xl bg-red-500/5 border border-red-500/20 text-red-500 text-[11px] font-black uppercase tracking-[3px] hover:bg-red-500/10 active:scale-95 transition-all"
              >
                Terminate Session
              </button>
            )}
            <p className="text-[8px] text-center text-white/20 mt-6 font-black uppercase tracking-[4px]">System Version 2.0.4</p>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

// مكونات فرعية لتحسين Scannability
function NavGridItem({ icon, label, onClick }: any) {
  return (
    <button 
      onClick={onClick} 
      className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl flex flex-col items-center gap-3 active:bg-gold/10 active:border-gold/30 transition-all group"
    >
      <div className="text-gold group-active:scale-110 transition-transform">{icon}</div>
      <span className="text-[9px] font-black text-white/50 uppercase tracking-widest">{label}</span>
    </button>
  );
}

function MenuLink({ icon, label, onClick }: any) {
  return (
    <div 
      onClick={onClick} 
      className="flex items-center justify-between p-4 bg-white/[0.01] border border-white/[0.02] rounded-2xl cursor-pointer active:bg-white/[0.05] active:border-white/10 transition-all"
    >
      <div className="flex items-center gap-4 text-gold/70">
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">{icon}</div>
        <span className="text-xs font-black text-white/80 uppercase tracking-tight">{label}</span>
      </div>
      <ChevronRight size={14} className="text-white/20" />
    </div>
  );
}
