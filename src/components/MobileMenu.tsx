import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu, X, Home, User, Trophy, Crown, 
  ShoppingBag, Wallet, BarChart3, FileText, 
  Zap, Gift, LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  requiresAuth?: boolean;
  isAdmin?: boolean;
  description?: string;
}

const navItems: NavItem[] = [
  { label: 'Home', href: '/', icon: Home, description: 'Main game area' },
  { label: 'My Profile', href: '/profile', icon: User, requiresAuth: true, description: 'Stats & history' },
  { label: 'Achievements', href: '/achievements', icon: Trophy, requiresAuth: true, description: 'Badges & rewards' },
  { label: 'VIP Benefits', href: '/vip', icon: Crown, description: 'Exclusive perks' },
  { label: 'NFT Marketplace', href: '/marketplace', icon: ShoppingBag, requiresAuth: true, description: 'Power-ups & boosts' },
  { label: 'Withdrawals', href: '/withdrawals', icon: Wallet, requiresAuth: true, description: 'Transaction history' },
  { label: 'Admin Panel', href: '/admin', icon: BarChart3, isAdmin: true, description: 'Manage app' },
  { label: 'Terms & Privacy', href: '/legal', icon: FileText, description: 'Legal documents' },
];

interface MobileMenuProps {
  isLoggedIn: boolean;
  isAdmin?: boolean;
  onLogout?: () => void;
}

export function MobileMenu({ isLoggedIn, isAdmin = false, onLogout }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const filteredItems = navItems.filter((item) => {
    if (item.isAdmin && !isAdmin) return false;
    if (item.requiresAuth && !isLoggedIn) return false;
    return true;
  });

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="relative z-50 hover:bg-primary/10"
      >
        <Menu className="w-8 h-8 text-foreground" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* الخلفية المظلمة مع بلور عالي z-index لضمان تغطية اللعبة */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[150] bg-black/70 backdrop-blur-md"
            />

            {/* لوحة المنيو الجانبية */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[85%] sm:w-96 z-[151] shadow-[-10px_0_30px_rgba(0,0,0,0.5)]"
            >
              <div className="relative h-full bg-[#1A1F2C] border-l border-white/10 flex flex-col overflow-hidden">
                
                {/* Header المنيو */}
                <div className="flex items-center justify-between p-6 border-b border-white/5 bg-gradient-to-r from-purple-900/20 to-transparent">
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-purple-500 bg-clip-text text-transparent">
                      Spin4Pi
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">Smart Navigation</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/10">
                    <X className="w-8 h-8" />
                  </Button>
                </div>

                {/* Quick Actions */}
                {isLoggedIn && (
                  <div className="p-4 border-b border-white/5 grid grid-cols-2 gap-3">
                    <Link to="/" onClick={() => setIsOpen(false)} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                      <Zap className="w-5 h-5 text-purple-400" />
                      <span className="text-xs font-medium">Quick Spin</span>
                    </Link>
                    <Link to="/vip" onClick={() => setIsOpen(false)} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                      <Gift className="w-5 h-5 text-yellow-500" />
                      <span className="text-xs font-medium">VIP Status</span>
                    </Link>
                  </div>
                )}

                {/* روابط القائمة */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                  {filteredItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all group"
                      >
                        <div className="p-2 rounded-lg bg-white/5 group-hover:bg-purple-500/20 transition-colors">
                          <Icon className="w-5 h-5 text-gray-400 group-hover:text-purple-400" />
                        </div>
                        <div>
                          <span className="block font-medium text-gray-200 group-hover:text-white">{item.label}</span>
                          <span className="block text-[10px] text-muted-foreground">{item.description}</span>
                        </div>
                      </Link>
                    );
                  })}
                </nav>

                {/* Footer تسجيل الخروج */}
                <div className="p-6 border-t border-white/5 bg-black/20">
                  {isLoggedIn && onLogout && (
                    <Button
                      variant="ghost"
                      onClick={() => { onLogout(); setIsOpen(false); }}
                      className="w-full mb-4 text-red-400 hover:bg-red-500/10 hover:text-red-500 border border-red-500/10"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Disconnect Wallet
                    </Button>
                  )}
                  <p className="text-center text-[10px] text-muted-foreground/60 uppercase tracking-widest">
                    Powered by Pi Network • v1.0.0
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
