import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, User, Trophy, Wallet, LogOut, ChevronRight, Zap, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MobileMenu({ isLoggedIn, onLogout }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const playSound = useCallback((type: 'open' | 'click') => {
    const audio = new Audio(
      type === 'open' 
        ? 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3' 
        : 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'
    );
    audio.volume = 0.15;
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
          {/* خلفية Blur سينمائية عميقة */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            style={{ 
              position: 'fixed', inset: 0, zIndex: 99999, 
              background: 'rgba(7, 8, 12, 0.85)',
              backdropFilter: 'blur(16px)' 
            }}
          />

          {/* لوحة المنيو الفاخرة - بتصميم منحني وألوان متدرجة */}
          <motion.div
            initial={{ x: '100%', filter: 'blur(10px)' }}
            animate={{ x: 0, filter: 'blur(0px)' }}
            exit={{ x: '100%', filter: 'blur(10px)' }}
            transition={{ type: 'spring', damping: 28, stiffness: 200 }}
            style={{ 
              position: 'fixed', top: '10px', right: '10px', bottom: '10px', width: '320px', 
              zIndex: 100000, backgroundColor: '#0F111A', 
              borderRadius: '32px', border: '1px solid rgba(168, 85, 247, 0.2)',
              boxShadow: '-20px 0 80px rgba(0,0,0,0.8), inset 0 0 20px rgba(168, 85, 247, 0.05)',
              display: 'flex', flexDirection: 'column', overflow: 'hidden'
            }}
          >
            {/* Header: شعار مضيء */}
            <div className="relative p-8 pt-12 text-center border-b border-white/5 bg-gradient-to-b from-purple-900/10 to-transparent">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-block p-4 rounded-3xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-[0_0_30px_rgba(168,85,247,0.4)] mb-4"
              >
                <Zap size={32} className="text-white fill-white" />
              </motion.div>
              <h2 className="text-2xl font-black text-white tracking-widest italic">SPIN<span className="text-purple-500">4PI</span></h2>
              <p className="text-[10px] text-purple-300/50 font-bold uppercase tracking-[0.4em] mt-1 text-center">Elite Navigation</p>
              
              <Button 
                variant="ghost" size="icon" onClick={() => setIsOpen(false)} 
                className="absolute top-6 right-6 text-white/30 hover:text-white rounded-full bg-white/5"
              >
                <X size={20} />
              </Button>
            </div>

            {/* Navigation: روابط بتأثير حركي متسلسل */}
            <nav className="flex-1 px-6 py-8 space-y-4 overflow-y-auto">
              <MenuLink to="/" icon={<Home />} label="The Arena" delay={0.1} onClick={() => {playSound('click'); setIsOpen(false);}} />
              {isLoggedIn && (
                <>
                  <MenuLink to="/profile" icon={<User />} label="Commander" delay={0.2} onClick={() => {playSound('click'); setIsOpen(false);}} />
                  <MenuLink to="/withdrawals" icon={<Wallet />} label="Iron Vault" delay={0.3} onClick={() => {playSound('click'); setIsOpen(false);}} />
                  <MenuLink to="/achievements" icon={<Trophy />} label="Grand Hall" delay={0.4} onClick={() => {playSound('click'); setIsOpen(false);}} />
                </>
              )}
            </nav>

            {/* Footer: منطقة الخروج بتصميم نيون */}
            <div className="p-8 bg-black/40 border-t border-white/5">
              {isLoggedIn ? (
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(239, 68, 68, 0.2)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { playSound('click'); onLogout?.(); setIsOpen(false); }}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-500/10 to-red-900/10 border border-red-500/20 text-red-500 font-black text-xs tracking-widest uppercase transition-all"
                >
                  Terminate Link
                </motion.button>
              ) : (
                <div className="flex items-center justify-center gap-2 text-purple-400/40 italic">
                  <Crown size={14} />
                  <span className="text-[10px] font-bold tracking-widest uppercase">Guest Mode</span>
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
        whileHover={{ scale: 1.1, rotate: -5 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleOpen}
        className="relative z-50 p-2 text-white/90 hover:text-purple-400 transition-colors"
      >
        <Menu size={36} />
      </motion.button>
      {typeof document !== 'undefined' && createPortal(MenuContent, document.body)}
    </>
  );
}

function MenuLink({ to, icon, label, delay, onClick }: any) {
  return (
    <motion.div
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay }}
    >
      <Link to={to} onClick={onClick} className="group block">
        <div className="flex items-center gap-5 p-5 rounded-2xl bg-white/5 border border-white/5 group-hover:bg-purple-600/10 group-hover:border-purple-500/40 transition-all duration-300">
          <div className="text-purple-400 group-hover:text-purple-300 group-hover:scale-110 transition-transform">
            {icon}
          </div>
          <span className="flex-1 text-sm font-bold text-white/80 group-hover:text-white tracking-wide uppercase">{label}</span>
          <ChevronRight size={16} className="text-white/10 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
        </div>
      </Link>
    </motion.div>
  );
}
