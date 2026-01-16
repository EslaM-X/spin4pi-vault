import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, X, Home, User, Trophy, Wallet, LogOut, ChevronRight, 
  Crown, ShieldCheck, History, ShoppingBag, Scale, LayoutDashboard, Gem,
  Volume2, VolumeX, Music
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SoundControls } from './SoundControls'; // تأكد من استيراد مكون الصوت الخاص بك
import logoText from "@/assets/spin4pi-text-logo.png"; 
import logoIcon from "@/assets/spin4pi-logo.png";

export function MobileMenu({ isLoggedIn, onLogout, isAdmin = false }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

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
            {/* الهيدر مع شعار Spin4Pi الرسمي */}
            <div className="relative p-10 pb-6 text-center border-b border-white/5 bg-gradient-to-br from-purple-900/10 via-transparent to-transparent">
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="flex items-center justify-center gap-3">
                  <img src={logoIcon} alt="Icon" className="w-12 h-12 object-contain drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
                  <img src={logoText} alt="Spin4Pi" className="h-8 w-auto object-contain drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
                </div>
                
                {/* قسم التحكم في الصوت الجديد داخل القائمة */}
                <div className="mt-4 w-full px-4 py-3 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between backdrop-blur-md">
                   <div className="flex items-center gap-2">
                      <Music size={14} className="text-purple-400" />
                      <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Audio System</span>
                   </div>
                   <SoundControls /> {/* هنا يتم استدعاء أزرار الصوت لتظهر بشكل مدمج */}
                </div>
              </motion.div>
              
              <Button 
                variant="ghost" size="icon" onClick={() => setIsOpen(false)} 
                className="absolute top-4 right-6 text-white/30 hover:text-white rounded-full"
              >
                <X size={20} />
              </Button>
            </div>

            {/* الروابط التفاعلية */}
            <nav className="flex-1 px-6 py-6 space-y-3 overflow-y-auto custom-scrollbar">
              <MenuLink to="/" icon={<Home size={18}/>} label="The Arena" sub="Lobby & Wheel" active={location.pathname === '/'} onClick={() => playSound('click')} />
              
              {isLoggedIn && (
                <>
                  <p className="text-[8px] text-white/20 font-black uppercase tracking-[0.4em] pt-2 px-4 text-center">Identity</p>
                  <MenuLink to="/profile" icon={<User size={18}/>} label="Profile" sub="Player Stats" active={location.pathname === '/profile'} onClick={() => playSound('click')} />
                  <MenuLink to="/achievements" icon={<Trophy size={18}/>} label="Rankings" sub="Global Hall" active={location.pathname === '/achievements'} onClick={() => playSound('click')} />
                  <MenuLink to="/vip-benefits" icon={<Gem size={18}/>} label="VIP Perks" sub="Exclusives" active={location.pathname === '/vip-benefits'} onClick={() => playSound('click')} />
                  
                  <p className="text-[8px] text-white/20 font-black uppercase tracking-[0.4em] pt-2 px-4 text-center">Assets</p>
                  <MenuLink to="/withdrawals" icon={<Wallet size={18}/>} label="Withdraw" sub="Pi Vault" active={location.pathname === '/withdrawals'} onClick={() => playSound('click')} />
                  <MenuLink to="/withdrawal-history" icon={<History size={18}/>} label="History" sub="Activity Log" active={location.pathname === '/withdrawal-history'} onClick={() => playSound('click')} />
                  <MenuLink to="/marketplace" icon={<ShoppingBag size={18}/>} label="Market" sub="NFT Store" active={location.pathname === '/marketplace'} onClick={() => playSound('click')} />
                </>
              )}

              {isAdmin && (
                <div className="mt-4 pt-4 border-t border-white/5">
                  <MenuLink to="/admin" icon={<LayoutDashboard size={18} className="text-red-400"/>} label="Admin" sub="System Control" active={location.pathname === '/admin'} onClick={() => playSound('click')} />
                </div>
              )}
            </nav>

            {/* الفوتر */}
            <div className="p-8 bg-black/50 border-t border-white/5">
              {isLoggedIn ? (
                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(239, 68, 68, 0.15)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { playSound('click'); onLogout?.(); setIsOpen(false); }}
                  className="w-full py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-black text-[10px] tracking-widest uppercase flex items-center justify-center gap-3 transition-all"
                >
                  <LogOut size={16} />
                  Disconnect
                </motion.button>
              ) : (
                <div className="flex items-center justify-center gap-2 text-white/10 italic">
                  <Crown size={14} />
                  <span className="text-[9px] font-black tracking-[0.5em] uppercase text-center">Guest Access</span>
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
        className="relative z-50 p-3 text-white/90 hover:text-purple-400 transition-colors drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]"
      >
        <Menu size={36} />
      </motion.button>
      {typeof document !== 'undefined' && createPortal(MenuContent, document.body)}
    </>
  );
}

function MenuLink({ to, icon, label, sub, active, onClick }: any) {
  return (
    <Link to={to} onClick={onClick} className="group block">
      <motion.div
        whileHover={{ x: 5 }}
        className={`flex items-center gap-4 p-3.5 rounded-[24px] transition-all duration-300 border ${
          active 
          ? 'bg-gradient-to-r from-purple-600/30 to-transparent border-purple-500/50 shadow-[0_10px_30px_rgba(168,85,247,0.1)]' 
          : 'bg-white/[0.02] border-white/[0.03] hover:border-white/10'
        }`}
      >
        <div className={`p-2.5 rounded-xl transition-all ${active ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'bg-black/40 text-purple-400'}`}>
          {icon}
        </div>
        <div className="flex-1">
          <span className={`block text-[12px] font-black uppercase tracking-tight ${active ? 'text-white' : 'text-white/70'}`}>{label}</span>
          <span className="text-[8px] text-white/20 font-bold uppercase tracking-tighter">{sub}</span>
        </div>
        <ChevronRight size={14} className={active ? 'text-purple-400' : 'text-white/5'} />
      </motion.div>
    </Link>
  );
}
