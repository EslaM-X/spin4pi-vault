import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { 
  X, LayoutGrid, Trophy, Crown, 
  UserCircle, Shield, ShoppingCart, 
  Medal, Wallet, TrendingUp, ChevronRight 
} from 'lucide-react';
import logoIcon from "@/assets/spin4pi-logo.png";

// ملاحظة: تأكد من تمرير قيمة piPrice الحقيقية لهذا المكون من خلال الـ Props
export function MobileMenu({ isLoggedIn, onLogout, balance = "0.00", piPrice = "0.20" }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleNav = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* زر الهامبرجر الأصلي */}
      <button 
        onClick={() => setIsOpen(true)}
        className="relative z-50 w-11 h-11 rounded-2xl border border-gold/20 bg-[#13131a] flex flex-col items-center justify-center gap-1.5 active:scale-90 transition-all"
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
          overflowY: 'auto'
        }}>
          {/* رأس القائمة */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-3">
              <img src={logoIcon} className="w-12 h-12" alt="Spin4Pi" />
              <div>
                <h2 className="text-white text-xl font-black tracking-widest uppercase italic">
                  SPIN4<span className="text-gold">PI</span>
                </h2>
                <div className="text-[9px] text-gold/50 font-bold tracking-[3px]">IMPERIAL SYSTEM</div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-white hover:text-gold transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* قسم السعر المباشر - Live Market بشعار Pi الرسمي */}
          <div className="bg-[#13131a] border border-gold/10 rounded-2xl p-4 mb-6 flex justify-between items-center shadow-lg">
            <div className="flex items-center gap-3">
              {/* شعار Pi الرسمي كأيقونة */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-b from-gold/20 to-gold/5 flex items-center justify-center border border-gold/30">
                <span className="text-gold font-bold text-lg">π</span>
              </div>
              <div>
                <div className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Live Market</div>
                <div className="text-base font-black text-white">
                  $ {piPrice} 
                  <span className="text-[10px] text-emerald-500 ml-2 font-bold italic">▲ 0.8%</span>
                </div>
              </div>
            </div>
            <TrendingUp size={18} className="text-emerald-500 opacity-50" />
          </div>

          {/* رصيد المستخدم */}
          {isLoggedIn && (
            <div className="bg-gradient-to-br from-[#1a1a20] to-[#13131a] border border-gold/40 rounded-[30px] p-6 mb-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                 <Wallet size={80} className="text-gold" />
              </div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-14 h-14 bg-gold rounded-2xl flex items-center justify-center text-black shadow-lg shadow-gold/30">
                  <Wallet size={28} />
                </div>
                <div>
                  <span className="text-[10px] font-black text-gold uppercase tracking-[2px]">Available Pi</span>
                  <div className="text-3xl font-black text-white mt-1 leading-none">
                    {balance} <span className="text-sm text-gold">π</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* شبكة الأزرار الرئيسية */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <QuickAction icon={<LayoutGrid size={24} />} label="Arena" onClick={() => handleNav('/')} />
            <QuickAction icon={<Trophy size={24} />} label="Rankings" onClick={() => handleNav('/leaderboard')} />
            <QuickAction icon={<Crown size={24} />} label="VIP Vault" onClick={() => handleNav('/vip-benefits')} />
            <QuickAction icon={<UserCircle size={24} />} label="Account" onClick={() => handleNav('/profile')} />
          </div>

          {/* قائمة الروابط */}
          <div className="space-y-3 mb-10">
            <ListOption icon={<Medal size={20} />} label="Imperial Achievements" onClick={() => handleNav('/achievements')} />
            <ListOption icon={<ShoppingCart size={20} />} label="Marketplace" onClick={() => handleNav('/marketplace')} />
            <ListOption icon={<Shield size={20} />} label="Security & Legal" onClick={() => handleNav('/legal')} />
          </div>

          {/* زر تسجيل الخروج - تم تعديله ليكون واضحاً جداً */}
          {isLoggedIn && (
            <button 
              onClick={() => { onLogout?.(); setIsOpen(false); }}
              className="mt-auto w-full py-5 rounded-[24px] bg-red-600/10 border border-red-500/30 text-red-500 text-[13px] font-black uppercase tracking-[3px] hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-[0.98]"
            >
              LOGOUT SYSTEM
            </button>
          )}
        </div>,
        document.body
      )}
    </>
  );
}

// مكون فرعي للأزرار الشبكية
function QuickAction({ icon, label, onClick }: any) {
  return (
    <button onClick={onClick} className="bg-white/[0.03] border border-white/5 p-5 rounded-[24px] flex flex-col items-center gap-3 active:bg-gold/10 active:border-gold/30 transition-all shadow-sm group">
      <div className="text-gold group-active:scale-110 transition-transform">{icon}</div>
      <span className="text-[10px] font-bold text-white/70 uppercase tracking-tighter">{label}</span>
    </button>
  );
}

// مكون فرعي لخيارات القائمة
function ListOption({ icon, label, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className="flex items-center justify-between p-5 bg-white/[0.01] border border-white/[0.03] rounded-2xl cursor-pointer active:bg-white/[0.05] transition-colors"
    >
      <div className="flex items-center gap-4 text-gold/80">
        {icon}
        <span className="text-sm font-bold text-white/80">{label}</span>
      </div>
      <ChevronRight size={16} className="text-white/20" />
    </div>
  );
}
