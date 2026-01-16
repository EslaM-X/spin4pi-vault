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
            style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)' }}
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{ 
              position: 'fixed', top: 0, right: 0, height: '100%', width: '330px', 
              zIndex: 100000, backgroundColor: '#050608', 
              borderLeft: '1px solid rgba(168, 85, 247, 0.2)',
              display: 'flex', flexDirection: 'column'
            }}
          >
            {/* الهيدر اللامع */}
            <div className="relative p-8 pt-12 flex flex-col items-center border-b border-white/5 overflow-hidden">
              <motion.div animate={{ opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 4, repeat: Infinity }} className="absolute inset-0 bg-purple-600/10 blur-[60px]" />
              
              <div className="relative flex items-center gap-3 mb-6">
                <motion.img animate={{ y: [0, -4, 0] }} transition={{ duration: 3, repeat: Infinity }} src={logoIcon} className="w-12 h-12 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
                <h2 className="text-2xl font-black text-white italic tracking-tighter">SPIN<span className="text-purple-500">4PI</span></h2>
              </div>

              {isLoggedIn && (
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-inner">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                      <Wallet size={16} className="text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">Balance</p>
                      <p className="text-base font-black text-yellow-500">{(balance || 0).toFixed(2)} π</p>
                    </div>
                  </div>
                  <Sparkles size={14} className="text-purple-400 animate-pulse" />
                </motion.div>
              )}

              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-white/20 hover:text-white rounded-full">
                <X size={20} />
              </Button>
            </div>

            {/* نظام الصوت المدمج */}
            <div className="px-8 py-3 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music size={14} className="text-purple-500" />
                <span className="text-[9px] font-bold text-white/40 uppercase tracking-[0.2em]">Environment</span>
              </div>
              <SoundControls />
            </div>

            {/* الروابط المقسمة */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
              <MenuLink to="/" icon={<Home size={18}/>} label="The Arena" active={location.pathname === '/'} onClick={() => playSound('click')} />
              
              {isLoggedIn && (
                <>
                  <p className="text-[8px] text-white/20 font-black uppercase tracking-[0.4em] pt-4 pb-2 px-4">Profile</p>
                  <MenuLink to="/profile" icon={<User size={18}/>} label="Account" active={location.pathname === '/profile'} onClick={() => playSound('click')} />
                  <MenuLink to="/achievements" icon={<Trophy size={18}/>} label="Rankings" active={location.pathname === '/achievements'} onClick={() => playSound('click')} />
                  <MenuLink to="/vip-benefits" icon={<Gem size={18}/>} label="VIP Lounge" active={location.pathname === '/vip-benefits'} onClick={() => playSound('click')} />
                  
                  <p className="text-[8px] text-white/20 font-black uppercase tracking-[0.4em] pt-4 pb-2 px-4">Assets</p>
                  <MenuLink to="/withdrawals" icon={<Wallet size={18}/>} label="Vault" active={location.pathname === '/withdrawals'} onClick={() => playSound('click')} />
                  <MenuLink to="/marketplace" icon={<ShoppingBag size={18}/>} label="Market" active={location.pathname === '/marketplace'} onClick={() => playSound('click')} />
                  <MenuLink to="/withdrawal-history" icon={<History size={18}/>} label="History" active={location.pathname === '/withdrawal-history'} onClick={() => playSound('click')} />
                </>
              )}

              {isAdmin && (
                <div className="mt-4 pt-4 border-t border-white/5">
                  <MenuLink to="/admin" icon={<LayoutDashboard size={18} className="text-red-500"/>} label="Admin Engine" active={location.pathname === '/admin'} onClick={() => playSound('click')} />
                </div>
              )}
            </nav>

            <div className="p-8 bg-black">
              {isLoggedIn ? (
                <button onClick={() => { playSound('click'); onLogout?.(); setIsOpen(false); }} className="w-full py-4 rounded-xl bg-red-600/10 border border-red-500/20 text-red-500 font-black text-[10px] tracking-widest uppercase flex items-center justify-center gap-3 transition-all hover:bg-red-600/20">
                  <LogOut size={16} /> Disconnect
                </button>
              ) : (
                <p className="text-[8px] text-white/10 text-center font-bold tracking-[0.4em] uppercase">Secure System v2.0</p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <motion.button whileTap={{ scale: 0.9 }} onClick={handleOpen} className="relative z-50 p-2 text-white/80 hover:text-purple-400">
      <Menu size={36} />
    </motion.button>
  );
}

function MenuLink({ to, icon, label, active, onClick }: any) {
  return (
    <Link to={to} onClick={onClick} className="group block">
      <div className={`flex items-center gap-4 p-4 rounded-xl transition-all ${active ? 'bg-purple-600/10 border border-purple-500/30' : 'hover:bg-white/5 border border-transparent'}`}>
        <div className={`${active ? 'text-purple-400' : 'text-white/40 group-hover:text-purple-400'}`}>{icon}</div>
        <span className={`text-[12px] font-black uppercase tracking-wide ${active ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>{label}</span>
      </div>
    </Link>
  );
}
