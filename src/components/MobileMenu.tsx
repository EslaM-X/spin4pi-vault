import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, X, Home, User, Trophy, Wallet, LogOut, ChevronRight, 
  Crown, ShieldCheck, History, ShoppingBag, Scale, LayoutDashboard, Gem,
  Music, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SoundControls } from './SoundControls';
import logoText from "@/assets/spin4pi-text-logo.png"; 
import logoIcon from "@/assets/spin4pi-logo.png";

export function MobileMenu({ isLoggedIn, onLogout, isAdmin = false, balance = 0 }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const playSound = useCallback((type: 'open' | 'click') => {
    const audio = new Audio(
      type === 'open' 
        ? 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3' 
        : 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'
    );
    audio.volume = 0.1;
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            style={{ 
              position: 'fixed', inset: 0, zIndex: 99999, 
              background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(20px)' 
            }}
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{ 
              position: 'fixed', top: 0, right: 0, height: '100%', width: '340px', 
              zIndex: 100000, backgroundColor: '#050608', 
              boxShadow: '-10px 0 50px rgba(0,0,0,1)',
              display: 'flex', flexDirection: 'column',
              borderLeft: '1px solid rgba(168, 85, 247, 0.2)'
            }}
          >
            {/* 1. شعار علوي مع تأثير البريق المتحرك */}
            <div className="relative p-8 pt-12 flex flex-col items-center border-b border-white/5 overflow-hidden">
               {/* تأثير ضوء متحرك في الخلفية */}
              <motion.div 
                animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.2, 1] }} 
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute inset-0 bg-purple-600/10 blur-[80px] rounded-full" 
              />
              
              <div className="relative flex items-center gap-3 mb-6">
                <motion.img 
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  src={logoIcon} className="w-14 h-14 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" 
                />
                <img src={logoText} className="h-8 w-auto brightness-125" />
              </div>

              {/* 2. بطاقة رصيد VIP مدمجة */}
              {isLoggedIn && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full bg-gradient-to-r from-purple-900/40 to-transparent border border-white/10 rounded-3xl p-4 flex items-center justify-between shadow-inner"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                      <Wallet size={18} className="text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Available Balance</p>
                      <p className="text-lg font-black text-yellow-500 tracking-tight">{balance.toFixed(2)} <span className="text-xs">π</span></p>
                    </div>
                  </div>
                  <Sparkles size={16} className="text-purple-400 animate-pulse" />
                </motion.div>
              )}

              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="absolute top-6 right-6 text-white/20 hover:text-white rounded-full bg-white/5">
                <X size={20} />
              </Button>
            </div>

            {/* 3. التحكم في الصوت بتصميم "Cyberpunk" */}
            <div className="px-8 py-4 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music size={14} className="text-purple-500" />
                <span className="text-[9px] font-bold text-white/40 uppercase tracking-[0.3em]">Audio Environment</span>
              </div>
              <div className="scale-90 origin-right">
                <SoundControls />
              </div>
            </div>

            {/* 4. قائمة الروابط المقسمة بذكاء */}
            <nav className="flex-1 px-6 py-6 space-y-2 overflow-y-auto custom-scrollbar">
              <MenuLink to="/" icon={<Home size={20}/>} label="The Arena" sub="Main Gaming Floor" active={location.pathname === '/'} />
              
              {isLoggedIn && (
                <>
                  <SectionTitle title="Player Base" />
                  <MenuLink to="/profile" icon={<User size={20}/>} label="My Identity" sub="Achievements & Stats" active={location.pathname === '/profile'} />
                  <MenuLink to="/vip-benefits" icon={<Gem size={20}/>} label="VIP Lounge" sub="Exclusive Benefits" active={location.pathname === '/vip-benefits'} />
                  <MenuLink to="/achievements" icon={<Trophy size={20}/>} label="Global Ranks" sub="Leaderboard" active={location.pathname === '/achievements'} />
                  
                  <SectionTitle title="Assets & Trade" />
                  <MenuLink to="/withdrawals" icon={<Wallet size={20}/>} label="Vault" sub="Withdraw Funds" active={location.pathname === '/withdrawals'} />
                  <MenuLink to="/marketplace" icon={<ShoppingBag size={20}/>} label="Market" sub="NFT Items" active={location.pathname === '/marketplace'} />
                  <MenuLink to="/withdrawal-history" icon={<History size={20}/>} label="Ledger" sub="Transaction History" active={location.pathname === '/withdrawal-history'} />
                </>
              )}

              {isAdmin && (
                <div className="mt-4 pt-4 border-t border-white/5">
                  <MenuLink to="/admin" icon={<LayoutDashboard size={20} className="text-red-500"/>} label="Core Engine" sub="System Admin" active={location.pathname === '/admin'} />
                </div>
              )}
            </nav>

            {/* 5. تذييل فاخر مع زر تسجيل خروج سينمائي */}
            <div className="p-8 bg-black">
              {isLoggedIn ? (
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(239, 68, 68, 0.2)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { playSound('click'); onLogout?.(); setIsOpen(false); }}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600/20 to-red-900/20 border border-red-500/30 text-red-500 font-black text-[11px] tracking-widest uppercase flex items-center justify-center gap-3"
                >
                  <LogOut size={16} />
                  Terminate Link
                </motion.button>
              ) : (
                <div className="flex items-center justify-center gap-2 opacity-20">
                  <ShieldCheck size={14} className="text-white" />
                  <span className="text-[9px] font-bold tracking-[0.5em] uppercase text-white">Secure Encrypted</span>
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
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleOpen}
        className="relative z-50 p-2 text-white/80 hover:text-purple-400 transition-colors"
      >
        <Menu size={36} />
      </motion.button>
      {typeof document !== 'undefined' && createPortal(MenuContent, document.body)}
    </>
  );
}

// مكونات فرعية للتنظيم
function SectionTitle({ title }: { title: string }) {
  return <p className="text-[9px] text-white/20 font-black uppercase tracking-[0.3em] pt-4 pb-2 px-4">{title}</p>;
}

function MenuLink({ to, icon, label, sub, active }: any) {
  return (
    <Link to={to} className="group block">
      <motion.div
        whileHover={{ x: 6, backgroundColor: 'rgba(168, 85, 247, 0.05)' }}
        className={`flex items-center gap-4 p-4 rounded-2xl transition-all border ${
          active 
          ? 'bg-purple-600/10 border-purple-500/40 shadow-lg' 
          : 'bg-transparent border-transparent hover:border-white/5'
        }`}
      >
        <div className={`p-2.5 rounded-xl ${active ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168, 85, 247, 0.4)]' : 'bg-white/5 text-purple-400 group-hover:text-white transition-colors'}`}>
          {icon}
        </div>
        <div className="flex-1">
          <span className={`block text-[13px] font-black tracking-tight uppercase ${active ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>{label}</span>
          <span className="text-[9px] text-white/20 font-bold group-hover:text-white/40 transition-colors uppercase">{sub}</span>
        </div>
        <ChevronRight size={14} className={`transition-all ${active ? 'text-purple-400' : 'text-white/5 group-hover:text-purple-400'}`} />
      </motion.div>
    </Link>
  );
}
