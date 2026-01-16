import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, User, Trophy, Crown, Wallet, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MobileMenu({ isLoggedIn, isAdmin = false, onLogout }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { setIsOpen(false); }, [location.pathname]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        // رفعنا التريجر ليكون فوق الهيدر نفسه
        className="relative z-[120] text-white"
      >
        <Menu className="w-8 h-8" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* الخلفية المظلمة - فرضنا الـ Z-index بـ style مباشر */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              style={{ zIndex: 9999, position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(12px)' }}
            />

            {/* لوحة القائمة - فرضنا Z-index أعلى من الخلفية */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{ zIndex: 10000, position: 'fixed', top: 0, right: 0, height: '100%', width: '280px', backgroundColor: '#1A1F2C', borderLeft: '1px solid rgba(255,255,255,0.1)', boxShadow: '-10px 0 50px rgba(0,0,0,0.8)' }}
              className="flex flex-col"
            >
              {/* محتوى القائمة */}
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-purple-900/20">
                <span className="text-xl font-bold text-white">Spin4Pi Menu</span>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/10">
                  <X className="w-8 h-8" />
                </Button>
              </div>

              <nav className="flex-1 p-4 space-y-3 overflow-y-auto">
                <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 text-white hover:bg-purple-500/20 transition-all">
                  <Home className="text-purple-400" /> <span>Home</span>
                </Link>
                {isLoggedIn && (
                  <>
                    <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 text-white hover:bg-purple-500/20 transition-all">
                      <User className="text-purple-400" /> <span>Profile</span>
                    </Link>
                    <Link to="/withdrawals" onClick={() => setIsOpen(false)} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 text-white hover:bg-purple-500/20 transition-all">
                      <Wallet className="text-purple-400" /> <span>Wallet</span>
                    </Link>
                  </>
                )}
              </nav>

              <div className="p-6 border-t border-white/5 bg-black/40">
                {isLoggedIn && (
                  <Button onClick={() => { onLogout?.(); setIsOpen(false); }} className="w-full bg-red-500/20 text-red-500 hover:bg-red-500/40 border border-red-500/50">
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </Button>
                )}
                <p className="text-center text-[10px] text-white/20 mt-4">v1.0.0 • Pi Network</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
