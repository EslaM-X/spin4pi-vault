import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, User, Trophy, Crown, Wallet, LogOut, Zap, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileMenuProps {
  isLoggedIn: boolean;
  isAdmin?: boolean;
  onLogout?: () => void;
}

export function MobileMenu({ isLoggedIn, isAdmin = false, onLogout }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { setIsOpen(false); }, [location.pathname]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        // تأكد أن زر المنيو نفسه له z-index عالي
        className="relative z-[110] text-white"
      >
        <Menu className="w-8 h-8" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* الخلفية المعتمة - أعلى z-index ممكن */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[998] bg-black/90 backdrop-blur-lg"
            />

            {/* لوحة القائمة - تظهر فوق الخلفية المعتمة */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[280px] z-[999] bg-[#1A1F2C] border-l border-white/10 shadow-2xl flex flex-col"
            >
              {/* ترويسة القائمة */}
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <span className="text-xl font-bold bg-gradient-to-r from-yellow-500 to-purple-500 bg-clip-text text-transparent">
                  Spin4Pi
                </span>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/10">
                  <X className="w-8 h-8" />
                </Button>
              </div>

              {/* روابط القائمة */}
              <nav className="flex-1 p-4 space-y-2">
                <MenuLink to="/" icon={<Home size={20}/>} label="Home" onClick={() => setIsOpen(false)} />
                {isLoggedIn && (
                  <>
                    <MenuLink to="/profile" icon={<User size={20}/>} label="Profile" onClick={() => setIsOpen(false)} />
                    <MenuLink to="/withdrawals" icon={<Wallet size={20}/>} label="Wallet" onClick={() => setIsOpen(false)} />
                    <MenuLink to="/achievements" icon={<Trophy size={20}/>} label="Rank" onClick={() => setIsOpen(false)} />
                  </>
                )}
                <MenuLink to="/vip" icon={<Crown size={20}/>} label="VIP" onClick={() => setIsOpen(false)} />
              </nav>

              {/* تذييل القائمة */}
              <div className="p-6 border-t border-white/5">
                {isLoggedIn && (
                  <Button
                    variant="ghost"
                    onClick={() => { onLogout?.(); setIsOpen(false); }}
                    className="w-full text-red-400 hover:bg-red-500/10 hover:text-red-500 border border-red-500/10 mb-4"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </Button>
                )}
                <p className="text-center text-[10px] text-white/30 tracking-widest uppercase">Pi Network • v1.0.0</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

const MenuLink = ({ to, icon, label, onClick }: any) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white transition-all border border-transparent hover:border-white/5"
  >
    <span className="text-purple-400">{icon}</span>
    <span className="font-medium">{label}</span>
  </Link>
);
