import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Home,
  User,
  Trophy,
  Crown,
  ShoppingBag,
  Wallet,
  Shield,
  Settings,
  BarChart3,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  requiresAuth?: boolean;
  isAdmin?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Profile', href: '/profile', icon: User, requiresAuth: true },
  { label: 'Achievements', href: '/achievements', icon: Trophy, requiresAuth: true },
  { label: 'VIP Benefits', href: '/vip', icon: Crown },
  { label: 'NFT Marketplace', href: '/marketplace', icon: ShoppingBag, requiresAuth: true },
  { label: 'Withdrawal History', href: '/withdrawals', icon: Wallet, requiresAuth: true },
  { label: 'Admin Dashboard', href: '/admin', icon: BarChart3, isAdmin: true },
  { label: 'Terms & Privacy', href: '/legal', icon: FileText },
];

interface MobileMenuProps {
  isLoggedIn: boolean;
  isAdmin?: boolean;
}

export function MobileMenu({ isLoggedIn, isAdmin = false }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const filteredItems = navItems.filter((item) => {
    if (item.isAdmin && !isAdmin) return false;
    if (item.requiresAuth && !isLoggedIn) return false;
    return true;
  });

  return (
    <>
      {/* Hamburger Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="relative z-50"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </Button>

      {/* Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-card border-l border-border shadow-2xl z-50 overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-lg font-display font-bold">
                  <span className="text-gradient-gold">Spin</span>
                  <span className="text-foreground">4</span>
                  <span className="text-gradient-purple">Pi</span>
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Navigation Links */}
              <nav className="p-4">
                <ul className="space-y-2">
                  {filteredItems.map((item) => {
                    const isActive = location.pathname === item.href;
                    const Icon = item.icon;

                    return (
                      <motion.li
                        key={item.href}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: filteredItems.indexOf(item) * 0.05 }}
                      >
                        <Link
                          to={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                            isActive
                              ? 'bg-primary/20 text-primary border border-primary/30'
                              : 'hover:bg-muted text-foreground'
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                          <span className="font-medium">{item.label}</span>
                          {item.isAdmin && (
                            <span className="ml-auto text-xs bg-pi-purple/20 text-pi-purple px-2 py-0.5 rounded">
                              Admin
                            </span>
                          )}
                        </Link>
                      </motion.li>
                    );
                  })}
                </ul>
              </nav>

              {/* Footer */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-card">
                <p className="text-xs text-muted-foreground text-center">
                  Powered by Pi Network
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
