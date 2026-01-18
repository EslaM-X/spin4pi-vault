import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { 
  X, LayoutGrid, Trophy, Crown, 
  UserCircle, Shield, ShoppingCart, 
  Medal, Wallet, TrendingUp 
} from 'lucide-react';
import logoIcon from "@/assets/spin4pi-logo.png";

export function MobileMenu({ isLoggedIn, onLogout, balance = "0.00", piPrice = "0.00" }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // دوال التحكم بالمسارات
  const handleNav = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* زر الهامبرجر الذكي - تم تحسينه ليكون فائق الاستجابة */}
      <button 
        onClick={() => setIsOpen(true)}
        className="relative z-50 w-11 h-11 rounded-2xl border border-gold/20 bg-[#13131a] flex flex-col items-center justify-center gap-1.5 active:scale-90 transition-all"
      >
        <div className="w-5 h-[2px] bg-gold rounded-full" />
        <div className="w-3 h-[2px] bg-gold/60 rounded-full self-end mr-3" />
        <div className="w-5 h-[2px] bg-gold rounded-full" />
      </button>

      {/* القائمة الكاملة باستخدام Portal لضمان الظهور فوق كافة العناصر */}
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
          {/* رأس القائمة: الشعار وزر الإغلاق */}
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
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-white"
            >
              <X size={24} />
            </button>
          </div>

          {/* عرض السعر المباشر (PiPriceDisplay) - مدمج بشكل أنيق */}
          <div className="bg-[#13131a] border border-gold/10 rounded-2xl p-4 mb-6 flex justify-between items-center shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center">
                <span className="text-black font-black text-xs">π</span>
              </div>
              <div>
                <div className="text-[10px] text-white/40 font-bold uppercase">Live Market</div>
                <div className="text-sm font-black text-white">$ {piPrice} <span className="text-[10px] text-emerald-500 ml-1">▲ 0.8%</span></div>
              </div>
            </div>
            <TrendingUp size={18} className="text-emerald-500 opacity-50" />
          </div>

          {/* الرصيد المتاح */}
          {isLoggedIn && (
            <div className="bg-gradient-to-br from-[#1a1a20] to-[#13131a] border border-gold/30 rounded-[30px] p-6 mb-8 shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gold rounded-2xl flex items-center justify-center text-black shadow-lg shadow-gold/20">
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

          {/* شبكة الوصول السريع (Quick Actions) */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button onClick={() => handleNav('/')} className="bg-white/[0.03] border border-white/5 p-5 rounded-[24px] flex flex-col items-center gap-3">
              <LayoutGrid size={24} className="text-gold" />
              <span className="text-xs font-bold text-white/70">Arena</span>
            </button>
            <button onClick={() => handleNav('/leaderboard')} className="bg-white/[0.03] border border-white/5 p-5 rounded-[24px] flex flex-col items-center gap-3">
              <Trophy size={24} className="text-gold" />
              <span className="text-xs font-bold text-white/70">Rankings</span>
            </button>
            <button onClick={() => handleNav('/vip-benefits')} className="bg-white/[0.03] border border-white/5 p-5 rounded-[24px] flex flex-col items-center gap-3">
              <Crown size={24} className="text-gold" />
              <span className="text-xs font-bold text-white/70">VIP Vault</span>
            </button>
            <button onClick={() => handleNav('/profile')} className="bg-white/[0.03] border border-white/5 p-5 rounded-[24px] flex flex-col items-center gap-3">
              <UserCircle size={24} className="text-gold" />
              <span className="text-xs font-bold text-white/70">Account</span>
            </button>
          </div>

          {/* قائمة الصفحات الكاملة */}
          <div className="space-y-3 mb-10">
            <ListOption icon={<Medal size={20} />} label="Imperial Achievements" onClick={() => handleNav('/achievements')} />
            <ListOption icon={<ShoppingCart size={20} />} label="Marketplace" onClick={() => handleNav('/marketplace')} />
            <ListOption icon={<Shield size={20} />} label="Security & Legal" onClick={() => handleNav('/legal')} />
          </div>

          {/* زر تسجيل الخروج بنهاية الصفحة */}
          {isLoggedIn && (
            <button 
              onClick={() => { onLogout?.(); setIsOpen(false); }}
              className="mt-auto w-full py-5 rounded-[24px] border border-red-500/20 text-red-500 text-[11px] font-black uppercase tracking-[3px] hover:bg-red-500/5"
            >
              Terminate Session
            </button>
          )}
        </div>,
        document.body
      )}
    </>
  );
}

// مكون فرعي لخيارات القائمة الطولية
function ListOption({ icon, label, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className="flex items-center justify-between p-5 bg-white/[0.01] border border-white/[0.03] rounded-2xl cursor-pointer active:bg-white/[0.05]"
    >
      <div className="flex items-center gap-4 text-gold/80">
        {icon}
        <span className="text-sm font-bold text-white/80">{label}</span>
      </div>
      <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-white/20">
        <ChevronRight size={14} />
      </div>
    </div>
  );
}

// أيقونة سهم لليمين غير موجودة في الاستدعاءات الأساسية
function ChevronRight({ size, className }: any) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
