import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, LayoutGrid, Trophy, Crown, 
  UserCircle, Shield, ShoppingCart, 
  Medal, Wallet, TrendingUp, TrendingDown, ChevronRight,
  LogIn
} from 'lucide-react';

import logoIcon from "@/assets/spin4pi-logo.png";
import piNetworkLogo from "@/assets/pinetwork.jpg";

export function MobileMenu({ isLoggedIn, onLogin, onLogout, balance = "0.00", piPrice = 0, piChange = 0 }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // تعديل: دالة التنقل الآن تغلق المنيو أولاً ثم تنتقل
  const handleNav = (path: string) => {
    setIsOpen(false);
    // إضافة تأخير بسيط جداً لضمان انغلاق الواجهة قبل الانتقال
    setTimeout(() => {
      navigate(path);
    }, 10);
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

      {/* تم إزالة الـ createPortal واستبداله بـ div عادي بـ z-index عالي */}
      {isOpen && (
        <div className="fixed inset-0 bg-[#050507] z-[999999] flex flex-col p-5 overflow-y-auto">
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

          {/* Market Data */}
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

          {isLoggedIn && (
            <div className="bg-[#13131a] border border-gold/40 rounded-[28px] p-5 mb-6 flex items-center gap-4 shadow-2xl">
              <div className="w-12 h-12 bg-gold rounded-xl flex items-center justify-center text-black shrink-0">
                <Wallet size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-black text-gold uppercase tracking-[1.5px] block mb-1">Available Pi</span>
                <div className="text-2xl font-black text-white truncate leading-none">
                  {Number(balance).toFixed(2)} <span className="text-sm text-gold">π</span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mb-6">
            <button onClick={() => handleNav('/')} className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl flex flex-col items-center gap-2 active:bg-gold/10">
              <LayoutGrid size={20} className="text-gold" />
              <span className="text-[10px] font-bold text-white/70 uppercase">Arena</span>
            </button>
            {isLoggedIn && (
              <>
                <button onClick={() => handleNav('/achievements')} className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl flex flex-col items-center gap-2 active:bg-gold/10">
                  <Trophy size={20} className="text-gold" />
                  <span className="text-[10px] font-bold text-white/70 uppercase">Rankings</span>
                </button>
                <button onClick={() => handleNav('/vip')} className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl flex flex-col items-center gap-2 active:bg-gold/10">
                  <Crown size={20} className="text-gold" />
                  <span className="text-[10px] font-bold text-white/70 uppercase">VIP Vault</span>
                </button>
              </>
            )}
            <button onClick={() => handleNav('/profile')} className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl flex flex-col items-center gap-2 active:bg-gold/10">
              <UserCircle size={20} className="text-gold" />
              <span className="text-[10px] font-bold text-white/70 uppercase">Account</span>
            </button>
          </div>

          <div className="space-y-2 mb-8">
            {isLoggedIn && (
              <>
                <MenuLink icon={<Medal size={18} />} label="Imperial Achievements" onClick={() => handleNav('/achievements')} />
                <MenuLink icon={<ShoppingCart size={18} />} label="Marketplace" onClick={() => handleNav('/marketplace')} />
                <MenuLink icon={<Wallet size={18} />} label="Withdrawal History" onClick={() => handleNav('/withdrawals')} />
              </>
            )}
            <MenuLink icon={<Shield size={18} />} label="Security & Legal" onClick={() => handleNav('/legal')} />
          </div>

          <div className="mt-auto pt-4">
            {!isLoggedIn ? (
              <button 
                onClick={() => { onLogin?.(); setIsOpen(false); }}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-gold to-[#B8860B] text-black text-xs font-black uppercase tracking-[2px] flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <LogIn size={18} />
                Connect With Pi
              </button>
            ) : (
              <button 
                onClick={() => { onLogout?.(); setIsOpen(false); }}
                className="w-full py-4 rounded-2xl bg-red-500/10 border border-red-500/40 text-red-500 text-xs font-black uppercase tracking-[2px] active:scale-95 transition-all"
              >
                LOGOUT SYSTEM
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function MenuLink({ icon, label, onClick }: any) {
  return (
    <div onClick={onClick} className="flex items-center justify-between p-4 bg-white/[0.01] border border-white/[0.03] rounded-xl cursor-pointer active:bg-white/[0.05]">
      <div className="flex items-center gap-3 text-gold/80">
        {icon}
        <span className="text-sm font-bold text-white/80">{label}</span>
      </div>
      <ChevronRight size={14} className="text-white/20" />
    </div>
  );
}
