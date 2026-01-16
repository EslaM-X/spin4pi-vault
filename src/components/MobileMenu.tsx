import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, User, Trophy, Wallet, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MobileMenu({ isLoggedIn, isAdmin = false, onLogout }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { setIsOpen(false); }, [location.pathname]);

  const MenuContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* خلفية معتمة جداً لعزل اللعبة تماماً */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            style={{ 
              position: 'fixed', inset: 0, zIndex: 99999, 
              backgroundColor: 'rgba(0,0,0,0.92)', // زيادة التعتيم
              backdropFilter: 'blur(8px)' 
            }}
          />

          {/* لوحة القائمة - تم تغيير اللون ليكون مصمتاً وغير شفاف */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{ 
              position: 'fixed', top: 0, right: 0, height: '100%', width: '280px', 
              zIndex: 100000, 
              backgroundColor: '#11141D', // لون داكن جداً ومصمت
              boxShadow: '-10px 0 50px rgba(0,0,0,1)', 
              display: 'flex', flexDirection: 'column',
              opacity: '1 !important' // فرض العتامة الكاملة
            }}
          >
            {/* الجزء العلوي من القائمة */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#1A1F2C]">
              <span className="text-xl font-bold text-white">Spin4Pi Menu</span>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/10">
                <X size={28} />
              </Button>
            </div>

            {/* الروابط مع خلفية تمنع الشفافية */}
            <nav className="flex-1 p-4 space-y-3 overflow-y-auto bg-[#11141D]">
              <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 text-white hover:bg-purple-600/20 border border-white/5">
                <Home className="text-purple-400" /> <span className="font-medium">Home</span>
              </Link>
              {isLoggedIn && (
                <>
                  <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 text-white">
                    <User className="text-purple-400" /> <span className="font-medium">Profile</span>
                  </Link>
                  <Link to="/withdrawals" onClick={() => setIsOpen(false)} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 text-white">
                    <Wallet className="text-purple-400" /> <span className="font-medium">Wallet</span>
                  </Link>
                </>
              )}
            </nav>

            {/* زر تسجيل الخروج */}
            <div className="p-6 border-t border-white/10 bg-[#0D0F14]">
              {isLoggedIn && (
                <Button onClick={() => { onLogout?.(); setIsOpen(false); }} className="w-full bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white border border-red-600/30">
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </Button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)} className="text-white">
        <Menu size={32} />
      </Button>
      {typeof document !== 'undefined' && createPortal(MenuContent, document.body)}
    </>
  );
}
