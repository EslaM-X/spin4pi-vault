import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, X, Home, User, Trophy, Wallet, LogOut, ChevronRight, 
  Crown, ShieldCheck, History, ShoppingBag, Scale, LayoutDashboard, Gem 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from "@/assets/spin4pi-logo.png"; // تأكد أن هذا هو مسار شعار Spin4Pi الذهبي

export function MobileMenu({ isLoggedIn, onLogout, isAdmin = false }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // نظام أصوات تفاعلي فاخر
  const playSound = useCallback((type: 'open' | 'click') => {
    const audio = new Audio(
      type === 'open' 
        ? 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3' 
        : 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'
    );
    audio.volume = 0.12;
    audio.play().catch(() => {});
  }, []);

  useEffect(() => { setIsOpen(false); }, [location.pathname]);

  const handleOpen = () => {
    playSound('open');
    setIsOpen(true);
  };

  const MenuContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* خلفية غامرة تعزل اللعبة في الخلفية */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            style={{ 
              position: 'fixed', inset: 0, zIndex: 99999, 
              background: 'radial-gradient(circle at center, rgba(168, 85, 247, 0.15) 0%, rgba(5, 5, 10, 0.95) 100%)',
              backdropFilter: 'blur(25px)' 
            }}
          />

          {/* القائمة الأسطورية بتصميم كبسولة عائمة */}
          <motion.div
            initial={{ x: '100%', scale: 0.9, opacity: 0 }}
            animate={{ x: 0, scale: 1, opacity: 1 }}
            exit={{ x: '100%', scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            style={{ 
              position: 'fixed', top: '15px', right: '15px', bottom: '15px', width: '335px', 
              zIndex: 100000, backgroundColor: '#08090D', 
              borderRadius: '45px', border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '-25px 0 120px rgba(0,0,0,1), inset 0 0 50px rgba(168, 85, 247, 0.05)',
              display: 'flex', flexDirection: 'column', overflow: 'hidden'
            }}
          >
            {/* الهيدر: الشعار الذهبي وكلمة SPIN4PI بدون أي قطع */}
            <div className="relative p-10 pb-8 text-center border-b border-white/5 bg-gradient-to-br from-purple-900/10 via-transparent to-transparent">
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="flex items-center justify-center gap-3">
                  <img 
                    src={logo} 
                    alt="Spin4Pi Logo" 
                    className="w-14 h-14 object-contain drop-shadow-[0_0_20px_rgba(234,179,8,0.6)]"
                  />
                  <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center">
                    SPIN<span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">4PI</span>
                  </h2>
                </div>
                <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full border border-white/10 shadow-inner">
                  <ShieldCheck size={14} className="text-purple-400" />
                  <span className="text-[10px] text-purple-200 font-black uppercase tracking-[0.2em]">Verified Ecosystem</span>
                </div>
              </motion.div>
              
              <Button 
                variant="ghost" size="icon" onClick={() => setIsOpen(false)} 
                className="absolute top-6 right-8 text-white/30 hover:text-white rounded-full bg-white/5"
              >
                <X size={22} />
              </Button>
            </div>

            {/* الروابط التفاعلية لجميع الصفحات المكتشفة في المشروع */}
            <nav className="flex-1 px-6 py-8 space-y-4 overflow-y-auto custom-scrollbar">
              <MenuLink to="/" icon={<Home size={20}/>} label="The Arena" sub="Lobby & Main Wheel" active={location.pathname === '/'} onClick={() => playSound('click')} />
              
              {isLoggedIn && (
                <>
                  <p className="text-[9px] text-white/20 font-bold uppercase tracking-[0.3em] pt-4 px-4">Player Profile</p>
                  <MenuLink to="/profile" icon={<User size={20}/>} label="Commander" sub="Stats & Progress" active={location.pathname === '/profile'} onClick={() => playSound('click')} />
                  <MenuLink to="/achievements" icon={<Trophy size={20}/>} label="Grand Hall" sub="Global Rankings" active={location.pathname === '/achievements'} onClick={() => playSound('click')} />
                  <MenuLink to="/vip-benefits" icon={<Gem size={20}/>} label="VIP Perks" sub="Exclusive Rewards" active={location.pathname === '/vip-benefits'} onClick={() => playSound('click')} />
                  
                  <p className="text-[9px] text-white/20 font-bold uppercase tracking-[0.3em] pt-4 px-4">Financials</p>
                  <MenuLink to="/withdrawals" icon={<Wallet size={20}/>} label="Iron Vault" sub="Withdraw Pi" active={location.pathname === '/withdrawals'} onClick={() => playSound('click')} />
                  <MenuLink to="/history" icon={<History size={20}/>} label="Spin Log" sub="Transaction History" active={location.pathname === '/history'} onClick={() => playSound('click')} />
                  
                  <p className="text-[9px] text-white/20 font-bold uppercase tracking-[0.3em] pt-4 px-4">Ecosystem</p>
                  <MenuLink to="/marketplace" icon={<ShoppingBag size={20}/>} label="Marketplace" sub="NFTs & Items" active={location.pathname === '/marketplace'} onClick={() => playSound('click')} />
                  <MenuLink to="/legal" icon={<Scale size={20}/>} label="Legal" sub="Terms & Privacy" active={location.pathname === '/legal'} onClick={() => playSound('click')} />
                </>
              )}

              {isAdmin && (
                <div className="mt-6 pt-4 border-t border-white/5">
                  <MenuLink to="/admin" icon={<LayoutDashboard size={20} className="text-red-400"/>} label="Core Control" sub="Admin Dashboard" active={location.pathname === '/admin'} onClick={() => playSound('click')} />
                </div>
              )}
            </nav>

            {/* الفوتر: الخروج أو وضع الضيف */}
            <div className="p-8 bg-black/50 border-t border-white/5">
              {isLoggedIn ? (
                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(239, 68, 68, 0.15)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { playSound('click'); onLogout?.(); setIsOpen(false); }}
                  className="w-full py-4 rounded-3xl bg-red-500/10 border border-red-500/30 text-red-500 font-black text-[11px] tracking-widest uppercase flex items-center justify-center gap-3 transition-all"
                >
                  <LogOut size={18} />
                  Terminate Session
                </motion.button>
              ) : (
                <div className="flex items-center justify-center gap-3 text-white/10 italic">
                  <Crown size={16} />
                  <span className="text-[10px] font-black tracking-[0.4em] uppercase">Guest Protocol v1.2</span>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1, rotate: 3 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleOpen}
        className="relative z-50 p-3 text-white/90 hover:text-purple-400 transition-colors drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]"
      >
        <Menu size={38} />
      </motion.button>
      {typeof document !== 'undefined' && createPortal(MenuContent, document.body)}
    </>
  );
}

function MenuLink({ to, icon, label, sub, active, onClick }: any) {
  return (
    <Link to={to} onClick={onClick} className="group block">
      <motion.div
        whileHover={{ x: 8 }}
        className={`flex items-center gap-4 p-4 rounded-[28px] transition-all duration-300 border ${
          active 
          ? 'bg-gradient-to-r from-purple-600/30 to-transparent border-purple-500/60 shadow-[0_15px_40px_rgba(168,85,247,0.15)]' 
          : 'bg-white/[0.02] border-white/[0.04] hover:border-white/10 hover:bg-white/[0.05]'
        }`}
      >
        <div className={`p-3 rounded-2xl transition-all shadow-inner ${active ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)]' : 'bg-black/40 text-purple-400 group-hover:text-purple-300'}`}>
          {icon}
        </div>
        <div className="flex-1 overflow-hidden">
          <span className={`block text-[13px] font-black tracking-tight uppercase truncate ${active ? 'text-white' : 'text-white/80 group-hover:text-white'}`}>{label}</span>
          <span className="text-[9px] text-white/20 font-bold uppercase tracking-tighter truncate block">{sub}</span>
        </div>
        <ChevronRight size={16} className={`transition-all ${active ? 'text-purple-400' : 'text-white/5 group-hover:text-purple-400 group-hover:translate-x-1'}`} />
      </motion.div>
    </Link>
  );
}
