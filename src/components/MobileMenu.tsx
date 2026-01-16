import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, User, Trophy, Wallet, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MobileMenu({ isLoggedIn, onLogout }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { setIsOpen(false); }, [location.pathname]);

  const MenuContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 1. خلفية التعتيم - نستخدم لون أسود شبه كامل لعزل اللعبة */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            style={{ 
              position: 'fixed', inset: 0, zIndex: 99999, 
              backgroundColor: 'rgba(0,0,0,0.95)', // عتامة عالية جداً
              backdropFilter: 'blur(10px)' 
            }}
          />

          {/* 2. لوحة القائمة - نستخدم لوناً مصمتاً (Solid) لمنع الشفافية تماماً */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{ 
              position: 'fixed', top: 0, right: 0, height: '100%', width: '300px', 
              zIndex: 100000, 
              backgroundColor: '#11141D', // لون داكن جداً مصمت وليس شفافاً
              boxShadow: '-10px 0 50px #000', 
              display: 'flex', flexDirection: 'column',
              borderLeft: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            {/* رأس القائمة بخلفية ثابتة */}
            <div style={{ backgroundColor: '#1A1F2C' }} className="p-6 border-b border-white/10 flex justify-between items-center">
              <span className="text-xl font-bold text-white">Spin4Pi Menu</span>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white">
                <X size={30} />
              </Button>
            </div>

            {/* محتوى الروابط - نلغي أي شفافية هنا */}
            <nav style={{ backgroundColor: '#11141D' }} className="flex-1 p-4 space-y-4 overflow-y-auto">
              <MenuLink to="/" icon={<Home className="text-purple-400" />} label="Home" onClick={() => setIsOpen(false)} />
              
              {isLoggedIn ? (
                <>
                  <MenuLink to="/profile" icon={<User className="text-purple-400" />} label="My Profile" onClick={() => setIsOpen(false)} />
                  <MenuLink to="/withdrawals" icon={<Wallet className="text-purple-400" />} label="Wallet" onClick={() => setIsOpen(false)} />
                  <MenuLink to="/achievements" icon={<Trophy className="text-purple-400" />} label="Rankings" onClick={() => setIsOpen(false)} />
                </>
              ) : (
                <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20 text-center">
                  <p className="text-sm text-purple-300">Login to access more features</p>
                </div>
              )}
            </nav>

            {/* التذييل بخلفية داكنة جداً */}
            <div style={{ backgroundColor: '#0D0F14' }} className="p-6 border-t border-white/10">
              {isLoggedIn && (
                <Button 
                  onClick={() => { onLogout?.(); setIsOpen(false); }} 
                  className="w-full bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white border border-red-600/30 py-6"
                >
                  <LogOut className="w-5 h-5 mr-2" /> Logout
                </Button>
              )}
              <p className="text-center text-[10px] text-white/20 mt-4 uppercase tracking-widest">v1.0.0 • Pi Network</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)} className="text-white hover:bg-white/10">
        <Menu size={32} />
      </Button>
      {typeof document !== 'undefined' && createPortal(MenuContent, document.body)}
    </>
  );
}

// مكون فرعي للروابط لضمان عدم وجود أي شفافية موروثة
function MenuLink({ to, icon, label, onClick }: any) {
  return (
    <Link
      to={to}
      onClick={onClick}
      style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
      className="flex items-center gap-4 p-5 rounded-2xl text-white hover:bg-purple-600/20 transition-all border border-white/5"
    >
      {icon}
      <span className="text-lg font-medium">{label}</span>
    </Link>
  );
}
