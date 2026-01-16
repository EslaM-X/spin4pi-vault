import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, User, Trophy, Wallet, LogOut, ChevronRight, Star, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MobileMenu({ isLoggedIn, onLogout }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // وظيفة لتشغيل أصوات الواجهة الفاخرة
  const playSound = useCallback((type: 'open' | 'click') => {
    const audio = new Audio(
      type === 'open' 
        ? 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3' // صوت سحب ناعم
        : 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3' // صوت نقرة خفيفة
    );
    audio.volume = 0.2;
    audio.play().catch(() => {}); // تجنب أخطاء المتصفح إذا لم يتفاعل المستخدم بعد
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleOpen = () => {
    playSound('open');
    setIsOpen(true);
  };

  const MenuContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* خلفية Blur سينمائية مع تعتيم متدرج */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            style={{ 
              position: 'fixed', inset: 0, zIndex: 99999, 
              background: 'radial-gradient(circle at center, rgba(15, 17, 23, 0.4) 0%, rgba(0,0,0,0.9) 100%)',
              backdropFilter: 'blur(20px)' 
            }}
          />

          {/* لوحة القائمة الملكية */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 180 }}
            style={{ 
              position: 'fixed', top: 0, right: 0, height: '100%', width: '320px', 
              zIndex: 100000, backgroundColor: '#0A0C10', 
              boxShadow: '-20px 0 60px rgba(0,0,0,1)', 
              display: 'flex', flexDirection: 'column',
              borderLeft: '2px solid rgba(168, 85, 247, 0.3)'
            }}
          >
            {/* Header: تصميم مستوحى من كروت الـ VIP */}
            <div className="relative p-10 border-b border-white/5 bg-gradient-to-br from-purple-900/20 via-transparent to-transparent">
              <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 blur-[60px] rounded-full" />
              
              <div className="relative flex justify-between items-start">
                <div>
                  <motion.h2 
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-3xl font-black italic tracking-tighter"
                  >
                    <span className="text-white">SPIN</span>
                    <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-yellow-500 bg-clip-text text-transparent">4PI</span>
                  </motion.h2>
                  <div className="flex items-center gap-2 mt-2 px-2 py-1 bg-white/5 rounded-full w-fit border border-white/10">
                    <ShieldCheck size={12} className="text-purple-400" />
                    <span className="text-[9px] uppercase tracking-widest text-purple-200 font-bold">Verified Interface</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-all">
                  <X size={32} />
                </Button>
              </div>
            </div>

            {/* Navigation: روابط بتأثيرات حركية فاخرة */}
            <nav className="flex-1 px-6 py-8 space-y-5 overflow-y-auto">
              <MenuLink to="/" icon={<Home size={22} />} label="Gaming Lobby" sub="Return to main wheel" active={location.pathname === '/'} onClick={() => {playSound('click'); setIsOpen(false);}} />
              
              {isLoggedIn && (
                <>
                  <MenuLink to="/profile" icon={<User size={22} />} label="Personal Profile" sub="Check your statistics" active={location.pathname === '/profile'} onClick={() => {playSound('click'); setIsOpen(false);}} />
                  <MenuLink to="/withdrawals" icon={<Wallet size={22} />} label="Financial Vault" sub="Wallet & Transactions" active={location.pathname === '/withdrawals'} onClick={() => {playSound('click'); setIsOpen(false);}} />
                  <MenuLink to="/achievements" icon={<Trophy size={22} />} label="Hall of Fame" sub="Global rankings" active={location.pathname === '/achievements'} onClick={() => {playSound('click'); setIsOpen(false);}} />
                </>
              )}
            </nav>

            {/* Footer: منطقة الخروج بتصميم معتم وراقي */}
            <div className="p-8 bg-black/60 border-t border-white/10">
              {isLoggedIn && (
                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { playSound('click'); onLogout?.(); setIsOpen(false); }}
                  className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 font-black text-xs tracking-widest shadow-[0_0_30px_rgba(239,68,68,0.1)] transition-all"
                >
                  <LogOut size={18} />
                  TERMINATE SESSION
                </motion.button>
              )}
              <div className="mt-6 text-center">
                <p className="text-[9px] text-white/20 font-bold tracking-[0.3em]">PI NETWORK • CRYPTO-GAMING ECOSYSTEM</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleOpen}
        className="p-3 text-white/90 hover:text-white"
      >
        <Menu size={36} />
      </motion.button>
      {typeof document !== 'undefined' && createPortal(MenuContent, document.body)}
    </>
  );
}

function MenuLink({ to, icon, label, sub, active, onClick }: any) {
  return (
    <Link to={to} onClick={onClick} className="block">
      <motion.div
        whileHover={{ x: 8, backgroundColor: 'rgba(255,255,255,0.08)' }}
        className={`flex items-center gap-5 p-5 rounded-2xl transition-all border ${
          active 
          ? 'bg-gradient-to-r from-purple-600/20 to-transparent border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.2)]' 
          : 'bg-white/5 border-white/5 hover:border-white/10'
        }`}
      >
        <div className={`p-3 rounded-xl shadow-inner ${active ? 'bg-purple-500 text-white' : 'bg-[#151921] text-purple-400'}`}>
          {icon}
        </div>
        <div className="flex-1">
          <p className={`text-sm font-black tracking-tight ${active ? 'text-white' : 'text-white/80'}`}>{label}</p>
          <p className="text-[10px] text-white/30 font-medium">{sub}</p>
        </div>
        <ChevronRight size={18} className={`${active ? 'text-purple-400' : 'text-white/10'}`} />
      </motion.div>
    </Link>
  );
}
