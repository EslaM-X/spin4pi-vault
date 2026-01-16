import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, User, Trophy, Wallet, LogOut, ChevronRight, Crown, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from "@/assets/spin4pi-logo.png"; // تأكد من مسار الشعار الصحيح

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
          {/* خلفية غامرة بتركيز بصري عالي */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            style={{ 
              position: 'fixed', inset: 0, zIndex: 99999, 
              background: 'radial-gradient(circle at center, rgba(168, 85, 247, 0.1) 0%, rgba(7, 8, 12, 0.9) 100%)',
              backdropFilter: 'blur(20px)' 
            }}
          />

          {/* لوحة المنيو الأسطورية - تصميم Floating Glass */}
          <motion.div
            initial={{ x: '100%', scale: 0.9, opacity: 0 }}
            animate={{ x: 0, scale: 1, opacity: 1 }}
            exit={{ x: '100%', scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{ 
              position: 'fixed', top: '12px', right: '12px', bottom: '12px', width: '330px', 
              zIndex: 100000, backgroundColor: '#0A0B10', 
              borderRadius: '40px', border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '-20px 0 100px rgba(0,0,0,0.9), inset 0 0 40px rgba(168, 85, 247, 0.05)',
              display: 'flex', flexDirection: 'column', overflow: 'hidden'
            }}
          >
            {/* Header: الشعار مع النص بتنسيق فخم */}
            <div className="relative p-10 pb-8 text-center border-b border-white/5 bg-gradient-to-br from-purple-900/20 via-transparent to-transparent">
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex flex-col items-center gap-4"
              >
                {/* الشعار بجانب الكلمة بشكل متناسق */}
                <div className="flex items-center justify-center gap-3">
                  <img 
                    src={logo} 
                    alt="Spin4Pi Logo" 
                    className="w-12 h-12 object-contain drop-shadow-[0_0_15px_rgba(234,179,8,0.4)]"
                  />
                  <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center">
                    SPIN<span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">4PI</span>
                  </h2>
                </div>
                
                <div className="flex items-center gap-2 px-4 py-1.5 bg-purple-500/10 rounded-full border border-purple-500/20">
                  <ShieldCheck size={14} className="text-purple-400" />
                  <span className="text-[10px] text-purple-200 font-bold uppercase tracking-[0.2em]">Verified Hub</span>
                </div>
              </motion.div>
              
              <Button 
                variant="ghost" size="icon" onClick={() => setIsOpen(false)} 
                className="absolute top-6 right-6 text-white/20 hover:text-white rounded-full bg-white/5 transition-all"
              >
                <X size={20} />
              </Button>
            </div>

            {/* Navigation: الروابط بتأثيرات Neo-Glow */}
            <nav className="flex-1 px-6 py-8 space-y-4 overflow-y-auto custom-scrollbar">
              <MenuLink to="/" icon={<Home size={22}/>} label="The Arena" sub="Back to action" active={location.pathname === '/'} onClick={() => {playSound('click'); setIsOpen(false);}} />
              {isLoggedIn && (
                <>
                  <MenuLink to="/profile" icon={<User size={22}/>} label="Commander" sub="Profile Stats" active={location.pathname === '/profile'} onClick={() => {playSound('click'); setIsOpen(false);}} />
                  <MenuLink to="/withdrawals" icon={<Wallet size={22}/>} label="Iron Vault" sub="Wallet balance" active={location.pathname === '/withdrawals'} onClick={() => {playSound('click'); setIsOpen(false);}} />
                  <MenuLink to="/achievements" icon={<Trophy size={22}/>} label="Grand Hall" sub="Leaderboards" active={location.pathname === '/achievements'} onClick={() => {playSound('click'); setIsOpen(false);}} />
                </>
              )}
            </nav>

            {/* Footer: إنهاء الجلسة بتصميم احترافي */}
            <div className="p-8 bg-black/40 border-t border-white/5">
              {isLoggedIn ? (
                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(239, 68, 68, 0.15)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { playSound('click'); onLogout?.(); setIsOpen(false); }}
                  className="w-full py-4 rounded-2xl bg-red-500/5 border border-red-500/20 text-red-500 font-black text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(239,68,68,0.05)]"
                >
                  <LogOut size={18} />
                  Terminate Session
                </motion.button>
              ) : (
                <div className="flex items-center justify-center gap-2 text-white/10 italic">
                  <Crown size={14} />
                  <span className="text-[10px] font-bold tracking-[0.4em] uppercase">Guest Protocol Active</span>
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
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleOpen}
        className="relative z-50 p-3 text-white/90 hover:text-purple-400 transition-colors drop-shadow-[0_0_10px_rgba(168,85,247,0.3)]"
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
        className={`flex items-center gap-5 p-5 rounded-3xl transition-all duration-300 border ${
          active 
          ? 'bg-gradient-to-r from-purple-600/20 to-transparent border-purple-500/40 shadow-[0_10px_30px_rgba(168,85,247,0.1)]' 
          : 'bg-white/[0.03] border-white/[0.05] hover:border-white/10 hover:bg-white/[0.05]'
        }`}
      >
        <div className={`p-3.5 rounded-2xl transition-all ${active ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]' : 'bg-black/40 text-purple-400 group-hover:text-purple-300'}`}>
          {icon}
        </div>
        <div className="flex-1">
          <span className={`block text-sm font-black tracking-wide uppercase ${active ? 'text-white' : 'text-white/70 group-hover:text-white'}`}>{label}</span>
          <span className="text-[10px] text-white/20 font-bold tracking-tight uppercase">{sub}</span>
        </div>
        <ChevronRight size={18} className={`transition-all ${active ? 'text-purple-400' : 'text-white/5 group-hover:text-purple-400 group-hover:translate-x-1'}`} />
      </motion.div>
    </Link>
  );
}
